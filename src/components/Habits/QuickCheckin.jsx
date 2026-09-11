import React from 'react';
import { X, Check, CheckCircle2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, expectedOnDate, amountOf } from '../../lib/utils';
import DynIcon from '../Shared/DynIcon';

export default function QuickCheckin() {
  const { habits, completions, vacationPeriods, toggleCompletion, adjustAmount, setUI } = useStore();
  const today = getToday();
  const items = expectedOnDate(habits, vacationPeriods, today)
    .concat(habits.filter((h) => !h.archived && h.habit_type === 'avoid'))
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const done = items.filter((h) =>
    h.habit_type !== 'avoid' &&
    completions.some((c) => c.habit_id === h.id && c.date === today && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1)))
  ).length;
  const allDone = items.length > 0 && done === items.length;

  if (!items.length) {
    return (
      <div className="qc-wrap">
        <div className="empty" style={{ padding: '60px 24px' }}>
          <div className="empty-icon" style={{ background: 'var(--accent-soft)' }}><Check size={26} color="var(--accent)" /></div>
          <h3 style={{ margin: 0 }}>Nothing scheduled today</h3>
          <p style={{ color: 'var(--text-muted)' }}>Enjoy the rest day, or add a habit to track.</p>
          <button className="btn btn-primary" onClick={() => setUI({ quickCheckinMode: false })}>Back to dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div className="qc-wrap">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Quick check-in</h2>
          <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {done === items.length ? 'All done. Clean sweep.' : `${done} of ${items.length} left — one tap each, no scrolling around.`}
          </p>
        </div>
        <div className="progress-track" style={{ flex: 1, maxWidth: 180, marginLeft: 'auto' }}>
          <div className="progress-fill" style={{ width: `${(done / items.length) * 100}%`, background: 'linear-gradient(90deg,#22c55e,#06b6d4)' }} />
        </div>
        <button className="btn btn-ghost btn-icon" onClick={() => setUI({ quickCheckinMode: false })} title="Exit (Esc)"><X size={16} /></button>
      </div>

      {allDone && (
        <div className="card animate-scale-in" style={{ padding: '14px 18px', background: 'linear-gradient(135deg, rgba(34,197,94,0.14), rgba(236,72,153,0.10))', display: 'flex', gap: 10, alignItems: 'center', fontWeight: 800 }}>
          <CheckCircle2 size={20} color="var(--accent)" /> Every habit checked off.
        </div>
      )}

      {items.map((h, i) => {
        const c = completions.find((x) => x.habit_id === h.id && x.date === today);
        const isAmount = h.habit_type === 'amount';
        const isAvoid = h.habit_type === 'avoid';
        const doneRow = isAvoid ? false : isAmount ? amountOf(c) >= (h.target_count || 1) : !!c;
        return (
          <div key={h.id} className={`qc-row animate-slide-up ${doneRow ? 'done' : ''}`} style={{ '--qc': h.color, animationDelay: `${i * 35}ms` }}
            onClick={() => (isAmount ? adjustAmount(h.id, today, doneRow ? -(amountOf(c) || 0) : 1) : toggleCompletion(h.id, today))}
          >
            <div className="qc-check" style={{ borderColor: doneRow ? h.color : undefined, background: doneRow ? h.color : undefined }}><Check size={17} strokeWidth={3} /></div>
            <DynIcon name={h.icon} size={19} color={h.color} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 750, fontSize: '0.95rem' }}>{h.name}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>
                {isAvoid ? 'Tap to log a slip' : isAmount ? `${amountOf(c)} / ${h.target_count} ${h.unit}` : h.category}
              </div>
            </div>
            {isAmount && c && !doneRow && (
              <span className="chip" style={{ color: 'var(--amber)' }}>{(c.amount || c.count || 0)}/{h.target_count}</span>
            )}
          </div>
        );
      })}

      <button className="btn" style={{ marginTop: 6 }} onClick={() => setUI({ quickCheckinMode: false })}>Done — back to dashboard (Esc)</button>
    </div>
  );
}
