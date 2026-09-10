import React, { useState, useMemo } from 'react';
import { View, Text, Button, Icon, Badge } from 'reshaped';
import { BookOpen, ChevronLeft, ChevronRight, Calendar, Heart, Zap, BedDouble, HeartHandshake, Sparkles, Download, Brain, RefreshCw, Tag } from 'lucide-react';
import { useStore } from '../../lib/store';
import { saveJournalEntry } from '../../lib/db';
import { getToday, formatDisplay, formatShort } from '../../lib/utils';
import { MOODS, ENERGY_LEVELS } from '../../lib/constants';
import { generateJournalSummary, generateJournalPrompt, isOllamaAvailable } from '../../lib/ollama';
import { generateDailyNote, downloadMarkdown } from '../../lib/obsidian';
import DynIcon from '../Shared/DynIcon';

export default function JournalPage({ refreshData }) {
  const { journalEntries, habits, completions, tasks, addToast, addXp, unlockAchievement } = useStore();
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [entry, setEntry] = useState({ mood: 3, content: '', gratitude: '', sleep_hours: '', energy: 3, tags: [], ai_summary: '' });
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiAvailable, setAiAvailable] = useState(null);
  const [promptLoading, setPromptLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const recentEntries = useMemo(() => journalEntries.slice(0, 30), [journalEntries]);

  React.useEffect(() => {
    isOllamaAvailable().then(setAiAvailable);
  }, []);

  React.useEffect(() => {
    const existing = journalEntries.find(e => e.date === selectedDate);
    if (existing) {
      setEntry({ mood: existing.mood||3, content: existing.content||'', gratitude: existing.gratitude||'', sleep_hours: existing.sleep_hours||'', energy: existing.energy||3, tags: existing.tags||[], ai_summary: existing.ai_summary||'' });
    } else {
      setEntry({ mood: 3, content: '', gratitude: '', sleep_hours: '', energy: 3, tags: [], ai_summary: '' });
    }
    setSaved(false);
  }, [selectedDate, journalEntries]);

  function changeDate(delta) {
    const d = new Date(selectedDate + 'T12:00:00');
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  }

  async function handleSave() {
    await saveJournalEntry(selectedDate, entry);
    await refreshData();
    setSaved(true);
    addXp(15);
    addToast({ type: 'success', message: 'Journal saved! +15 XP' });
    if (journalEntries.length === 0) unlockAchievement('journal_1');
    if (journalEntries.length >= 29) unlockAchievement('journal_30');
    setTimeout(() => setSaved(false), 2000);
  }

  async function handleAiSummary() {
    setAiLoading(true);
    try {
      const todayCompletions = completions.filter(c => c.date === selectedDate);
      const summary = await generateJournalSummary({ ...entry, date: selectedDate }, habits, todayCompletions);
      setEntry(e => ({ ...e, ai_summary: summary }));
      addToast({ type: 'success', message: 'AI reflection generated' });
    } catch (e) {
      addToast({ type: 'error', message: 'AI error: ' + e.message });
    }
    setAiLoading(false);
  }

  async function handleAiPrompt() {
    setPromptLoading(true);
    try {
      const prompt = await generateJournalPrompt('today, reflection, gratitude');
      setEntry(e => ({ ...e, content: e.content ? e.content + '\n\n' + prompt : prompt }));
      addToast({ type: 'success', message: 'Writing prompt added' });
    } catch (e) {
      addToast({ type: 'error', message: 'AI error: ' + e.message });
    }
    setPromptLoading(false);
  }

  function handleObsidianExport() {
    const habitsCompleted = habits.filter(h => completions.some(c => c.habit_id === h.id && c.date === selectedDate));
    const tasksCompleted = tasks.filter(t => t.completed_at && t.completed_at.startsWith(selectedDate));
    const md = generateDailyNote({ ...entry, date: selectedDate }, habitsCompleted, tasksCompleted, entry.tags);
    downloadMarkdown(md, `${selectedDate}.md`);
    addToast({ type: 'success', message: 'Exported to Obsidian format' });
    unlockAchievement('export_data');
  }

  function addTag() {
    if (!tagInput.trim()) return;
    setEntry(e => ({ ...e, tags: [...e.tags, tagInput.trim()] }));
    setTagInput('');
  }

  return (
    <div className="animate-fade-in">
      <View direction="row" align="center" gap={4} marginBottom={6} style={{ justifyContent: 'space-between' }}>
        <View>
          <Text variant="title-1" weight="bold">Journal</Text>
          <Text variant="body-2" color="neutral-faded">Reflect, track mood, and export to Obsidian</Text>
        </View>
        <View direction="row" gap={2}>
          <Button variant="faded" color="neutral" onClick={handleObsidianExport}
            startIcon={<Icon svg={<Download size={16} />} />}>Export to Obsidian</Button>
          <Button variant="faded" color="neutral" onClick={() => setShowHistory(!showHistory)}
            startIcon={<Icon svg={<Calendar size={16} />} />}>{showHistory ? 'Close' : 'Past Entries'}</Button>
        </View>
      </View>

      <View direction="row" gap={6}>
        <View style={{ flex: 1 }} gap={5}>
          {/* Date nav */}
          <View direction="row" align="center" gap={3} style={{ justifyContent: 'center' }}>
            <button onClick={() => changeDate(-1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronLeft size={18} /></button>
            <View align="center">
              <Text variant="title-3" weight="bold">{formatDisplay(selectedDate)}</Text>
              {selectedDate !== getToday() && <button onClick={() => setSelectedDate(getToday())} style={{ background: 'none', border: 'none', color: 'var(--rs-color-foreground-primary-default)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginTop: 2 }}>Go to Today</button>}
            </View>
            <button onClick={() => changeDate(1)} style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><ChevronRight size={18} /></button>
          </View>

          {/* Mood */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={3}>How are you feeling?</Text>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {MOODS.map(m => (
                <button key={m.value} className={`mood-btn ${entry.mood === m.value ? 'selected' : ''}`}
                  onClick={() => setEntry(e => ({ ...e, mood: m.value }))}>
                  <span className="mood-icon"><DynIcon name={m.icon} size={24} color={m.color} /></span>
                  <span className="mood-label">{m.label}</span>
                </button>
              ))}
            </div>
          </View>

          {/* Energy */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={3}>Energy Level</Text>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {ENERGY_LEVELS.map(e => (
                <button key={e.value} className={`mood-btn ${entry.energy === e.value ? 'selected' : ''}`}
                  onClick={() => setEntry(en => ({ ...en, energy: e.value }))}>
                  <span className="mood-icon"><DynIcon name={e.icon} size={24} color={e.color} /></span>
                  <span className="mood-label">{e.label}</span>
                </button>
              ))}
            </div>
          </View>

          {/* Sleep */}
          <View direction="row" gap={3} align="center">
            <BedDouble size={16} />
            <Text variant="body-2" weight="bold">Hours of sleep:</Text>
            <input type="number" min="0" max="24" step="0.5" value={entry.sleep_hours}
              onChange={e => setEntry(en => ({ ...en, sleep_hours: e.target.value }))}
              style={{ width: 80, padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', textAlign: 'center' }} />
          </View>

          {/* Content */}
          <View>
            <View direction="row" gap={2} align="center" marginBottom={2} style={{ justifyContent: 'space-between' }}>
              <Text variant="body-2" weight="bold">What's on your mind?</Text>
              {aiAvailable && (
                <Button size="small" variant="faded" color="neutral" onClick={handleAiPrompt} disabled={promptLoading}
                  startIcon={<Icon svg={<Sparkles size={12} />} />}>
                  {promptLoading ? 'Generating...' : 'AI Prompt'}
                </Button>
              )}
            </View>
            <textarea value={entry.content} onChange={e => setEntry(en => ({ ...en, content: e.target.value }))}
              placeholder="Write about your day, your thoughts, your progress..." rows={8}
              style={{ width: '100%', padding: '1rem', borderRadius: 14, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', fontSize: '0.9375rem', lineHeight: 1.6, resize: 'vertical' }} />
            <View direction="row" gap={2} align="center" marginTop={1} style={{ justifyContent: 'space-between' }}>
              <Text variant="caption-2" color="neutral-faded">{entry.content.length} chars, {entry.content.split(/\s+/).filter(Boolean).length} words</Text>
              {aiAvailable === false && <Text variant="caption-2" color="neutral-faded">Start Ollama for AI features</Text>}
            </View>
          </View>

          {/* Tags */}
          <View>
            <View direction="row" gap={2} align="center" marginBottom={2}>
              <Tag size={14} />
              <Text variant="body-3" weight="bold">Tags</Text>
            </View>
            <View direction="row" gap={1} align="center" style={{ flexWrap: 'wrap' }}>
              {entry.tags.map(t => (
                <Badge key={t} size="small" variant="faded" rounded color="primary"
                  onClick={() => setEntry(e => ({ ...e, tags: e.tags.filter(tg => tg !== t) }))}>{t} x</Badge>
              ))}
              <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..."
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                style={{ padding: '4px 10px', borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', fontSize: '0.8125rem', width: 100 }} />
            </View>
          </View>

          {/* Gratitude */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={2}><HeartHandshake size={16} style={{ display: 'inline', marginRight: 6 }} />What are you grateful for?</Text>
            <textarea value={entry.gratitude} onChange={e => setEntry(en => ({ ...en, gratitude: e.target.value }))}
              placeholder="List things you're thankful for..." rows={3}
              style={{ width: '100%', padding: '1rem', borderRadius: 14, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', fontSize: '0.9375rem', lineHeight: 1.6, resize: 'vertical' }} />
          </View>

          {/* AI Summary */}
          {aiAvailable && (
            <View>
              <View direction="row" gap={2} align="center" marginBottom={2} style={{ justifyContent: 'space-between' }}>
                <View direction="row" gap={1} align="center">
                  <Brain size={16} color="#8b5cf6" />
                  <Text variant="body-2" weight="bold">AI Reflection</Text>
                </View>
                <Button size="small" variant="faded" color="neutral" onClick={handleAiSummary} disabled={aiLoading}
                  startIcon={<Icon svg={aiLoading ? <RefreshCw size={12} className="animate-pulse" /> : <Sparkles size={12} />} />}>
                  {aiLoading ? 'Generating...' : entry.ai_summary ? 'Regenerate' : 'Generate'}
                </Button>
              </View>
              {entry.ai_summary && (
                <View padding={3} style={{ background: 'rgba(139,92,246,0.06)', borderRadius: 12, border: '1px solid rgba(139,92,246,0.15)' }}>
                  <Text variant="body-3" style={{ fontStyle: 'italic', lineHeight: 1.6 }}>{entry.ai_summary}</Text>
                </View>
              )}
            </View>
          )}

          {/* Save */}
          <View direction="row" gap={2} style={{ justifyContent: 'flex-end' }}>
            <Button variant="faded" color="neutral" onClick={handleObsidianExport}
              startIcon={<Icon svg={<Download size={14} />} />}>Export .md</Button>
            <Button color="primary" size="large" onClick={handleSave}
              startIcon={<Icon svg={<BookOpen size={16} />} />}>{saved ? 'Saved!' : 'Save Entry'}</Button>
          </View>
        </View>

        {/* History Sidebar */}
        {showHistory && (
          <View style={{ width: 280, flexShrink: 0, maxHeight: '70vh', overflow: 'auto', background: 'var(--rs-color-background-neutral-faded)', borderRadius: 16, padding: '1rem' }}>
            <Text variant="body-2" weight="bold" marginBottom={3}>Past Entries</Text>
            {recentEntries.length === 0 ? <Text variant="caption-1" color="neutral-faded">No entries yet</Text> : (
              <View gap={1}>
                {recentEntries.map(e => (
                  <button key={e.date} onClick={() => setSelectedDate(e.date)} style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 10, cursor: 'pointer',
                    border: 'none', width: '100%', textAlign: 'left',
                    background: e.date === selectedDate ? 'var(--rs-color-background-primary-faded)' : 'transparent',
                  }}>
                    <Text variant="caption-1" weight="bold">{formatShort(e.date)}</Text>
                    <DynIcon name={MOODS.find(m => m.value === e.mood)?.icon || 'Minus'} size={14} color={MOODS.find(m => m.value === e.mood)?.color} />
                    <Text variant="caption-2" color="neutral-faded" style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.content?.substring(0, 40) || 'No content'}</Text>
                  </button>
                ))}
              </View>
            )}
          </View>
        )}
      </View>
    </div>
  );
}
