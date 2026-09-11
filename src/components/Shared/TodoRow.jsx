import React from 'react';
import { Check, Flag } from 'lucide-react';

export const PRIO_COLORS = { low: '#94a3b8', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' };

/**
 * Reminders-style row: tap target on the left is a big circle, bold title,
 * subtle meta on the right. onSelect opens the detail; the circle toggles done.
 */
export default function TodoRow({ item, done, color = 'var(--accent)', meta, onToggle, onSelect, children, dim }) {
  return (
    <div className={`todo-row ${done ? 'done' : ''}`} onClick={onSelect} style={dim ? { opacity: 0.55 } : undefined}>
      <button
        className="todo-check"
        style={{ '--tc': color, borderColor: done ? color : undefined, background: done ? color : undefined }}
        onClick={(e) => { e.stopPropagation(); onToggle?.(); }}
        title={done ? 'Mark not done' : 'Mark done'}
        aria-label={done ? 'Mark not done' : 'Mark done'}
      >
        {done && <Check size={12} strokeWidth={3.4} color="#fff" />}
      </button>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="todo-title">{item.title}</div>
        {meta && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 2, fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600, flexWrap: 'wrap' }}>
            {meta.priority && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, color: PRIO_COLORS[meta.priority] }}>
                <Flag size={9} /> {meta.priority}
              </span>
            )}
            {meta.subject && <span style={{ color: meta.subjectColor }}>{meta.subject}</span>}
            {meta.subs > 0 && <span>{meta.subsDone}/{meta.subs} subtasks</span>}
            {meta.note && <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180, fontStyle: 'italic' }}>{meta.note}</span>}
            {meta.children}
          </div>
        )}
      </div>
      {meta?.dueLabel && (
        <span className={`chip ${meta.overdue ? 'overdue' : ''}`} style={{ flexShrink: 0 }}>{meta.dueLabel}</span>
      )}
      {children}
    </div>
  );
}
