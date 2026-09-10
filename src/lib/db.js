import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';

let db;

export async function getDb() {
  if (!db) {
    db = await Database.load('sqlite:habitt.db');
  }
  return db;
}

// Habits
export async function createHabit(habit) {
  const db = await getDb();
  const id = crypto.randomUUID();
  await db.execute(
    `INSERT INTO habits (id, name, description, icon, color, category, frequency, target_count, reminder_enabled, reminder_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
    [id, habit.name, habit.description || '', habit.icon || '✨', habit.color || '#10b981',
     habit.category || 'General', habit.frequency || 'daily', habit.target_count || 1,
     habit.reminder_enabled ? 1 : 0, habit.reminder_time || '']
  );
  return { ...habit, id };
}

export async function getHabits() {
  const db = await getDb();
  return await db.select('SELECT * FROM habits ORDER BY sort_order ASC, created_at DESC');
}

export async function updateHabit(id, updates) {
  const db = await getDb();
  const fields = [];
  const values = [];
  let paramIndex = 1;
  
  Object.entries(updates).forEach(([key, value]) => {
    if (key !== 'id') {
      fields.push(`${key} = $${paramIndex}`);
      values.push(value);
      paramIndex++;
    }
  });
  
  values.push(id);
  await db.execute(
    `UPDATE habits SET ${fields.join(', ')} WHERE id = $${paramIndex}`,
    values
  );
}

export async function deleteHabit(id) {
  const db = await getDb();
  await db.execute('DELETE FROM completions WHERE habit_id = $1', [id]);
  await db.execute('DELETE FROM habits WHERE id = $1', [id]);
}

export async function archiveHabit(id) {
  await updateHabit(id, { archived: 1 });
}

export async function unarchiveHabit(id) {
  await updateHabit(id, { archived: 0 });
}

// Completions
export async function logCompletion(habitId, date, count = 1, note = '') {
  const db = await getDb();
  const id = crypto.randomUUID();
  try {
    await db.execute(
      `INSERT INTO completions (id, habit_id, date, count, note) VALUES ($1, $2, $3, $4, $5)`,
      [id, habitId, date, count, note]
    );
    return { id, habit_id: habitId, date, count, note };
  } catch (e) {
    // If unique constraint fails, update instead
    await db.execute(
      `UPDATE completions SET count = count + $1, note = $2 WHERE habit_id = $3 AND date = $4`,
      [count, note, habitId, date]
    );
    return null;
  }
}

export async function toggleCompletion(habitId, date) {
  const db = await getDb();
  const existing = await db.select(
    'SELECT * FROM completions WHERE habit_id = $1 AND date = $2',
    [habitId, date]
  );
  
  if (existing.length > 0) {
    await db.execute('DELETE FROM completions WHERE id = $1', [existing[0].id]);
    return false;
  } else {
    await logCompletion(habitId, date);
    return true;
  }
}

export async function getCompletions(startDate, endDate) {
  const db = await getDb();
  if (startDate && endDate) {
    return await db.select(
      'SELECT * FROM completions WHERE date >= $1 AND date <= $2 ORDER BY date DESC',
      [startDate, endDate]
    );
  }
  return await db.select('SELECT * FROM completions ORDER BY date DESC');
}

export async function getHabitCompletions(habitId) {
  const db = await getDb();
  return await db.select(
    'SELECT * FROM completions WHERE habit_id = $1 ORDER BY date DESC',
    [habitId]
  );
}

// Journal
export async function saveJournalEntry(date, entry) {
  const db = await getDb();
  const existing = await db.select(
    'SELECT * FROM journal_entries WHERE date = $1',
    [date]
  );
  
  if (existing.length > 0) {
    await db.execute(
      `UPDATE journal_entries SET mood = $1, content = $2, gratitude = $3, updated_at = datetime('now') WHERE date = $4`,
      [entry.mood || 3, entry.content || '', entry.gratitude || '', date]
    );
    return { ...existing[0], ...entry, date };
  } else {
    const id = crypto.randomUUID();
    await db.execute(
      `INSERT INTO journal_entries (id, date, mood, content, gratitude) VALUES ($1, $2, $3, $4, $5)`,
      [id, date, entry.mood || 3, entry.content || '', entry.gratitude || '']
    );
    return { id, date, ...entry };
  }
}

export async function getJournalEntry(date) {
  const db = await getDb();
  const entries = await db.select(
    'SELECT * FROM journal_entries WHERE date = $1',
    [date]
  );
  return entries[0] || null;
}

export async function getJournalEntries(startDate, endDate) {
  const db = await getDb();
  if (startDate && endDate) {
    return await db.select(
      'SELECT * FROM journal_entries WHERE date >= $1 AND date <= $2 ORDER BY date DESC',
      [startDate, endDate]
    );
  }
  return await db.select('SELECT * FROM journal_entries ORDER BY date DESC');
}

// Settings
export async function getSetting(key) {
  const db = await getDb();
  const result = await db.select(
    'SELECT value FROM settings WHERE key = $1',
    [key]
  );
  return result[0]?.value || null;
}

export async function saveSetting(key, value) {
  const db = await getDb();
  await db.execute(
    `INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT(key) DO UPDATE SET value = $2`,
    [key, value]
  );
}

export async function getAllSettings() {
  const db = await getDb();
  const result = await db.select('SELECT * FROM settings');
  const settings = {};
  result.forEach(s => {
    try {
      settings[s.key] = JSON.parse(s.value);
    } catch {
      settings[s.key] = s.value;
    }
  });
  return settings;
}

// Password utilities
export async function hashPassword(password) {
  return await invoke('hash_password', { password });
}

export async function verifyPassword(password, hash) {
  return await invoke('verify_password', { password, hash });
}
