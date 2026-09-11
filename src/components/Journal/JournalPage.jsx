import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ChevronLeft, ChevronRight, Sparkles, Trash2, Clock, Brain, Moon, Sun, Feather } from 'lucide-react';
import DynIcon from '../Shared/DynIcon';
import { useStore } from '../../lib/store';
import { getToday, formatDisplay, expectedOnDate, amountOf } from '../../lib/utils';
import { MOODS, ENERGIES } from '../../lib/constants';
import { generateJournalSummary, chatWithOllama } from '../../lib/ollama';

const WRITING_PROMPTS = [
  'What is one small win from today, and what made it possible?',
  'If tomorrow were a copy of today, what would I tweak — just slightly?',
  'Which habit felt easiest today, and which one fought back? Why?',
  'What drained my energy today? What quietly refilled it?',
  'Describe today using the weather. Then describe your mood using the weather.',
  'What did I avoid today, and what was it trying to teach me?',
  'Who did I appreciate today — even briefly? What happened?',
  'What would “proud me” from one year from now thank today-me for doing?',
  'List three things that went right. No caveats allowed.',
  'What time of day did I feel most like myself today? How could I protect it?',
];

const MOOD_COLORS = { 1: '#64748b', 2: '#ef4444', 3: '#f59e0b', 4: '#22c55e', 5: '#8b5cf6' };

export default function JournalPage() {
  const { journalEntries, journalDate, setUI, saveJournalEntry, deleteJournalEntry, habits, completions, vacationPeriods, settings, addToast } = useStore();
  const date = journalDate || getToday();
  const entry = useMemo(() => journalEntries.find((j) => j.date === date), [journalEntries, date]);
  const [draft, setDraft] = useState({ mood: 3, energy: 3, sleep_hours: '', gratitude: '', content: '' });
  const [summary, setSummary] = useState(entry?.ai_summary || '');
  const [aiBusy, setAiBusy] = useState(false);
  const [promptBusy, setPromptBusy] = useState(false);
  const [showList, setShowList] = useState(true);

  const insertPrompt = async () => {
    setPromptBusy(true);
    try {
      let prompt = null;
      if (settings.ollamaEnabled) {
        try {
          prompt = (await chatWithOllama(settings.ollamaModel, [{ role: 'user', content: 'Write ONE short reflective journaling prompt for someone who tracks daily habits. Max 25 words. No quotes, no preamble, no explanation.' }])).trim() || null;
        } catch { prompt = null; }
      }
      if (!prompt) prompt = WRITING_PROMPTS[Math.floor(Math.random() * WRITING_PROMPTS.length)];
      setDraft((d) => ({ ...d, content: (d.content ? d.content + '\n\n' : '') + '> ' + prompt + '\n\n' }));
      addToast({ type: 'info', message: 'Writing prompt added — keep the pen moving' });
    } finally { setPromptBusy(false); }
  };

  useEffect(() => {
    setDraft({
      mood: entry?.mood || 3,
      energy: entry?.energy || 3,
      sleep_hours: entry?.sleep_hours ?? '',
      gratitude: entry?.gratitude || '',
      content: entry?.content || '',
    });
    setSummary(entry?.ai_summary || '');
  }, [date]);

  // autosave on leave (keeps a running draft from vanishing)
  const draftRef = React.useRef(draft);
  draftRef.current = draft;
  const dateRef = React.useRef(date);
  dateRef.current = date;
  useEffect(() => () => {
    const s = useStore.getState();
    const d = draftRef.current;
    const hasSomething = d.content || d.gratitude || (d.sleep_hours !== '') || d.mood !== 3 || d.energy !== 3;
    if (hasSomething) {
      const prev = s.journalEntries.find((j) => j.date === dateRef.current);
      const same = prev && prev.content === d.content && prev.gratitude === d.gratitude && prev.mood === d.mood && prev.energy === d.energy && String(prev.sleep_hours ?? '') === String(d.sleep_hours);
      if (!same) s.saveJournalEntry(dateRef.current, { ...d, sleep_hours: d.sleep_hours === '' ? null : Number(d.sleep_hours) }, false);
    }
  }, []);

  const dirty = entry ? (draft.content !== (entry.content || '') || draft.gratitude !== (entry.gratitude || '') || draft.mood !== entry.mood || draft.energy !== entry.energy || String(draft.sleep_hours) !== String(entry.sleep_hours ?? '')) : !!(draft.content || draft.gratitude);

  const save = (toast = true) => {
    saveJournalEntry(date, { ...draft, sleep_hours: draft.sleep_hours === '' ? null : Number(draft.sleep_hours) });
    if (toast) addToast({ type: 'success', message: 'Journal entry saved' });
  };

  const shiftDay = (n) => {
    if (dirty) save(false);
    const d = new Date(date + 'T12:00:00');
    d.setDate(d.getDate() + n);
    setUI({ journalDate: d.toISOString().slice(0, 10) });
  };

  const runAI = async () => {
    if (dirty) save(false);
    setAiBusy(true);
    try {
      const saved = { ...entry, ...draft, date };
      const text = await generateJournalSummary(saved, habits, completions, settings.ollamaModel);
      setSummary(text);
      saveJournalEntry(date, { ai_summary: text });
    } catch {
      addToast({ type: 'error', message: 'AI summary failed' });
    } finally {
      setAiBusy(false);
    }
  };

  const exp = expectedOnDate(habits, vacationPeriods, date);
  const done = exp.filter((h) => completions.some((c) => c.habit_id === h.id && c.date === date && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1))));
  const sorted = useMemo(() => [...journalEntries].sort((a, b) => b.date.localeCompare(a.date)), [journalEntries]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h2 className="page-title"><BookOpen size={22} color="var(--violet)" /> Journal</h2>
          <p className="page-sub">Mood, energy, sleep, and the story of your day.</p>
        </div>
        <button className="btn" style={{ marginLeft: 'auto' }} onClick={() => setShowList((s) => !s)}>{showList ? 'Hide past entries' : 'Past entries'}</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showList ? '1fr 320px' : '1fr', gap: 16, alignItems: 'start' }}>
        <div className="card card-pad">
          {/* Date nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <button className="btn btn-icon" onClick={() => shiftDay(-1)}><ChevronLeft size={16} /></button>
            <div style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.02rem' }}>{formatDisplay(date)}</div>
              <div style={{ fontSize: '0.72rem', color: date === getToday() ? 'var(--accent)' : 'var(--text-faint)', fontWeight: 700 }}>
                {date === getToday() ? 'Today' : ''} {date > getToday() ? '· future day' : ''}
              </div>
            </div>
            <button className="btn btn-icon" disabled={date >= getToday()} onClick={() => shiftDay(1)}><ChevronRight size={16} /></button>
            {date !== getToday() && <button className="btn btn-sm" onClick={() => setUI({ journalDate: getToday() })}>Jump to today</button>}
          </div>

          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            <span className="chip" style={{ color: 'var(--accent)' }}><Sun size={10} /> {done.length}/{exp.length} habits</span>
            {exp.length > 0 && done.length === exp.length && <span className="chip" style={{ color: 'var(--amber)' }}>Perfect day</span>}
            {entry && <span className="chip"><Clock size={10} /> edited {new Date(entry.updated_at || entry.created_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field-label">Mood</label>
            <div className="mood-row">
              {MOODS.map((m) => (
                <button key={m.value} className={`mood-btn ${draft.mood === m.value ? 'on' : ''}`} style={{ '--mc': MOOD_COLORS[m.value], borderColor: draft.mood === m.value ? MOOD_COLORS[m.value] : undefined, background: draft.mood === m.value ? `color-mix(in srgb, ${MOOD_COLORS[m.value]} 12%, transparent)` : undefined }}
                  onClick={() => setDraft((d) => ({ ...d, mood: m.value }))}>
                  <DynIcon name={m.icon} size={19} />
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <label className="field-label">Energy</label>
            <div className="mood-row">
              {ENERGIES.map((e) => (
                <button key={e.value} className={`mood-btn ${draft.energy === e.value ? 'on' : ''}`} style={draft.energy === e.value ? { borderColor: '#06b6d4', background: 'rgba(6,182,212,0.1)' } : {}}
                  onClick={() => setDraft((d) => ({ ...d, energy: e.value }))}>
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 18 }}>
                    {[1, 2, 3, 4, 5].map((b) => <span key={b} style={{ width: 5, borderRadius: 2, height: b * 3.2, background: b <= e.value ? '#06b6d4' : 'var(--surface-3)' }} />)}
                  </div>
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-row" style={{ marginBottom: 16 }}>
            <div className="field">
              <label className="field-label"><Moon size={11} style={{ verticalAlign: -1 }} /> Sleep (hours)</label>
              <input className="input" type="number" min="0" max="24" step="0.5" placeholder="e.g. 7.5" value={draft.sleep_hours} onChange={(e) => setDraft((d) => ({ ...d, sleep_hours: e.target.value }))} />
            </div>
            <div className="field">
              <label className="field-label">Grateful for…</label>
              <input className="input" placeholder="Three things, big or small" value={draft.gratitude} onChange={(e) => setDraft((d) => ({ ...d, gratitude: e.target.value }))} />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 14 }}>
            <label className="field-label">Today's page</label>
            <textarea className="textarea" style={{ minHeight: 190 }} placeholder="What happened? What did you learn? What will tomorrow steal from today if you don't write it down?"
              value={draft.content} onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))} />
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-primary" onClick={() => save()}>Save entry</button>
            <button className="btn" onClick={insertPrompt} disabled={promptBusy} title="Adds a fresh writing prompt to your page">
              {promptBusy ? <span className="spinner" /> : <Feather size={14} color="var(--blue)" />} Writing prompt
            </button>
            <button className="btn" onClick={runAI} disabled={aiBusy} title="Uses local Ollama if running, otherwise an on-device insight engine">
              {aiBusy ? <span className="spinner" /> : <Sparkles size={14} color="var(--violet)" />} Daily reflection
            </button>
            <span style={{ marginLeft: 'auto', fontSize: '0.7rem', color: 'var(--text-faint)', fontWeight: 650 }}>
              {(draft.content || '').length} chars · {((draft.content || '').trim().match(/\S+/g) || []).length} words
            </span>
            {entry && <button className="btn btn-danger" onClick={() => { if (confirm('Delete this entry?')) { deleteJournalEntry(date); setSummary(''); addToast({ type: 'info', message: 'Entry deleted' }); } }}><Trash2 size={14} /> Delete</button>}
          </div>

          {summary && (
            <div className="card animate-slide-up" style={{ marginTop: 14, padding: '12px 15px', background: 'linear-gradient(135deg, rgba(139,92,246,0.09), rgba(6,182,212,0.06))', display: 'flex', gap: 10 }}>
              <Brain size={16} color="var(--violet)" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={{ fontSize: '0.86rem', lineHeight: 1.55, color: 'var(--text)' }}><b style={{ color: 'var(--violet)' }}>Reflection: </b>{summary}</span>
            </div>
          )}
        </div>

        {showList && (
          <aside className="card card-pad" style={{ position: 'sticky', top: 76 }}>
            <h3 style={{ margin: '0 0 10px', fontSize: '0.85rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-faint)' }}>
              {sorted.length} entries
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7, maxHeight: '60vh', overflowY: 'auto' }}>
              {sorted.length === 0 && <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: '0.82rem', fontStyle: 'italic' }}>Your saved days will appear here.</p>}
              {sorted.map((j) => (
                <button key={j.id} className="qc-row" style={{ '--qc': MOOD_COLORS[j.mood] || '#8b5cf6', padding: '9px 12px', background: j.date === date ? 'color-mix(in srgb, var(--violet) 8%, var(--surface))' : undefined, width: '100%', textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}
                  onClick={() => setUI({ journalDate: j.date })}>
                  <span><DynIcon name={(MOODS.find((x) => x.value === (j.mood || 3)) || MOODS[2]).icon} size={16} /></span>
                  <span style={{ flex: 1 }}>
                    <span style={{ display: 'block', fontWeight: 750, fontSize: '0.8rem' }}>{formatDisplay(j.date).replace(/,\s\d{4}$/, '')}</span>
                    <span style={{ display: 'block', fontSize: '0.68rem', color: 'var(--text-faint)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
                      {j.content ? j.content.slice(0, 60) || '—' : j.gratitude ? `Grateful: ${j.gratitude.slice(0, 40)}` : 'Check-in only'}
                    </span>
                  </span>
                  {j.ai_summary && <Sparkles size={12} color="var(--violet)" />}
                </button>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
