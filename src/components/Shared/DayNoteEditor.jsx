import React, { useEffect, useRef, useState } from 'react';
import { StickyNote, Check } from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatDisplay } from '../../lib/utils';

/** Inline (never a popup) day-note editor used by the habit detail page. */
export default function DayNoteEditor({ date, onClose }) {
  const { dayNotes, saveDayNote } = useStore();
  const existing = dayNotes.find((n) => n.date === date);
  const [text, setText] = useState(existing?.content || '');
  const [saved, setSaved] = useState(false);
  const t = useRef(null);
  useEffect(() => { setText(dayNotes.find((n) => n.date === date)?.content || ''); }, [date]);
  const commit = (v) => {
    saveDayNote(date, v);
    setSaved(true);
    clearTimeout(t.current);
    t.current = setTimeout(() => setSaved(false), 1500);
  };
  return (
    <div className="card note-editor animate-slide-up" style={{ marginTop: 12, padding: '10px 12px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <StickyNote size={13} color="var(--violet)" />
        <b style={{ fontSize: '0.8rem' }}>Note for {formatDisplay(date)}</b>
        <span className="save-state" style={{ opacity: saved ? 1 : 0 }}><Check size={9} /> saved</span>
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }} onClick={onClose}>Done</button>
      </div>
      <textarea
        className="textarea" rows={3} autoFocus placeholder="How did it go that day?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={() => text !== (existing?.content || '') && commit(text)}
        onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) commit(text); }}
      />
    </div>
  );
}
