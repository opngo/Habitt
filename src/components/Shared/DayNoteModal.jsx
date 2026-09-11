import React, { useEffect, useMemo, useState } from 'react';
import { StickyNote, Trash2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, formatDisplay, isHabitScheduledOnDate, expectedOnDate, amountOf } from '../../lib/utils';
import Modal from './Modal';

export default function DayNoteModal() {
  const { dayNoteDate, setUI, dayNotes, saveDayNote, habits, completions, vacationPeriods } = useStore();
  const date = dayNoteDate || getToday();
  const existing = useMemo(() => dayNotes.find((n) => n.date === date), [dayNotes, date]);
  const [content, setContent] = useState(existing?.content || '');
  const [tags, setTags] = useState(existing?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [dirty, setDirty] = useState(false);

  useEffect(() => { setContent(existing?.content || ''); setTags(existing?.tags || []); setDirty(false); }, [date]);

  const save = () => {
    saveDayNote(date, content, tags);
    useStore.getState().addToast({ type: 'success', message: content.trim() ? 'Day note saved' : 'Day note cleared' });
    setUI({ showDayNoteModal: false, dayNoteDate: null });
  };

  // that day's habit summary
  const exp = expectedOnDate(habits, vacationPeriods, date);
  const done = exp.filter((h) => completions.some((c) => c.habit_id === h.id && c.date === date && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1))));
  const slips = habits.filter((h) => h.habit_type === 'avoid' && !h.archived).map((h) => ({ h, slip: completions.some((c) => c.habit_id === h.id && c.date === date) })).filter((x) => x.slip);

  return (
    <Modal
      title={`Day note · ${formatDisplay(date)}`}
      icon={<StickyNote size={19} color="var(--blue)" />}
      onClose={() => setUI({ showDayNoteModal: false, dayNoteDate: null })}
      footer={<>
        {existing && (
          <button className="btn btn-danger" style={{ marginRight: 'auto' }} onClick={() => { saveDayNote(date, '', []); setUI({ showDayNoteModal: false }); }}><Trash2 size={14} /> Delete</button>
        )}
        <button className="btn" onClick={() => setUI({ showDayNoteModal: false, dayNoteDate: null })}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save note</button>
      </>}
    >
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <span className="chip" style={{ color: 'var(--accent)' }}>{done.length}/{exp.length} habits done</span>
        {slips.map(({ h }) => <span key={h.id} className="chip" style={{ color: 'var(--red)' }}>Slip: {h.name}</span>)}
        {exp.length === 0 && <span className="chip">No habits scheduled</span>}
      </div>

      <textarea className="textarea" rows={7} autoFocus placeholder="What happened today? Wins, lessons, memories…" value={content} onChange={(e) => { setContent(e.target.value); setDirty(true); }} />

      <div className="field">
        <label className="field-label">Tags</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {tags.map((t) => <button key={t} className="chip on" onClick={() => setTags(tags.filter((x) => x !== t))}>{t} ✕</button>)}
          <input className="input" style={{ width: 150, padding: '6px 10px', fontSize: '0.8rem' }} placeholder="tag + Enter" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { setTags([...new Set([...tags, tagInput.trim()])]); setTagInput(''); } }} />
        </div>
      </div>
    </Modal>
  );
}
