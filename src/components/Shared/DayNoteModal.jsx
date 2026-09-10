import React, { useState, useEffect } from 'react';
import { View, Text, Button, Icon } from 'reshaped';
import { X, StickyNote, Save } from 'lucide-react';
import { useStore } from '../../lib/store';
import { saveDayNote, deleteDayNote } from '../../lib/db';
import { formatDisplay } from '../../lib/utils';

export default function DayNoteModal({ refreshData }) {
  const { selectedDate, setShowDayNoteModal, dayNotes, addToast, addXp, unlockAchievement } = useStore();
  const [content, setContent] = useState('');

  useEffect(() => {
    if (selectedDate) {
      const existing = dayNotes.find(n => n.date === selectedDate);
      setContent(existing?.content || '');
    }
  }, [selectedDate, dayNotes]);

  async function handleSave() {
    if (!content.trim()) {
      await deleteDayNote(selectedDate);
    } else {
      await saveDayNote(selectedDate, content);
      addXp(5);
      unlockAchievement('day_note');
      addToast({ type: 'success', message: 'Day note saved' });
    }
    await refreshData();
    setShowDayNoteModal(false);
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000,
    }} onClick={(e) => e.target === e.currentTarget && setShowDayNoteModal(false)}>
      <div className="animate-scale-in" style={{
        background: 'var(--rs-color-background-neutral-default)',
        borderRadius: 20, width: '100%', maxWidth: 480,
        boxShadow: '0 24px 64px rgba(0,0,0,0.15)', overflow: 'hidden',
      }}>
        <View direction="row" align="center" padding={4} style={{
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--rs-color-border-neutral-faded)',
        }}>
          <View direction="row" gap={2} align="center">
            <StickyNote size={18} color="#f59e0b" />
            <View>
              <Text variant="title-3" weight="bold">Day Note</Text>
              <Text variant="caption-1" color="neutral-faded">{selectedDate ? formatDisplay(selectedDate) : ''}</Text>
            </View>
          </View>
          <button onClick={() => setShowDayNoteModal(false)} style={{
            width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--rs-color-background-neutral-faded)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={16} /></button>
        </View>

        <View padding={5}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What happened today? Any reflections, wins, or lessons..."
            rows={8}
            style={{
              width: '100%', padding: '1rem', borderRadius: 14,
              border: '1px solid var(--rs-color-border-neutral-faded)',
              background: 'var(--rs-color-background-neutral-faded)',
              color: 'var(--rs-color-foreground-neutral-default)',
              fontSize: '0.9375rem', lineHeight: 1.6, resize: 'vertical',
            }}
            autoFocus
          />
          <View direction="row" align="center" gap={2} marginTop={2} style={{ justifyContent: 'space-between' }}>
            <Text variant="caption-2" color="neutral-faded">{content.length} characters</Text>
          </View>
        </View>

        <View direction="row" gap={2} padding={4} style={{
          justifyContent: 'flex-end',
          borderTop: '1px solid var(--rs-color-border-neutral-faded)',
        }}>
          <Button variant="faded" color="neutral" onClick={() => setShowDayNoteModal(false)}>Cancel</Button>
          <Button color="primary" onClick={handleSave} startIcon={<Icon svg={<Save size={14} />} />}>
            Save Note
          </Button>
        </View>
      </div>
    </div>
  );
}
