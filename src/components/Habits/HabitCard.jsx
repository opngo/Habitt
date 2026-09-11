import React, { useState } from 'react';
import { Check, Flame, MoreVertical, Pencil, Trash2, Timer, Eye, EyeOff, ChevronUp, ChevronDown, Minus, Plus, Plane, Undo2 } from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  getToday, toStr, getCurrentStreak, isHabitScheduledOnDate, isOnVacation, amountOf,
  weekProgress, monthProgress, differenceInCalendarDaysSafe,
} from '../../lib/utils';
import DynIcon from '../Shared/DynIcon';

export default function HabitCard({ habit, dateStr }) {
  const store = useStore();
  const { completions, vacationPeriods, toggleCompletion, adjustAmount, setView, setUI, deleteHabit, toggleArchiveHabit, moveHabit, startVacation, endVacation } = store;
  const [menu, setMenu] = useState(false);
  const today = getToday();
  const date = dateStr || today;

  const hc = completions.filter((c) => c.habit_id === habit.id);
  const todays = hc.find((c) => c.date === date);
  const onVacation = isOnVacation(habit, vacationPeriods, date);
  const scheduled = isHabitScheduledOnDate(habit, date);
  const isAmount = habit.habit_type === 'amount';
  const isAvoid = habit.habit_type === 'avoid';
  const target = habit.target_count || 1;
  const amount = amountOf(todays);
  const checked = !!todays;
  const complete = isAvoid ? false : isAmount ? amount >= target : checked;
  const streak = isAvoid
    ? differenceInCalendarDaysSafe(new Date(), new Date(hc.length ? hc.map((c) => c.date).sort().pop() + 'T12:00:00' : habit.created_at))
    : getCurrentStreak(habit, hc, vacationPeriods);
  const weekly = weekProgress(habit, hc, vacationPeriods);
  const monthly = monthProgress(habit, hc);
  const checklistDone = new Set(todays?.checklist_done || []);

  // last 15 days strip
  const strip = [];
  for (let i = 14; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const ds = toStr(d);
    const c = hc.find((x) => x.date === ds);
    const lit = isAvoid ? false : !!c && (!isAmount || amountOf(c) >= target);
    strip.push({ ds, lit, future: false, isToday: ds === today });
  }

  const handleClick = () => {
    if (isAmount) { adjustAmount(habit.id, date, complete ? -amount : 1); return; }
    toggleCompletion(habit.id, date);
  };

  return (
    <article className="card card-hover habit-card" style={{ '--hc': habit.color, opacity: habit.archived ? 0.55 : 1, outline: onVacation ? '1.5px dashed var(--amber)' : 'none' }}>
      <div className="habit-top">
        <div className="habit-icon"><DynIcon name={habit.icon} size={20} /></div>
        <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => setView('habit', habit.id)}>
          <div className="habit-name">{habit.name}</div>
          <div className="habit-meta">
            {habit.archived && <span className="chip">Archived</span>}
            {!scheduled && !onVacation && <span className="chip">Rest day</span>}
            {onVacation && <span className="chip" style={{ color: 'var(--amber)', borderColor: 'color-mix(in srgb, var(--amber) 40%, transparent)' }}><Plane size={10} /> Vacation</span>}
            <span className="habit-fade" style={{ color: streak > 0 ? '#f97316' : undefined, fontWeight: streak > 0 ? 800 : 600 }}>
              <Flame size={11} style={{ verticalAlign: -1 }} /> {isAvoid ? `${streak} clean` : `${streak}d`}
            </span>
            <span className="habit-fade">{habit.category}</span>
          </div>
        </div>
        <button
          className={`check-btn ${complete ? 'done' : ''}`}
          onClick={handleClick}
          title={isAmount ? (complete ? 'Reset amount' : 'Add to amount') : complete ? 'Uncheck' : 'Mark done'}
          style={checked && !complete ? { borderColor: habit.color } : {}}
        >
          <Check size={18} strokeWidth={3} />
        </button>
      </div>

      {isAmount && (
        <div className="amount-row">
          <button className="amount-btn" onClick={() => adjustAmount(habit.id, date, -1)}><Minus size={13} /></button>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', fontWeight: 700, marginBottom: 4 }}>
              <span style={{ color: complete ? 'var(--accent)' : 'var(--text-muted)' }}>{amount} / {target} {habit.unit}</span>
              {checked && !complete && <span style={{ color: 'var(--amber)' }}>Keep going…</span>}
              {complete && <span style={{ color: 'var(--accent)' }}>Goal met ✓</span>}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${Math.min(100, (amount / target) * 100)}%`, background: `linear-gradient(90deg, ${habit.color}, color-mix(in srgb, ${habit.color} 50%, #fff))` }} />
            </div>
          </div>
          <button className="amount-btn" onClick={() => adjustAmount(habit.id, date, 1)}><Plus size={13} /></button>
        </div>
      )}

      {habit.checklist?.length > 0 && (
        <div className="mini-checklist">
          {habit.checklist.map((item) => {
            const done = checklistDone.has(item);
            return (
              <div key={item} className={`mini-check ${done ? 'done' : ''}`} onClick={() => {
                const s = useStore.getState();
                const ex = s.completions.find((c) => c.habit_id === habit.id && c.date === date);
                if (!ex) s.toggleCompletion(habit.id, date);
                s.toggleChecklistItem(habit.id, date, item);
              }}>
                <span className="box">{done && <Check size={10} strokeWidth={3.5} />}</span>{item}
              </div>
            );
          })}
        </div>
      )}

      {isAvoid && (
        <button
          className="btn btn-sm"
          style={checked
            ? { borderColor: 'var(--red)', color: '#fff', background: 'var(--red)' }
            : { borderColor: 'color-mix(in srgb, var(--red) 45%, transparent)', color: 'var(--red)' }}
          onClick={() => toggleCompletion(habit.id, date)}
        >
          {checked ? 'Slip logged — tap to undo' : 'Log a slip'}
        </button>
      )}

      {(weekly || monthly) && (() => {
        const p = weekly || monthly;
        const lbl = weekly ? `week (${p.done}/${p.target})` : `month (${p.done}/${p.target})`;
        return (
          <div title={`Flexible target — ${lbl}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 4 }}>
              <span>This {lbl}</span><span style={{ color: p.met ? 'var(--accent)' : undefined }}>{p.met ? 'On track ✓' : `${p.target - p.done} to go`}</span>
            </div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (p.done / p.target) * 100)}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} /></div>
          </div>
        );
      })()}

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 'auto' }}>
        <div className="mini-heat" style={{ flex: 1 }} title="Last 15 days">
          {strip.map((d) => (
            <div key={d.ds} className={`mini-cell ${d.lit ? 'l2' : ''} ${d.isToday ? 'today' : ''}`} />
          ))}
        </div>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" style={{ width: 28, height: 28 }} onClick={() => setMenu((m) => !m)} aria-label="Habit menu"><MoreVertical size={15} /></button>
          {menu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 25 }} onClick={() => setMenu(false)} />
              <div className="card-menu" style={{ top: 30, right: 0 }} onClick={() => setMenu(false)}>
                <button onClick={() => setView('habit', habit.id)}><Eye size={14} /> View details</button>
                <button onClick={() => setUI({ showCreateModal: true, editingHabit: habit })}><Pencil size={14} /> Edit habit</button>
                {!isAvoid && (onVacation
                  ? <button onClick={() => endVacation(habit.id)}><Undo2 size={14} /> End vacation</button>
                  : <button onClick={() => startVacation(habit.id)}><Plane size={14} /> Vacation mode</button>)}
                <button onClick={() => setUI({ showFocusTimer: true, focusTimerHabitId: habit.id })}><Timer size={14} /> Focus on this</button>
                <button onClick={() => moveHabit(habit.id, -1)}><ChevronUp size={14} /> Move up</button>
                <button onClick={() => moveHabit(habit.id, 1)}><ChevronDown size={14} /> Move down</button>
                <button onClick={() => toggleArchiveHabit(habit.id)}>{habit.archived ? <Eye size={14} /> : <EyeOff size={14} />} {habit.archived ? 'Unarchive' : 'Archive'}</button>
                <button className="danger" onClick={() => { if (confirm(`Delete "${habit.name}" and all its history?`)) deleteHabit(habit.id); }}><Trash2 size={14} /> Delete habit</button>
              </div>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
