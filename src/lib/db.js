import Database from '@tauri-apps/plugin-sql';
import { invoke } from '@tauri-apps/api/core';
let db;
export async function getDb() {
  if (!db) { try { db = await Database.load('sqlite:habitt.db'); } catch (e) { return null; } }
  return db;
}
function tryParse(s, fb) { try { return JSON.parse(s); } catch { return fb; } }

// ── Habits ──
export async function createHabit(h) {
  const d = await getDb(); if (!d) return { ...h, id: crypto.randomUUID() };
  const id = crypto.randomUUID();
  await d.execute(`INSERT INTO habits (id,name,description,icon,color,category,habit_type,frequency,schedule_type,schedule_value,custom_days,target_count,unit,checklist,tags,reminder_enabled,reminder_time,difficulty) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
    [id,h.name,h.description||'',h.icon||'Zap',h.color||'#22c55e',h.category||'General',h.habit_type||'normal',h.frequency||'daily',h.schedule_type||'daily',h.schedule_value||0,h.custom_days||'',h.target_count||1,h.unit||'',JSON.stringify(h.checklist||[]),JSON.stringify(h.tags||[]),h.reminder_enabled?1:0,h.reminder_time||'',h.difficulty||'medium']);
  return { ...h, id, checklist: h.checklist||[], tags: h.tags||[] };
}
export async function getHabits() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM habits ORDER BY sort_order ASC, created_at DESC')).map(r=>({...r,checklist:tryParse(r.checklist,[]),tags:tryParse(r.tags,[])}));
}
export async function updateHabit(id, u) {
  const d = await getDb(); if (!d) return;
  const f=[]; const v=[]; let p=1;
  Object.entries(u).forEach(([k,val])=>{if(k==='id')return; f.push(`${k}=$${p}`); v.push(k==='checklist'||k==='tags'?JSON.stringify(val):val); p++;});
  v.push(id); await d.execute(`UPDATE habits SET ${f.join(',')} WHERE id=$${p}`,v);
}
export async function deleteHabit(id) {
  const d = await getDb(); if (!d) return;
  await d.execute('DELETE FROM completions WHERE habit_id=$1',[id]);
  await d.execute('DELETE FROM vacation_periods WHERE habit_id=$1',[id]);
  await d.execute('DELETE FROM habits WHERE id=$1',[id]);
}

// ── Completions ──
export async function toggleCompletion(hid, date) {
  const d = await getDb(); if (!d) return true;
  const ex = await d.select('SELECT * FROM completions WHERE habit_id=$1 AND date=$2',[hid,date]);
  if (ex.length) { await d.execute('DELETE FROM completions WHERE id=$1',[ex[0].id]); return false; }
  const id = crypto.randomUUID();
  await d.execute('INSERT INTO completions (id,habit_id,date,count,amount,note,checklist_done,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[id,hid,date,1,0,'','[]','[]']);
  return true;
}
export async function saveCompletion(hid, date, data) {
  const d = await getDb(); if (!d) return;
  const ex = await d.select('SELECT * FROM completions WHERE habit_id=$1 AND date=$2',[hid,date]);
  if (ex.length) { await d.execute('UPDATE completions SET count=$1,amount=$2,note=$3,checklist_done=$4,tags=$5 WHERE id=$6',[data.count||1,data.amount||0,data.note||'',JSON.stringify(data.checklist_done||[]),JSON.stringify(data.tags||[]),ex[0].id]); }
  else { const id=crypto.randomUUID(); await d.execute('INSERT INTO completions (id,habit_id,date,count,amount,note,checklist_done,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',[id,hid,date,data.count||1,data.amount||0,data.note||'',JSON.stringify(data.checklist_done||[]),JSON.stringify(data.tags||[])]); }
}
export async function getCompletions() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM completions ORDER BY date DESC')).map(r=>({...r,checklist_done:tryParse(r.checklist_done,[]),tags:tryParse(r.tags,[])}));
}

// ── Tasks ──
export async function createTask(t) {
  const d = await getDb(); if (!d) return { ...t, id: crypto.randomUUID() };
  const id = crypto.randomUUID();
  await d.execute('INSERT INTO tasks (id,title,description,parent_id,project_id,priority,status,due_date,tags,icon,color,sort_order) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)',
    [id,t.title,t.description||'',t.parent_id||null,t.project_id||null,t.priority||'medium',t.status||'todo',t.due_date||null,JSON.stringify(t.tags||[]),t.icon||'Circle',t.color||'#6366f1',t.sort_order||0]);
  return { ...t, id, tags: t.tags||[] };
}
export async function getTasks() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM tasks ORDER BY sort_order ASC, created_at DESC')).map(r=>({...r,tags:tryParse(r.tags,[])}));
}
export async function updateTask(id, u) {
  const d = await getDb(); if (!d) return;
  const f=[]; const v=[]; let p=1;
  Object.entries(u).forEach(([k,val])=>{if(k==='id')return; f.push(`${k}=$${p}`); v.push(k==='tags'?JSON.stringify(val):val); p++;});
  v.push(id); await d.execute(`UPDATE tasks SET ${f.join(',')} WHERE id=$${p}`,v);
}
export async function deleteTask(id) {
  const d = await getDb(); if (!d) return;
  await d.execute('DELETE FROM tasks WHERE parent_id=$1',[id]);
  await d.execute('DELETE FROM tasks WHERE id=$1',[id]);
}

// ── Notes ──
export async function createNote(n) {
  const d = await getDb(); if (!d) return { ...n, id: crypto.randomUUID() };
  const id = crypto.randomUUID();
  await d.execute('INSERT INTO notes (id,title,content,tags,color,icon,pinned) VALUES ($1,$2,$3,$4,$5,$6,$7)',
    [id,n.title,n.content||'',JSON.stringify(n.tags||[]),n.color||'#6366f1',n.icon||'FileText',n.pinned?1:0]);
  return { ...n, id, tags: n.tags||[] };
}
export async function getNotes() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM notes ORDER BY pinned DESC, updated_at DESC')).map(r=>({...r,tags:tryParse(r.tags,[])}));
}
export async function updateNote(id, u) {
  const d = await getDb(); if (!d) return;
  const f=[]; const v=[]; let p=1;
  Object.entries(u).forEach(([k,val])=>{if(k==='id')return; f.push(`${k}=$${p}`); v.push(k==='tags'?JSON.stringify(val):val); p++;});
  f.push(`updated_at=datetime('now')`);
  v.push(id); await d.execute(`UPDATE notes SET ${f.join(',')} WHERE id=$${p}`,v);
}
export async function deleteNote(id) {
  const d = await getDb(); if (!d) return;
  await d.execute('DELETE FROM notes WHERE id=$1',[id]);
}

// ── Homework ──
export async function createHomework(h) {
  const d = await getDb(); if (!d) return { ...h, id: crypto.randomUUID() };
  const id = crypto.randomUUID();
  await d.execute('INSERT INTO homework (id,title,description,subject_id,due_date,status,priority,tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)',
    [id,h.title,h.description||'',h.subject_id,h.due_date,h.status||'pending',h.priority||'medium',JSON.stringify(h.tags||[])]);
  return { ...h, id, tags: h.tags||[] };
}
export async function getHomework() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM homework ORDER BY due_date ASC')).map(r=>({...r,tags:tryParse(r.tags,[])}));
}
export async function updateHomework(id, u) {
  const d = await getDb(); if (!d) return;
  const f=[]; const v=[]; let p=1;
  Object.entries(u).forEach(([k,val])=>{if(k==='id')return; f.push(`${k}=$${p}`); v.push(k==='tags'?JSON.stringify(val):val); p++;});
  v.push(id); await d.execute(`UPDATE homework SET ${f.join(',')} WHERE id=$${p}`,v);
}
export async function deleteHomework(id) {
  const d = await getDb(); if (!d) return;
  await d.execute('DELETE FROM homework WHERE id=$1',[id]);
}

// ── Subjects ──
export async function createSubject(s) {
  const d = await getDb(); if (!d) return { ...s, id: crypto.randomUUID() };
  const id = crypto.randomUUID();
  await d.execute('INSERT INTO subjects (id,name,color,icon,sort_order) VALUES ($1,$2,$3,$4,$5)',
    [id,s.name,s.color,s.icon||'BookOpen',s.sort_order||0]);
  return { ...s, id };
}
export async function getSubjects() {
  const d = await getDb(); if (!d) return [];
  return await d.select('SELECT * FROM subjects ORDER BY sort_order ASC, name ASC');
}
export async function updateSubject(id, u) {
  const d = await getDb(); if (!d) return;
  const f=[]; const v=[]; let p=1;
  Object.entries(u).forEach(([k,val])=>{if(k==='id')return; f.push(`${k}=$${p}`); v.push(val); p++;});
  v.push(id); await d.execute(`UPDATE subjects SET ${f.join(',')} WHERE id=$${p}`,v);
}
export async function deleteSubject(id) {
  const d = await getDb(); if (!d) return;
  await d.execute('DELETE FROM subjects WHERE id=$1',[id]);
}

// ── Day Notes ──
export async function saveDayNote(date, content, tags=[]) {
  const d = await getDb(); if (!d) return;
  const ex = await d.select('SELECT * FROM day_notes WHERE date=$1',[date]);
  if (ex.length) { await d.execute(`UPDATE day_notes SET content=$1,tags=$2,updated_at=datetime('now') WHERE date=$3`,[content,JSON.stringify(tags),date]); }
  else { const id=crypto.randomUUID(); await d.execute('INSERT INTO day_notes (id,date,content,tags) VALUES ($1,$2,$3,$4)',[id,date,content,JSON.stringify(tags)]); }
}
export async function getDayNotes() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM day_notes ORDER BY date DESC')).map(r=>({...r,tags:tryParse(r.tags,[])}));
}
export async function deleteDayNote(date) {
  const d = await getDb(); if (!d) return;
  await d.execute('DELETE FROM day_notes WHERE date=$1',[date]);
}

// ── Journal ──
export async function saveJournalEntry(date, entry) {
  const d = await getDb(); if (!d) return { ...entry, date };
  const ex = await d.select('SELECT * FROM journal_entries WHERE date=$1',[date]);
  if (ex.length) { await d.execute(`UPDATE journal_entries SET mood=$1,content=$2,gratitude=$3,sleep_hours=$4,energy=$5,tags=$6,ai_summary=$7,updated_at=datetime('now') WHERE date=$8`,[entry.mood||3,entry.content||'',entry.gratitude||'',entry.sleep_hours||null,entry.energy||3,JSON.stringify(entry.tags||[]),entry.ai_summary||'',date]); }
  else { const id=crypto.randomUUID(); await d.execute('INSERT INTO journal_entries (id,date,mood,content,gratitude,sleep_hours,energy,tags,ai_summary) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)',[id,date,entry.mood||3,entry.content||'',entry.gratitude||'',entry.sleep_hours||null,entry.energy||3,JSON.stringify(entry.tags||[]),entry.ai_summary||'']); }
  return { ...entry, date };
}
export async function getJournalEntries() {
  const d = await getDb(); if (!d) return [];
  return (await d.select('SELECT * FROM journal_entries ORDER BY date DESC')).map(r=>({...r,tags:tryParse(r.tags,[])}));
}

// ── Focus Sessions ──
export async function saveFocusSession(s) {
  const d = await getDb(); if (!d) return;
  const id=crypto.randomUUID();
  await d.execute('INSERT INTO focus_sessions (id,habit_id,started_at,duration_minutes,completed,notes) VALUES ($1,$2,$3,$4,$5,$6)',[id,s.habit_id||null,s.started_at,s.duration_minutes,s.completed?1:0,s.notes||'']);
  return { ...s, id };
}
export async function getFocusSessions() {
  const d = await getDb(); if (!d) return [];
  return await d.select('SELECT * FROM focus_sessions ORDER BY started_at DESC');
}

// ── Vacation ──
export async function startVacation(hid, start) {
  const d = await getDb(); if (!d) return;
  const id=crypto.randomUUID();
  await d.execute('INSERT INTO vacation_periods (id,habit_id,start_date) VALUES ($1,$2,$3)',[id,hid,start]);
}
export async function endVacation(hid, end) {
  const d = await getDb(); if (!d) return;
  await d.execute('UPDATE vacation_periods SET end_date=$1 WHERE habit_id=$2 AND end_date IS NULL',[end,hid]);
}
export async function getVacationPeriods() {
  const d = await getDb(); if (!d) return [];
  return await d.select('SELECT * FROM vacation_periods ORDER BY start_date DESC');
}

// ── Settings ──
export async function getSetting(key) {
  const d = await getDb(); if (!d) return null;
  const r = await d.select('SELECT value FROM settings WHERE key=$1',[key]);
  return r[0]?.value||null;
}
export async function saveSetting(key, value) {
  const d = await getDb(); if (!d) return;
  await d.execute(`INSERT INTO settings (key,value) VALUES ($1,$2) ON CONFLICT(key) DO UPDATE SET value=$2`,[key,String(value)]);
}
export async function getAllSettings() {
  const d = await getDb(); if (!d) return {};
  const r = await d.select('SELECT * FROM settings');
  const s = {}; r.forEach(x => { try { s[x.key]=JSON.parse(x.value); } catch { s[x.key]=x.value; } }); return s;
}

// ── Password ──
export async function hashPassword(pw) {
  try { return await invoke('hash_password',{password:pw}); } catch {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(pw));
    return Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
  }
}
export async function verifyPassword(pw, hash) {
  try { return await invoke('verify_password',{password:pw,hash}); } catch { return (await hashPassword(pw))===hash; }
}
