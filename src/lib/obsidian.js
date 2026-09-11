// Export Habitt data as an Obsidian-friendly set of Markdown notes (single file,
// with `%% ── FILE: ... ── %%` separators so it can be split, or used as-is).
import { format } from 'date-fns';
import { toDate } from './utils';

const MOODS = { 1: '😢 Terrible', 2: '😕 Bad', 3: '😐 Okay', 4: '😊 Good', 5: '🤩 Amazing' };
const ENERGY = { 1: 'Exhausted', 2: 'Low', 3: 'Normal', 4: 'High', 5: 'Supercharged' };

function dailyNote(entry, habitsDone, dateStr) {
  const d = toDate(entry.date);
  let md = '---\n';
  md += `date: "${format(d, 'yyyy-MM-dd')}"\n`;
  md += `tags: ["daily"${(entry.tags || []).map((t) => `, "${t}"`).join('')}]\n`;
  md += `mood: ${entry.mood || 3}\nenergy: ${entry.energy || 3}\n`;
  if (entry.sleep_hours) md += `sleep: ${entry.sleep_hours}\n`;
  md += '---\n\n';
  md += `# ${format(d, 'EEEE, MMMM d, yyyy')}\n\n`;
  md += '## Check-in\n\n| Mood | Energy | Sleep | Habits |\n|---|---|---|---|\n';
  md += `| ${MOODS[entry.mood] || '😐 Okay'} | ${ENERGY[entry.energy] || 'Normal'} | ${entry.sleep_hours || '?'}h | ${habitsDone.length} done |\n\n`;
  if (habitsDone.length) {
    md += '## Habits\n\n' + habitsDone.map((h) => `- [x] ${h.name}`).join('\n') + '\n\n';
  }
  if (entry.content) md += `## Journal\n\n${entry.content}\n\n`;
  if (entry.gratitude) md += `## Gratitude\n\n${entry.gratitude}\n\n`;
  if (entry.ai_summary) md += `## Reflection\n\n> ${entry.ai_summary}\n`;
  return md;
}

export function buildVault({ journalEntries, habits, completions, tasks, notes, dayNotes, focusSessions }) {
  const files = [];
  const byDate = (date) => habits.filter((h) => completions.some((c) => c.habit_id === h.id && c.date === date));

  for (const e of [...journalEntries].sort((a, b) => a.date.localeCompare(b.date))) {
    files.push({ path: `Daily/${e.date}.md`, content: dailyNote(e, byDate(e.date), e.date) });
  }

  // Day notes without a journal entry
  const journalDates = new Set(journalEntries.map((e) => e.date));
  for (const n of [...dayNotes].sort((a, b) => a.date.localeCompare(b.date))) {
    if (journalDates.has(n.date)) continue;
    files.push({
      path: `Daily/${n.date}.md`,
      content: `---\ndate: "${n.date}"\ntags: ["daily"]\n---\n\n# ${format(toDate(n.date), 'EEEE, MMMM d, yyyy')}\n\n${n.content}\n`,
    });
  }

  for (const h of habits) {
    const done = completions.filter((c) => c.habit_id === h.id).map((c) => c.date).sort();
    let md = `---\ntags: ["habit", "${h.category}"]\ncolor: ${h.color}\ncreated: ${String(h.created_at).slice(0, 10)}\n---\n\n`;
    md += `# ${h.name}\n\n${h.description || ''}\n\n**Category:** ${h.category} · **Type:** ${h.habit_type} · **Schedule:** ${h.schedule_type || h.frequency || 'daily'}\n\n`;
    md += `Total: **${done.length}** completions\n\n## History\n\n` + (done.length ? done.map((d) => `- [x] ${d}`).join('\n') : '_No entries yet._');
    files.push({ path: `Habits/${h.name.replace(/[\\/:*?"<>|#^\[\]]/g, '')}.md`, content: md });
  }

  const open = tasks.filter((t) => t.status !== 'done' && !t.parent_id);
  const done = tasks.filter((t) => t.status === 'done' || t.parent_id);
  files.push({
    path: 'Tasks.md',
    content:
      `---\ntags: ["tasks"]\n---\n\n# Tasks\n\n## Open\n\n` +
      (open.length ? open.map((t) => `- [ ] ${t.title}${t.due_date ? ` 📅 ${t.due_date}` : ''}`).join('\n') : '_None_') +
      `\n\n## Completed\n\n` + (done.length ? done.map((t) => `- [x] ${t.title}`).join('\n') : '_None_'),
  });

  files.push({
    path: 'Notes.md',
    content: `---\ntags: ["notes"]\n---\n\n# Notes\n\n` +
      (notes.length ? notes.map((n) => `## ${n.title}\n\n${n.content}\n`).join('\n---\n\n') : '_No notes yet._'),
  });

  const focusTotal = focusSessions.reduce((a, f) => a + (f.duration_minutes || 0), 0);
  files.push({
    path: 'Focus.md',
    content: `---\ntags: ["focus"]\ntotal_minutes: ${focusTotal}\n---\n\n# Focus Sessions\n\n- **Sessions:** ${focusSessions.length}\n- **Total time:** ${Math.round(focusTotal / 60)}h ${focusTotal % 60}m\n`,
  });

  const dash =
    `---\ntags: ["dashboard"]\n---\n\n# Habitt — Dashboard\n\n` +
    `| Area | Count |\n|---|---|\n` +
    `| Habits | ${habits.length} |\n| Completions | ${completions.length} |\n| Journal entries | ${journalEntries.length} |\n| Notes | ${notes.length} |\n| Focus minutes | ${focusTotal} |\n`;
  files.unshift({ path: '00 Dashboard.md', content: dash });

  return files;
}

export function vaultToMarkdown(files) {
  return files.map((f) => `%% ── FILE: ${f.path} ── %%\n\n${f.content.trim()}\n`).join('\n---\n\n');
}

export function download(filename, text, mime = 'text/markdown') {
  let url;
  let revoke = () => {};
  try {
    const blob = new Blob([text], { type: mime });
    url = URL.createObjectURL(blob);
    revoke = () => URL.revokeObjectURL(url);
  } catch {
    // environments without object URLs (tests, locked-down webviews): data URI
    url = `data:${mime};charset=utf-8,` + encodeURIComponent(text);
  }
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(revoke, 4000);
}
