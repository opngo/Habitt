// Local AI via Ollama (http://localhost:11434). Fully optional — everything
// degrades gracefully to a built-in heuristic summary when Ollama isn't running.
const OLLAMA_BASE = 'http://localhost:11434';

export async function isOllamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2500) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getOllamaModels() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3500) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map((m) => ({ name: m.name, size: m.size, family: m.details?.family || 'unknown' }));
  } catch {
    return [];
  }
}

export async function chatWithOllama(model, messages) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3.2',
      messages,
      stream: false,
      options: { temperature: 0.7, num_ctx: 4096 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

export async function generateJournalSummary(entry, habits, completions, model) {
  const done = habits.filter((h) => completions.some((c) => c.habit_id === h.id && c.date === entry.date));
  const prompt = [
    'You are a supportive habit coach. Write a short, warm, personal summary (2-3 sentences) of my day based on the data below. No bullet points, no preamble.',
    `Date: ${entry.date}`,
    `Mood: ${entry.mood}/5, Energy: ${entry.energy}/5, Sleep: ${entry.sleep_hours ?? '?'}h`,
    `Habits completed (${done.length}/${habits.filter((h) => !h.archived).length}): ${done.map((h) => h.name).join(', ') || 'none'}`,
    entry.gratitude ? `Grateful for: ${entry.gratitude}` : '',
    entry.content ? `Journal notes: ${String(entry.content).slice(0, 800)}` : '',
  ].filter(Boolean).join('\n');

  try {
    const text = await chatWithOllama(model, [{ role: 'user', content: prompt }]);
    if (text.trim()) return text.trim();
  } catch { /* fall through to heuristic */ }
  return heuristicSummary(entry, habits, completions);
}

export function heuristicSummary(entry, habits, completions) {
  const active = habits.filter((h) => !h.archived);
  const done = active.filter((h) => completions.some((c) => c.habit_id === h.id && c.date === entry.date));
  const rate = active.length ? Math.round((done.length / active.length) * 100) : 0;
  const parts = [];
  if (rate === 100) parts.push('A perfect day — every single habit checked off.');
  else if (rate >= 60) parts.push(`Strong momentum with ${rate}% of habits completed.`);
  else if (rate >= 30) parts.push(`A steady day at ${rate}% of habits completed.`);
  else if (active.length) parts.push(`A lighter day — ${rate}% of habits completed. Tomorrow is a fresh start.`);
  else parts.push('A day of rest counts too.');
  const sleep = Number(entry.sleep_hours) || 0;
  if (sleep && sleep < 6.5) parts.push(`Only ${entry.sleep_hours}h of sleep — an early night could lift both mood and follow-through.`);
  if ((entry.mood || 3) >= 4 && rate >= 50) parts.push('High mood lined up with high consistency — whatever you did, it worked.');
  if ((entry.mood || 3) <= 2 && entry.content) parts.push('Rough days happen; the streak will catch you tomorrow.');
  if (entry.gratitude) parts.push('Noting something you are grateful for is showing up in your data as better sleep and mood.');
  return parts.join(' ');
}
