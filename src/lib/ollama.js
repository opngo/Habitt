// Ollama API integration for AI-powered journaling
const OLLAMA_BASE = 'http://localhost:11434';

export async function isOllamaAvailable() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function getOllamaModels() {
  try {
    const res = await fetch(`${OLLAMA_BASE}/api/tags`, { signal: AbortSignal.timeout(3000) });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.models || []).map(m => ({
      name: m.name,
      size: m.size,
      family: m.details?.family || 'unknown',
    }));
  } catch {
    return [];
  }
}

export async function chatWithOllama(model, messages, options = {}) {
  const res = await fetch(`${OLLAMA_BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: model || 'llama3.2',
      messages,
      stream: false,
      options: { temperature: options.temperature || 0.7, num_ctx: options.numCtx || 4096 },
    }),
  });
  if (!res.ok) throw new Error(`Ollama error: ${res.status}`);
  const data = await res.json();
  return data.message?.content || '';
}

// Generate AI journal summary from daily data
export async function generateJournalSummary(entry, habits, completions) {
  const habitSummary = habits
    .filter(h => completions.some(c => c.habit_id === h.id && c.date === entry.date))
    .map(h => h.name)
    .join(', ');

  const moods = { 1: 'terrible', 2: 'bad', 3: 'okay', 4: 'good', 5: 'amazing' };

  const systemPrompt = `You are a compassionate journaling assistant. Help the user reflect on their day. Be warm, encouraging, and insightful. Keep responses concise (2-4 sentences). Never be preachy.`;

  const userPrompt = `The user wrote this journal entry:

"${entry.content || '(empty)'}"

Mood: ${moods[entry.mood] || 'okay'}
Energy: ${entry.energy || 3}/5
Sleep: ${entry.sleep_hours || 'unknown'} hours
Gratitude: ${entry.gratitude || '(none)'}
Habits completed: ${habitSummary || 'none'}

Provide a brief, thoughtful reflection and one gentle suggestion for tomorrow. Write in second person ("you").`;

  return chatWithOllama('llama3.2', [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ]);
}

// Generate journal writing prompts
export async function generateJournalPrompt(topic) {
  const systemPrompt = `You are a creative journaling coach. Generate a thoughtful, specific journal prompt. Just the prompt, nothing else. One paragraph.`;

  return chatWithOllama('llama3.2', [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Generate a journal prompt about: ${topic || 'today'}` },
  ]);
}

// Analyze mood patterns
export async function analyzeMoodPatterns(entries) {
  if (entries.length < 5) return 'Need at least 5 entries for analysis.';

  const data = entries.slice(0, 30).map(e =>
    `Date: ${e.date}, Mood: ${e.mood}/5, Energy: ${e.energy}/5, Sleep: ${e.sleep_hours || '?'}h`
  ).join('\n');

  return chatWithOllama('llama3.2', [
    { role: 'system', content: 'You are a data analyst for personal wellbeing. Identify patterns and insights from journal data. Be specific and actionable. 3-5 bullet points.' },
    { role: 'user', content: `Analyze these journal entries:\n${data}` },
  ]);
}
