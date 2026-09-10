import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';

let db;

export async function getDb() {
  if (!db) {
    try {
      db = await Database.load('sqlite:habitt.db');
    } catch (e) {
      console.warn('DB not available (web mode):', e);
      return null;
    }
  }
  return db;
}

//  Habits 
export async function createHabit(habit) {
  const database = await getDb();
  if (!database) return { ...habit, id: crypto.randomUUID() };
  const id = crypto.randomUUID();
  await database.execute(
    `INSERT INTO habits (id, name, description, icon, color, category, frequency, target_count, reminder_enabled, reminder_time, custom_days, difficulty, notes_template)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
    [id, habit.name, habit.description || '', habit.icon || '', habit.color || '#22c55e',
     habit.category || 'General', habit.frequency || 'daily', habit.target_count || 1,
     habit.reminder_enabled ? 1 : 0, habit.reminder_time || '', habit.custom_days || '',
     habit.difficulty || 'medium', habit.notes_template || '']
  );
  return { ...habit, id };
}

export async function getHabits() {
  const database = await getDb();
  if (!database) return [];
  return await database.select('SELECT * FROM habits ORDER BY sort_order ASC, created_at DESC');
}

export async function updateHabit(id, updates) {
  const database = await getDb();
  if (!database) return;
  const fields = []; const values = []; let pi = 1;
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') { fields.push(`${key} = $${pi}`); values.push(value); pi++; }
  });
  values.push(id);
  await database.execute(`UPDATE habits SET ${fields.join(', ')} WHERE id = $${pi}`, values);
}

export async function deleteHabit(id) {
  const database = await getDb();
  if (!database) return;
  await database.execute('DELETE FROM completions WHERE habit_id = $1', [id]);
  await database.execute('DELETE FROM habits WHERE id = $1', [id]);
}

//  Completions 
export async function toggleCompletion(habitId, date) {
  const database = await getDb();
  if (!database) return true;
  const existing = await database.select(
    'SELECT * FROM completions WHERE habit_id = $1 AND date = $2', [habitId, date]);
  if (existing.length > 0) {
    await database.execute('DELETE FROM completions WHERE id = $1', [existing[0].id]);
    return false;
  } else {
    const id = crypto.randomUUID();
    await database.execute(
      'INSERT INTO completions (id, habit_id, date, count, note) VALUES ($1, $2, $3, $4, $5)',
      [id, habitId, date, 1, '']);
    return true;
  }
}

export async function logCompletionWithNote(habitId, date, count, note) {
  const database = await getDb();
  if (!database) return;
  const id = crypto.randomUUID();
  try {
    await database.execute(
      'INSERT INTO completions (id, habit_id, date, count, note) VALUES ($1, $2, $3, $4, $5)',
      [id, habitId, date, count, note]);
  } catch {
    await database.execute(
      'UPDATE completions SET count = $1, note = $2 WHERE habit_id = $3 AND date = $4',
      [count, note, habitId, date]);
  }
}

export async function getCompletions() {
  const database = await getDb();
  if (!database) return [];
  return await database.select('SELECT * FROM completions ORDER BY date DESC');
}

//  Journal 
export async function saveJournalEntry(date, entry) {
  const database = await getDb();
  if (!database) return { ...entry, date };
  const existing = await database.select('SELECT * FROM journal_entries WHERE date = $1', [date]);
  if (existing.length > 0) {
    await database.execute(
      `UPDATE journal_entries SET mood = $1, content = $2, gratitude = $3, sleep_hours = $4, energy = $5, tags = $6, updated_at = datetime('now') WHERE date = $7`,
      [entry.mood || 3, entry.content || '', entry.gratitude || '', entry.sleep_hours || null, entry.energy || 3, entry.tags || '', date]);
  } else {
    const id = crypto.randomUUID();
    await database.execute(
      'INSERT INTO journal_entries (id, date, mood, content, gratitude, sleep_hours, energy, tags) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [id, date, entry.mood || 3, entry.content || '', entry.gratitude || '', entry.sleep_hours || null, entry.energy || 3, entry.tags || '']);
  }
  return { ...entry, date };
}

export async function getJournalEntries() {
  const database = await getDb();
  if (!database) return [];
  return await database.select('SELECT * FROM journal_entries ORDER BY date DESC');
}

//  Settings 
export async function getSetting(key) {
  const database = await getDb();
  if (!database) return null;
  const r = await database.select('SELECT value FROM settings WHERE key = $1', [key]);
  return r[0]?.value || null;
}

export async function saveSetting(key, value) {
  const database = await getDb();
  if (!database) return;
  await database.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2`,
    [key, String(value)]);
}

export async function getAllSettings() {
  const database = await getDb();
  if (!database) return {};
  const result = await database.select('SELECT * FROM settings');
  const settings = {};
  result.forEach(s => { try { settings[s.key] = JSON.parse(s.value); } catch { settings[s.key] = s.value; } });
  return settings;
}

//  Password 
export async function hashPassword(password) {
  try { return await invoke('hash_password', { password }); }
  catch {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

export async function verifyPassword(password, hash) {
  try { return await invoke('verify_password', { password, hash }); }
  catch { const computed = await hashPassword(password); return computed === hash; }
}
