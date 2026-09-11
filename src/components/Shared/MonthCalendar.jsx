import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { toStr, getToday, getMonthDays, getDay, formatMonthYear } from '../../lib/utils';
import { DAY_NAMES_SHORT } from '../../lib/constants';
import { useStore } from '../../lib/store';

/**
 * Month calendar grid.
 * marks: { 'yyyy-MM-dd': number|{count,color} } — dots rendered per day.
 * onSelect(dateStr) fired on click.
 */
export default function MonthCalendar({ marks = {}, onSelect, monthInit }) {
  const [cursor, setCursor] = useState(() => monthInit ? new Date(monthInit + 'T12:00:00') : new Date());
  const today = getToday();
  const y = cursor.getFullYear();
  const m = cursor.getMonth();
  const days = getMonthDays(y, m);
  const lead = getDay(days[0]);
  const cells = [...Array(lead).fill(null), ...days];
  const noteDates = useStore((s) => s.dayNotes);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <button className="btn btn-icon btn-sm" onClick={() => setCursor(new Date(y, m - 1, 1))}><ChevronLeft size={14} /></button>
        <span style={{ fontWeight: 800, fontSize: '0.9rem', minWidth: 130, textAlign: 'center' }}>{formatMonthYear(cursor)}</span>
        <button className="btn btn-icon btn-sm" onClick={() => setCursor(new Date(y, m + 1, 1))}><ChevronRight size={14} /></button>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setCursor(new Date())}>Today</button>
      </div>
      <div className="cal-grid">
        {DAY_NAMES_SHORT.map((d) => <div key={d} className="cal-head">{d}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={'e' + i} className="cal-day empty" />;
          const ds = toStr(d);
          const mark = marks[ds];
          const n = typeof mark === 'object' ? mark.count : mark;
          const color = typeof mark === 'object' ? mark.color : 'var(--accent)';
          const hasNote = noteDates.some((x) => x.date === ds);
          return (
            <button key={ds} className={`cal-day ${ds === today ? 'today' : ''} ${hasNote ? 'has-note' : ''}`}
              style={{
                background: n ? `color-mix(in srgb, ${color} ${Math.min(28, 10 + n * 6)}%, var(--surface-2))` : undefined,
                borderColor: ds === today ? 'var(--accent)' : undefined,
                color: ds > today ? 'var(--text-faint)' : undefined,
              }}
              onClick={() => onSelect?.(ds)}
              title={n ? `${n} completed` : undefined}
            >
              {d.getDate()}
              <div className="cal-dots">
                {n > 0 ? <span className="cal-dot" style={{ background: color }} /> : null}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
