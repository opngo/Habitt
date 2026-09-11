import React, { useState } from 'react';
import {
  Check, Flame, MoreVertical, Pencil, Eye, EyeOff, Minus, Plus,
  Plane, Undo2, ChevronRight, GripVertical, Trash2,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  getToday, toStr, getCurrentStreak, isHabitScheduledOnDate, isOnVacation, amountOf,
  weekProgress, monthProgress, differenceInCalendarDaysSafe,
} from '../../lib/utils';
import DynIcon from '../Shared/DynIcon';

const CUBE_WEEKS = 9;

/**
 * Habit card.
 * - Click anywhere on the card to log today (amount habits add one unit).
 * - Each day is a small cube; numeric habits show a PARTIAL fill (4/10 → 40%)
 *   and the whole card gets dimmer the less progress made today.
 */
export default function HabitCard({ habit, dateStr, showHeat = true }) {
  const {
    completions, vacationPeriods, toggleCompletion, adjustAmount, setView, setUI,
    deleteHabit, toggleArchiveHabit, startVacation, endVacation,
  } = useStore();
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
  const progress = isAmount ? Math.min(1, amount / target) : !!todays ? 1 : 0;
  const complete = isAvoid ? false : progress >= 1;
  const streak = isAvoid
    ? differenceInCalendarDaysSafe(new Date(), new Date(hc.length ? hc.map((c) => c.date).sort().pop() + 'T12:00:00' : habit.created_at))
    : getCurrentStreak(habit, hc, vacationPeriods);
  const weekly = weekProgress(habit, hc, vacationPeriods);
  const monthly = monthProgress(habit, hc);
  const checklistDone = new Set(todays?.checklist_done || []);

  // heat cubes: CUBE_WEEKS weeks, newest on the right
  const cubes = [];
  for (let i = CUBE_WEEKS * 7 - 1; i >= 0; i--) {
    const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - i);
    const ds = toStr(d);
    const c = hc.find((x) => x.date === ds);
    const fill = isAvoid ? (c ? 1 : 0) : isAmount ? (c ? Math.min(1, amountOf(c) / target) : 0) : c ? 1 : 0;
    cubes.push({ ds, fill, isSlip: isAvoid && !!c, isToday: ds === today });
  }
  cubes.reverse();

  const stop = (e) => e.stopPropagation();
  const handleCardClick = () => {
    if (isAvoid) { toggleCompletion(habit.id, date); return; }
    if (isAmount) { complete ? adjustAmount(habit.id, date, -amount) : adjustAmount(habit.id, date, 1); return; }
    toggleCompletion(habit.id, date);
  };

  return (
    <article
      className={`card habit-card ${complete ? 'complete-glow' : ''}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') handleCardClick(); }}
      title={isAvoid ? 'Click to log a slip' : 'Click anywhere to log today'}
      style={{
        '--hc': habit.color,
        opacity: habit.archived ? 0.5 : 1,
        filter: complete ? 'none' : `brightness(${0.86 + progress * 0.14}) saturate(${0.75 + progress * 0.45})`,
        outline: onVacation ? '1.5px dashed var(--amber)' : 'none',
      }}
    >
      <div className="habit-top">
        <div className="habit-icon" onClick={(e) => { stop(e); setView('habit', habit.id); }} role="button" title="Open details">
          <DynIcon name={habit.icon} size={20} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <button
            className={`check-btn ${complete ? 'done' : ''}`}
            onClick={(e) => { stop(e); handleCardClick(); }}
            title={isAmount ? (complete ? 'Reset amount' : 'Add one unit') : complete ? 'Uncheck' : 'Mark done'}
          >
            <Check size={17} strokeWidth={3} />
          </button>
        </div>
      </div>

      {isAmount && (
        <div className="amount-row" onClick={stop}>
          <button className="amount-btn" onClick={() => adjustAmount(habit.id, date, -1)}><Minus size={13} /></button>
          <div style={{ flex: 1 }}>
            <div className="amount-labels">
              <span style={{ color: complete ? 'var(--accent)' : 'var(--text-muted)' }}>{amount} / {target} {habit.unit}</span>
              {checked0(amount) && !complete && <span style={{ color: 'var(--amber)' }}>keep going</span>}
              {complete && <span style={{ color: 'var(--accent)' }}>goal met</span>}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress * 100}%`, background: `linear-gradient(90deg, ${habit.color}, color-mix(in srgb, ${habit.color} 50%, #fff))` }} />
            </div>
          </div>
          <button className="amount-btn" onClick={() => adjustAmount(habit.id, date, 1)}><Plus size={13} /></button>
        </div>
      )}

      {habit.checklist?.length > 0 && (
        <div className="mini-checklist" onClick={stop}>
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

      {(weekly || monthly) && (() => {
        const p = weekly || monthly;
        const label = weekly ? `week ${p.done}/${p.target}` : `month ${p.done}/${p.target}`;
        return (
          <div onClick={stop} title="Flexible target progress">
            <div className="amount-labels"><span>This {label}</span><span style={{ color: p.met ? 'var(--accent)' : undefined }}>{p.met ? 'on track' : `${p.target - p.done} to go`}</span></div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${Math.min(100, (p.done / p.target) * 100)}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} /></div>
          </div>
        );
      })()}

      {showHeat && (
        <div className="heat-cubes" onClick={stop} title="Last 9 weeks — fill shows your amount, dimness shows less progress">
          {cubes.map((c) => (
            <span
              key={c.ds}
              className={`cube-cell ${c.isToday ? 'today' : ''} ${c.isSlip ? 'slip' : ''}`}
              title={`${c.ds}${c.fill > 0 ? ` — ${isAmount ? `${Math.round(c.fill * target)}/${target} ${habit.unit}` : isAvoid ? 'slip logged' : 'done'}` : ' — nothing logged'}`}
            >
              <span className="cube-fill" style={{ height: `${Math.round(c.fill * 100)}%`, background: c.isSlip ? 'var(--red)' : habit.color, opacity: c.fill > 0 && c.fill < 1 ? 0.75 : 1 }} />
            </span>
          ))}
        </div>
      )}

      <div className="habit-foot" onClick={stop}>
        <div style={{ position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} onClick={() => setMenu((m) => !m)} aria-label="Habit menu"><MoreVertical size={14} /></button>
          {menu && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 25 }} onClick={() => setMenu(false)} />
              <div className="card-menu" style={{ bottom: 30, left: 0, top: 'auto' }} onClick={() => setMenu(false)}>
                <button onClick={() => setUI({ showCreateModal: true, editingHabit: habit })}><Pencil size={14} /> Edit habit</button>
                {!isAvoid && (onVacation
                  ? <button onClick={() => endVacation(habit.id)}><Undo2 size={14} /> End vacation</button>
                  : <button onClick={() => startVacation(habit.id)}><Plane size={14} /> Vacation mode</button>)}
                <button onClick={() => toggleArchiveHabit(habit.id)}>{habit.archived ? <Eye size={14} /> : <EyeOff size={14} />} {habit.archived ? 'Unarchive' : 'Archive'}</button>
                <button className="danger" onClick={() => { if (confirm(`Delete "${habit.name}" and all its history?`)) deleteHabit(habit.id); }}><Trash2 size={14} /> Delete habit</button>
              </div>
            </>
          )}
        </div>
        <span className="chip heat-legend-cube"><span className="cube-cell legend" style={{ width: 9, height: 9 }}><span className="cube-fill" style={{ height: '100%', background: habit.color }} /></span>9 weeks</span>
        <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26, marginLeft: 'auto' }} onClick={() => setView('habit', habit.id)} title="Open details"><ChevronRight size={15} /></button>
      </div>
    </article>
  );
}

function checked0(amount) { return amount > 0; }
