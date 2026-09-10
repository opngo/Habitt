// Export journal and habit data to Obsidian-compatible Markdown
import { format, parseISO } from 'date-fns';

const toDate = (d) => typeof d === 'string' ? parseISO(d + (d.length === 10 ? 'T12:00:00' : '')) : d;

const moods = { 1: 'Terrible', 2: 'Bad', 3: 'Okay', 4: 'Good', 5: 'Amazing' };
const moodEmoji = { 1: '😢', 2: '😕', 3: '😐', 4: '😊', 5: '🤩' };
const energyLabels = { 1: 'Exhausted', 2: 'Low', 3: 'Normal', 4: 'High', 5: 'Supercharged' };

export function generateDailyNote(entry, habitsCompleted, tasksCompleted, tags = []) {
  const date = toDate(entry.date);
  const dateStr = format(date, 'yyyy-MM-dd');
  const allTags = ['daily', ...tags, ...(entry.tags || [])];

  let md = `---
date: "${dateStr}"
tags: [${allTags.map(t => `"${t}"`).join(', ')}]
mood: ${entry.mood || 3}
energy: ${entry.energy || 3}
`;

  if (entry.sleep_hours) md += `sleep: ${entry.sleep_hours}\n`;
  md += `---\n\n`;
  md += `# ${format(date, 'EEEE, MMMM d, yyyy')}\n\n`;

  // Mood & Energy
  md += `## Check-in\n\n`;
  md += `| Mood | Energy | Sleep |\n`;
  md += `|------|--------|-------|\n`;
  md += `| ${moodEmoji[entry.mood] || '😐'} ${moods[entry.mood] || 'Okay'} | ${energyLabels[entry.energy] || 'Normal'} | ${entry.sleep_hours || '?'}h |\n\n`;

  // Journal content
  if (entry.content) {
    md += `## Journal\n\n${entry.content}\n\n`;
  }

  // Gratitude
  if (entry.gratitude) {
    md += `## Gratitude\n\n${entry.gratitude}\n\n`;
  }

  // Habits completed
  if (habitsCompleted?.length > 0) {
    md += `## Habits\n\n`;
    habitsCompleted.forEach(h => {
      md += `- [x] ${h.name}\n`;
    });
    md += `\n`;
  }

  // Tasks completed
  if (tasksCompleted?.length > 0) {
    md += `## Tasks\n\n`;
    tasksCompleted.forEach(t => {
      md += `- [x] ${t.title}\n`;
    });
    md += `\n`;
  }

  // AI Summary
  if (entry.ai_summary) {
    md += `## AI Reflection\n\n> ${entry.ai_summary}\n\n`;
  }

  return md;
}

export function generateMoodJournal(entries) {
  let md = `---
tags: ["mood-journal", "review"]
generated: "${format(new Date(), 'yyyy-MM-dd')}"
---

# Mood Journal\n\n`;

  entries.sort((a, b) => b.date.localeCompare(a.date)).forEach(entry => {
    const date = toDate(entry.date);
    md += `## ${format(date, 'MMM d, yyyy')}\n\n`;
    md += `**Mood:** ${moodEmoji[entry.mood]} ${moods[entry.mood]} (${entry.mood}/5)\n`;
    if (entry.content) md += `\n${entry.content}\n`;
    md += `\n---\n\n`;
  });

  return md;
}

export function generateHabitReview(habits, completions, year) {
  let md = `---
tags: ["habit-review", "${year}"]
---

# Habit Review ${year}\n\n`;

  habits.forEach(h => {
    const hc = completions.filter(c => c.habit_id === h.id && c.date.startsWith(String(year)));
    const rate = hc.length > 0 ? Math.round((hc.length / 365) * 100) : 0;

    md += `## ${h.name}\n\n`;
    md += `| Category | Type | Completions | Rate |\n`;
    md += `|----------|------|-------------|------|\n`;
    md += `| ${h.category} | ${h.habit_type || 'normal'} | ${hc.length} | ${rate}% |\n\n`;
  });

  return md;
}

// Download as file
export function downloadMarkdown(content, filename) {
  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Download as zip (multiple files)
export async function downloadObsidianVault(entries, habits, completions, tasks) {
  // Generate individual daily notes
  const files = {};
  entries.forEach(entry => {
    const habitsCompleted = habits.filter(h =>
      completions.some(c => c.habit_id === h.id && c.date === entry.date)
    );
    const tasksCompleted = (tasks || []).filter(t =>
      t.completed_at && t.completed_at.startsWith(entry.date)
    );
    const filename = `Daily Notes/${entry.date}.md`;
    files[filename] = generateDailyNote(entry, habitsCompleted, tasksCompleted);
  });

  // Generate mood journal
  files['Mood Journal.md'] = generateMoodJournal(entries);

  // Generate habit review
  const year = new Date().getFullYear();
  files[`Habit Review ${year}.md`] = generateHabitReview(habits, completions, year);

  // Download as JSON (user can use a script to convert to files)
  const blob = new Blob([JSON.stringify(files, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `obsidian-vault-${format(new Date(), 'yyyy-MM-dd')}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
