import React, { useState, useMemo } from 'react';
import { View, Text, Button, Icon, TextArea, Badge, Divider } from 'reshaped';
import { BookOpen, ChevronLeft, ChevronRight, Calendar, Heart, Zap, BedDouble, HeartHandshake } from 'lucide-react';
import DynIcon from '../Shared/DynIcon';
import { useStore } from '../../lib/store';
import { saveJournalEntry } from '../../lib/db';
import { getToday, formatDisplay, formatShort } from '../../lib/utils';
import { MOODS, DAILY_QUOTES } from '../../lib/constants';

export default function JournalPage({ refreshData }) {
  const { journalEntries, addToast, addXp, unlockAchievement } = useStore();

  const [selectedDate, setSelectedDate] = useState(getToday());
  const [entry, setEntry] = useState({ mood: 3, content: '', gratitude: '', sleep_hours: '', energy: 3, tags: '' });
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const recentEntries = useMemo(() => journalEntries.slice(0, 30), [journalEntries]);

  // Load entry when date changes
  React.useEffect(() => {
    const existing = journalEntries.find(e => e.date === selectedDate);
    if (existing) {
      setEntry({
        mood: existing.mood || 3, content: existing.content || '',
        gratitude: existing.gratitude || '', sleep_hours: existing.sleep_hours || '',
        energy: existing.energy || 3, tags: existing.tags || '',
      });
    } else {
      setEntry({ mood: 3, content: '', gratitude: '', sleep_hours: '', energy: 3, tags: '' });
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

  const energyLevels = [
    { value: 1, icon: 'BatteryLow', label: 'Exhausted', color: '#ef4444' },
    { value: 2, icon: 'Battery', label: 'Low', color: '#f97316' },
    { value: 3, icon: 'BatteryMedium', label: 'Normal', color: '#f59e0b' },
    { value: 4, icon: 'BatteryFull', label: 'High', color: '#22c55e' },
    { value: 5, icon: 'Zap', label: 'Supercharged', color: '#3b82f6' },
  ];

  return (
    <div className="animate-fade-in">
      <View direction="row" align="center" gap={4} marginBottom={6} style={{ justifyContent: 'space-between' }}>
        <View>
          <Text variant="title-1" weight="bold">Journal</Text>
          <Text variant="body-2" color="neutral-faded">Reflect on your day and track your mood</Text>
        </View>
        <Button variant="faded" color="neutral" onClick={() => setShowHistory(!showHistory)}
          startIcon={<Icon svg={<Calendar size={16} />} />}>
          {showHistory ? 'Close' : 'Past Entries'}
        </Button>
      </View>

      <View direction="row" gap={6}>
        {/* Main content */}
        <View style={{ flex: 1 }} gap={5}>
          {/* Date navigation */}
          <View direction="row" align="center" gap={3} style={{ justifyContent: 'center' }}>
            <button onClick={() => changeDate(-1)} style={{
              width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--rs-color-border-neutral-faded)',
              background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><ChevronLeft size={18} /></button>
            <View align="center">
              <Text variant="title-3" weight="bold">{formatDisplay(selectedDate)}</Text>
              {selectedDate !== getToday() && (
                <button onClick={() => setSelectedDate(getToday())} style={{
                  background: 'none', border: 'none', color: 'var(--rs-color-foreground-primary-default)',
                  fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', marginTop: 2,
                }}>Go to Today</button>
              )}
            </View>
            <button onClick={() => changeDate(1)} style={{
              width: 36, height: 36, borderRadius: '50%', border: '1px solid var(--rs-color-border-neutral-faded)',
              background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}><ChevronRight size={18} /></button>
          </View>

          {/* Mood Selector */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={3}>How are you feeling?</Text>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {MOODS.map(m => (
                <button key={m.value} className={`mood-btn ${entry.mood === m.value ? 'selected' : ''}`}
                  onClick={() => setEntry(e => ({ ...e, mood: m.value }))}>
                  <span className="mood-icon"><DynIcon name={m.icon} size={24} color={m.color} /></span>
                  <span className="label">{m.label}</span>
                </button>
              ))}
            </div>
          </View>

          {/* Energy Level */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={3}>Energy Level</Text>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {energyLevels.map(e => (
                <button key={e.value} className={`mood-btn ${entry.energy === e.value ? 'selected' : ''}`}
                  onClick={() => setEntry(en => ({ ...en, energy: e.value }))}>
                  <span className="mood-icon"><DynIcon name={e.icon} size={24} color={e.color} /></span>
                  <span className="label">{e.label}</span>
                </button>
              ))}
            </div>
          </View>

          {/* Sleep hours */}
          <View direction="row" gap={3} align="center">
            <Text variant="body-2" weight="bold"><BedDouble size={16} style={{ display: 'inline', marginRight: 6 }} /> Hours of sleep:</Text>
            <input
              type="number" min="0" max="24" step="0.5"
              value={entry.sleep_hours}
              onChange={(e) => setEntry(en => ({ ...en, sleep_hours: e.target.value }))}
              style={{
                width: 80, padding: '6px 12px', borderRadius: 8,
                border: '1px solid var(--rs-color-border-neutral-faded)',
                background: 'var(--rs-color-background-neutral-default)',
                color: 'var(--rs-color-foreground-neutral-default)', textAlign: 'center',
              }}
            />
          </View>

          {/* Journal Content */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={2}>What's on your mind?</Text>
            <textarea
              value={entry.content}
              onChange={(e) => setEntry(en => ({ ...en, content: e.target.value }))}
              placeholder="Write about your day, your thoughts, your progress..."
              rows={8}
              style={{
                width: '100%', padding: '1rem', borderRadius: 12,
                border: '1px solid var(--rs-color-border-neutral-faded)',
                background: 'var(--rs-color-background-neutral-default)',
                color: 'var(--rs-color-foreground-neutral-default)',
                fontSize: '0.9375rem', lineHeight: 1.6, resize: 'vertical',
              }}
            />
            <Text variant="caption-2" color="neutral-faded" marginTop={1}>
              {entry.content.length} characters • {entry.content.split(/\s+/).filter(Boolean).length} words
            </Text>
          </View>

          {/* Gratitude */}
          <View>
            <Text variant="body-2" weight="bold" marginBottom={2}><HeartHandshake size={16} style={{ display: 'inline', marginRight: 6 }} />What are you grateful for today?</Text>
            <textarea
              value={entry.gratitude}
              onChange={(e) => setEntry(en => ({ ...en, gratitude: e.target.value }))}
              placeholder="List things you're thankful for..."
              rows={3}
              style={{
                width: '100%', padding: '1rem', borderRadius: 12,
                border: '1px solid var(--rs-color-border-neutral-faded)',
                background: 'var(--rs-color-background-neutral-default)',
                color: 'var(--rs-color-foreground-neutral-default)',
                fontSize: '0.9375rem', lineHeight: 1.6, resize: 'vertical',
              }}
            />
          </View>

          {/* Save */}
          <View direction="row" style={{ justifyContent: 'flex-end' }}>
            <Button color="primary" size="large" onClick={handleSave}
              startIcon={<Icon svg={<BookOpen size={16} />} />}>
              {saved ? ' Saved!' : 'Save Entry'}
            </Button>
          </View>
        </View>

        {/* History Sidebar */}
        {showHistory && (
          <View style={{
            width: 280, flexShrink: 0, maxHeight: '70vh', overflow: 'auto',
            background: 'var(--rs-color-background-neutral-faded)',
            borderRadius: 12, padding: '1rem',
          }}>
            <Text variant="body-2" weight="bold" marginBottom={3}>Past Entries</Text>
            {recentEntries.length === 0 ? (
              <Text variant="caption-1" color="neutral-faded">No entries yet</Text>
            ) : (
              <View gap={1}>
                {recentEntries.map(e => (
                  <button key={e.date} onClick={() => setSelectedDate(e.date)} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                    border: 'none', width: '100%', textAlign: 'left',
                    background: e.date === selectedDate ? 'var(--rs-color-background-primary-faded)' : 'transparent',
                  }}>
                    <Text variant="caption-1" weight="bold">{formatShort(e.date)}</Text>
                    <span><DynIcon name={MOODS.find(m => m.value === e.mood)?.icon || 'Minus'} size={14} color={MOODS.find(m => m.value === e.mood)?.color} /></span>
                    <Text variant="caption-2" color="neutral-faded" style={{
                      flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
                    }}>
                      {e.content?.substring(0, 40) || 'No content'}
                    </Text>
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
