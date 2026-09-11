import React, { useMemo, useState } from 'react';
import {
  ArrowLeft, Pencil, Flame, Trophy, CalendarDays, Percent, Plane, Undo2, Timer, Trash2,
  Gauge, ShieldAlert, NotebookPen, Target, Zap, Check,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  getToday, toStr, getCurrentStreak, getLongestStreak, getHabitStrength, getCompletionRate,
  getLast30Days, getLast7Days, getDay, subDays, isHabitScheduledOnDate, isOnVacation, amountOf,
  formatShort, formatDisplay, getWeeksFromDays, getCompletionIntensity,
} from '../../lib/utils';
import { DAY_NAMES_SHORT, DIFFICULTIES } from '../../lib/constants';
import Heatmap from '../Heatmap/YearHeatmap';
import DayNoteEditor from '../Shared/DayNoteEditor';
import MonthCalendar from '../Shared/MonthCalendar';
import DynIcon from '../Shared/DynIcon';
import { getDayOfWeekStats } from '../../lib/utils';

export default function HabitDetailPage() {
  const { selectedHabitId, setView, habits, completions, vacationPeriods, toggleCompletion, startVacation, endVacation, deleteHabit, setUI, toggleChecklistItem, adjustAmount } = useStore();
  const habit = habits.find((h) => h.id === selectedHabitId);
  const [calOpen, setCalOpen] = useState(false);
  const [noteDay, setNoteDay] = useState(null);

  const hc = useMemo(() => (habit ? completions.filter((c) => c.habit_id === habit.id) : []), [completions, habit]);

  if (!habit) {
    return (
      <div className="empty">
        <p style={{ fontWeight: 700 }}>Habit not found</p>
        <button className="btn btn-primary" onClick={() => setView('dashboard')}>Back to dashboard</button>
      </div>
    );
  }

  const today = getToday();
  const todays = hc.find((c) => c.date === today);
  const isAmount = habit.habit_type === 'amount';
  const isAvoid = habit.habit_type === 'avoid';
  const target = habit.target_count || 1;
  const complete = isAvoid ? false : isAmount ? amountOf(todays) >= target : !!todays;
  const current = getCurrentStreak(habit, hc, vacationPeriods);
  const longest = getLongestStreak(habit, hc, vacationPeriods);
  const strength = getHabitStrength(hc);
  const rate30 = getCompletionRate([habit], hc, vacationPeriods, getLast30Days());
  const rate7 = getCompletionRate([habit], hc, vacationPeriods, getLast7Days());
  const onVacation = isOnVacation(habit, vacationPeriods, today);
  const diff = DIFFICULTIES.find((d) => d.value === habit.difficulty) || DIFFICULTIES[1];

  // last 30 days list, newest first
  const recent = Array.from({ length: 30 }, (_, i) => toStr(subDays(new Date(), i)));
  const marks = {};
  recent.forEach((ds) => { const c = hc.find((x) => x.date === ds); if (c && !isAvoid) marks[ds] = { count: 1, color: habit.color }; });

  const dowStats = useMemo(() => getDayOfWeekStats([habit], hc, vacationPeriods), [habit, hc, vacationPeriods]);
  const maxDow = Math.max(1, ...dowStats.map((d) => d.done));

  const history = [...hc].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 60);

  return (
    <div className="animate-fade-in">
      <button className="btn btn-sm" style={{ marginBottom: 14 }} onClick={() => setView('dashboard')}><ArrowLeft size={14} /> Dashboard</button>

      {/* Header */}
      <div className="card card-pad" style={{ marginBottom: 18, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', '--hc': habit.color, borderLeft: `4px solid ${habit.color}` }}>
        <div className="habit-icon" style={{ width: 56, height: 56, borderRadius: 16 }}><DynIcon name={habit.icon} size={28} /></div>
        <div style={{ flex: 1, minWidth: 200 }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>{habit.name}</h1>
          <p style={{ margin: '3px 0 0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {habit.description || 'No description'}
          </p>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            <span className="chip">{habit.category}</span>
            <span className="chip">{isAvoid ? <><ShieldAlert size={10} /> avoid</> : isAmount ? <><Gauge size={10} /> {target} {habit.unit}</> : 'daily check'}</span>
            <span className="chip">{diff.label}</span>
            {habit.tags?.map((t) => <span key={t} className="chip">#{t}</span>)}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {!isAvoid && (onVacation
            ? <button className="btn btn-sm" onClick={() => endVacation(habit.id)}><Undo2 size={14} /> End vacation</button>
            : <button className="btn btn-sm" onClick={() => startVacation(habit.id)}><Plane size={14} /> Vacation</button>)}
          <button className="btn btn-sm" onClick={() => { setUI({ focusTimerHabitId: habit.id }); setView('focus'); }}><Timer size={14} /> Focus</button>
          <button className="btn btn-sm" onClick={() => setUI({ showCreateModal: true, editingHabit: habit })}><Pencil size={14} /> Edit</button>
          <button className="btn btn-sm btn-danger" onClick={() => { if (confirm(`Delete "${habit.name}" and its history?`)) { deleteHabit(habit.id); setView('dashboard'); } }}><Trash2 size={14} /></button>
        </div>
      </div>

      {/* Check-in card */}
      <div className="card" style={{ marginBottom: 18, padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: complete ? `color-mix(in srgb, ${habit.color} 7%, var(--surface))` : undefined }}>
        <button className={`check-btn ${complete ? 'done' : ''}`} style={{ width: 52, height: 52 }} onClick={() => { if (isAmount) adjustAmount(habit.id, today, complete ? -amountOf(todays) : 1); else toggleCompletion(habit.id, today); }}>
          <Check size={22} strokeWidth={3} />
        </button>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ fontWeight: 800 }}>{today === toStr(new Date()) ? 'Today' : formatDisplay(today)}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            {isAvoid ? (todays ? 'A slip was logged today — clean days reset.' : `No slips — ${current} clean ${current === 1 ? 'day' : 'days'}. Keep it up!`) :
              isAmount ? `${amountOf(todays)} / ${target} ${habit.unit}` :
                complete ? 'Completed — nice work!' : isHabitScheduledOnDate(habit, today) ? 'Not checked yet' : 'Scheduled rest day — checking is optional'}
          </div>
          {isAmount && (
            <div className="progress-track" style={{ marginTop: 8 }}>
              <div className="progress-fill" style={{ width: `${Math.min(100, (amountOf(todays) / target) * 100)}%`, background: habit.color }} />
            </div>
          )}
        </div>
        {habit.checklist?.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 180 }}>
            {habit.checklist.map((item) => {
              const done = (todays?.checklist_done || []).includes(item);
              return (
                <div key={item} className={`mini-check ${done ? 'done' : ''}`} onClick={() => {
                  const s = useStore.getState();
                  if (!todays) s.toggleCompletion(habit.id, today);
                  s.toggleChecklistItem(habit.id, today, item);
                }}>
                  <span className="box">{done && <Check size={10} strokeWidth={3.5} />}</span>{item}
                </div>
              );
            })}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: 150 }}>
          <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Habit strength</span>
          <div className="progress-track" style={{ height: 8 }}>
            <div className="progress-fill" style={{ width: `${strength}%`, background: 'linear-gradient(90deg, #f59e0b, #22c55e)' }} />
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 650 }}>{strength}% — grows with consistency, decays when missed</span>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-stats stagger" style={{ marginBottom: 18 }}>
        {[
          { icon: Flame, label: isAvoid ? 'Clean days' : 'Current streak', value: current, color: '#f97316' },
          { icon: Trophy, label: 'Longest streak', value: longest, color: '#f59e0b' },
          { icon: CalendarDays, label: 'Total check-ins', value: hc.length, color: '#3b82f6' },
          { icon: Percent, label: 'Rate · last 30 days', value: `${rate30}%`, color: '#22c55e' },
          { icon: Target, label: 'Rate · last 7 days', value: `${rate7}%`, color: '#8b5cf6' },
        ].map((s, i) => (
          <div key={s.label} className="card stat-card" style={{ '--i': i }}>
            <div className="stat-icon" style={{ background: `color-mix(in srgb, ${s.color} 13%, transparent)` }}><s.icon size={20} color={s.color} /></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        <div className="card card-pad">
          <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 800 }}>All-time heatmap</h3>
          <Heatmap habitId={habit.id} />
        </div>
        <div className="card card-pad">
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 10 }}>
            <h3 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 800 }}>Last 30 days</h3>
            <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setCalOpen((o) => !o)}><CalendarDays size={13} /> Calendar view</button>
          </div>
          {calOpen ? (
            <MonthCalendar marks={marks} monthInit={today} onSelect={(ds) => setNoteDay((d) => (d === ds ? null : ds))} />
          ) : (
            <div className="mini-heat" style={{ flexWrap: 'wrap', gap: 6, alignItems: 'stretch' }}>
              {recent.map((ds) => {
                const c = hc.find((x) => x.date === ds);
                const lit = c && !isAvoid;
                const amt = isAmount && c ? Math.min(1, amountOf(c) / target) : lit ? 1 : 0;
                return (
                  <div key={ds} title={`${formatShort(ds)} — ${isAvoid ? (c ? 'slip' : 'clean') : (lit ? (isAmount ? `${amountOf(c)}/${target} ${habit.unit}` : 'done') : 'missed')}`}
                    onClick={() => setNoteDay((d) => (d === ds ? null : ds))}
                    style={{ width: 26, height: 26, borderRadius: 8, background: lit ? `color-mix(in srgb, ${habit.color} ${35 + amt * 60}%, var(--surface-2))` : 'var(--surface-2)', border: '1px solid var(--border)', cursor: 'pointer' }} />
                );
              })}
            </div>
          )}
          {noteDay && <DayNoteEditor date={noteDay} onClose={() => setNoteDay(null)} />}
          <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
            {dowStats.map((d) => (
              <div key={d.index} style={{ flex: 1, minWidth: 40, textAlign: 'center' }} title={`${d.done} of ${d.expected || 0} possible`}>
                <div style={{ height: 46, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
                  <div style={{ width: '100%', maxWidth: 26, borderRadius: 6, height: `${(d.done / maxDow) * 100}%`, minHeight: d.done ? 5 : 2, background: d.done ? habit.color : 'var(--surface-3)', opacity: 0.8 }} />
                </div>
                <div style={{ fontSize: '0.66rem', fontWeight: 700, color: 'var(--text-faint)', marginTop: 4 }}>{DAY_NAMES_SHORT[d.index].slice(0, 2)}</div>
              </div>
            ))}
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 6, fontWeight: 600 }}>Day-of-week pattern (last 12 weeks)</div>
        </div>
      </div>

      {/* History */}
      <div className="card card-pad">
        <h3 style={{ margin: '0 0 10px', fontSize: '0.9rem', fontWeight: 800 }}>History <span style={{ color: 'var(--text-faint)', fontWeight: 600 }}>· latest {Math.min(60, hc.length)}</span></h3>
        {history.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>No {isAvoid ? 'slips' : 'check-ins'} logged yet. History shows up here.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {history.map((c) => (
              <HistoryRow key={c.id} c={c} habit={habit} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function HistoryRow({ c, habit }) {
  const { setCompletionNote, toggleCompletion } = useStore();
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState(c.note || '');
  const isAmount = habit.habit_type === 'amount';
  const met = isAmount ? amountOf(c) >= (habit.target_count || 1) : true;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 4px', borderBottom: '1px solid var(--border)', fontSize: '0.84rem' }}>
      <div style={{ width: 26, height: 26, borderRadius: 8, flexShrink: 0, background: met ? `color-mix(in srgb, ${habit.color} 18%, transparent)` : 'color-mix(in srgb, var(--red) 14%, transparent)', color: met ? habit.color : 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {met ? <Check size={13} strokeWidth={3} /> : <span style={{ fontWeight: 800, fontSize: '0.62rem' }}>{amountOf(c)}</span>}
      </div>
      <div style={{ fontWeight: 700, width: 92, flexShrink: 0 }}>
        {formatShort(c.date)}
        <div style={{ fontSize: '0.64rem', color: 'var(--text-faint)', fontWeight: 600 }}>{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][getDay(new Date(c.date + 'T12:00:00'))]}</div>
      </div>
      <div style={{ flex: 1, color: c.note ? 'var(--text-muted)' : 'var(--text-faint)', fontStyle: c.note ? 'normal' : 'italic', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {editing ? (
          <input className="input" style={{ padding: '5px 9px', fontSize: '0.8rem' }} autoFocus value={note} onChange={(e) => setNote(e.target.value)}
            onBlur={() => { setCompletionNote(habit.id, c.date, note.trim()); setEditing(false); }}
            onKeyDown={(e) => { if (e.key === 'Enter') { setCompletionNote(habit.id, c.date, note.trim()); setEditing(false); } }} />
        ) : (c.note || 'No note')}
      </div>
      {isAmount && <span className="chip">{amountOf(c)}/{habit.target_count} {habit.unit}</span>}
      {!editing && <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} title="Add note" onClick={() => setEditing(true)}><NotebookPen size={13} /></button>}
      <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} title={habit.habit_type === 'avoid' ? 'Undo slip' : 'Delete entry'} onClick={() => toggleCompletion(habit.id, c.date)}><Trash2 size={13} /></button>
    </div>
  );
}
