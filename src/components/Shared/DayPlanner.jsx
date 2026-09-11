import React, { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, StickyNote, ListChecks, GraduationCap, Check } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, toStr, formatMonthYear, getMonthDays, getDay, amountOf, expectedOnDate, formatDisplay } from '../../lib/utils';
import { DAY_NAMES_SHORT, MONTH_NAMES } from '../../lib/constants';
import TodoRow, { PRIO_COLORS } from './TodoRow';
import DynIcon from './DynIcon';

/**
 * Month calendar for the dashboard.
 * Day cells carry icons for what's going on that day (reminders, homework)
 * and green shading proportional to how many habits were completed —
 * dimmer = less done, brighter = more. Tap a day to open its list of
 * to-dos (checkable right there) and the day note, rendered below the grid.
 */
export default function DayPlanner() {
  const { tasks, homework, completions, habits, vacationPeriods, subjects, dayNotes, selectedDay, setUI, toggleTask, toggleHomework, saveDayNote } = useStore();
  const [anchor, setAnchor] = useState(() => new Date());
  const today = getToday();
  const sel = selectedDay || today;
  useEffect(() => {
    if (selectedDay) setAnchor(new Date(selectedDay + 'T12:00:00'));
  }, [selectedDay]);

  const y = anchor.getFullYear();
  const m = anchor.getMonth();
  const days = getMonthDays(y, m);
  const lead = getDay(days[0]);

  const facts = useMemo(() => {
    const f = {};
    const put = (ds, patch) => { f[ds] = { todos: 0, hw: 0, notes: 0, habits: 0, ...(f[ds] || {}), ...Object.fromEntries(Object.entries(patch).map(([k, v]) => [k, (f[ds]?.[k] || 0) + v])) }; };
    tasks.filter((t) => t.status !== 'done' && !t.parent_id && t.due_date).forEach((t) => put(t.due_date, { todos: 1 }));
    homework.filter((h) => h.status !== 'completed' && h.due_date).forEach((h) => put(h.due_date, { hw: 1 }));
    dayNotes.filter((n) => n.content?.trim()).forEach((n) => put(n.date, { notes: 1 }));
    completions.forEach((c) => {
      const h = habits.find((x) => x.id === c.habit_id);
      if (!h || h.habit_type === 'avoid') return;
      put(c.date, { habits: 1 });
    });
    return f;
  }, [tasks, homework, completions, dayNotes, habits]);

  const maxHabits = useMemo(() => Math.max(3, ...Object.values(facts).map((x) => x.habits)), [facts]);

  const dayTasks = useMemo(() => tasks.filter((t) => !t.parent_id && t.due_date === sel), [tasks, sel]);
  const dayHw = useMemo(() => homework.filter((h) => h.due_date === sel), [homework, sel]);
  const note = dayNotes.find((n) => n.date === sel);
  const [noteDraft, setNoteDraft] = useState(note?.content || '');
  const [noteSaved, setNoteSaved] = useState(false);
  useEffect(() => { setNoteDraft(note?.content || ''); setNoteSaved(false); }, [sel]);
  useEffect(() => {
    const id = setTimeout(() => {
      if ((note?.content || '') !== noteDraft) { saveDayNote(sel, noteDraft); setNoteSaved(true); setTimeout(() => setNoteSaved(false), 1600); }
    }, 700);
    return () => clearTimeout(id);
  }, [noteDraft]);

  const doneHabitsSel = expectedOnDate(habits, vacationPeriods, sel).filter((h) =>
    completions.some((c) => c.habit_id === h.id && c.date === sel && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1)))
  );

  const cells = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  days.forEach((d) => cells.push(d));

  return (
    <div className="card card-pad dayplanner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span className="card-title" style={{ margin: 0 }}><ListChecks size={14} color="var(--blue)" /> Calendar</span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <button className="btn btn-icon btn-sm" onClick={() => setAnchor(new Date(y, m - 1, 1))}><ChevronLeft size={14} /></button>
          <span style={{ fontWeight: 800, fontSize: '0.82rem', minWidth: 108, textAlign: 'center' }}>{formatMonthYear(anchor)}</span>
          <button className="btn btn-icon btn-sm" onClick={() => setAnchor(new Date(y, m + 1, 1))}><ChevronRight size={14} /></button>
        </div>
      </div>

      <div className="cal-grid">
        {DAY_NAMES_SHORT.map((d) => <div key={d} className="cal-head">{d.slice(0, 1)}</div>)}
        {cells.map((d, i) => {
          if (!d) return <div key={`x${i}`} />;
          const ds = toStr(d);
          const f = facts[ds] || {};
          const shade = Math.min(1, (f.habits || 0) / maxHabits);
          const isSel = ds === sel;
          return (
            <button
              key={ds}
              className={`pcal-day ${ds === today ? 'today' : ''} ${isSel ? 'sel' : ''} ${ds > today ? 'future' : ''}`}
              onClick={() => setUI({ selectedDay: isSel ? null : ds })}
              title={`${f.todos || 0} reminders · ${f.hw || 0} homework · ${f.habits || 0} habits done`}
              style={{ background: shade > 0 ? `color-mix(in srgb, var(--accent) ${8 + shade * 34}%, var(--surface-2))` : undefined }}
            >
              <span className="pcal-num">{d.getDate()}</span>
              <span className="pcal-icons">
                {f.todos > 0 && <i className="p-dot" style={{ background: '#3b82f6' }} />}
                {f.hw > 0 && <i className="p-dot" style={{ background: '#f59e0b' }} />}
                {f.notes > 0 && <i className="p-dot" style={{ background: '#8b5cf6' }} />}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 9, fontSize: '0.64rem', color: 'var(--text-faint)', fontWeight: 700, flexWrap: 'wrap' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="p-dot" style={{ background: '#3b82f6' }} /> reminders</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="p-dot" style={{ background: '#f59e0b' }} /> homework</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="p-dot" style={{ background: '#8b5cf6' }} /> note</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><i className="p-dot" style={{ background: 'var(--accent)' }} /> habit shading</span>
      </div>

      {/* selected-day panel */}
      <div className="day-panel animate-slide-up" key={sel}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <b style={{ fontSize: '0.88rem' }}>{sel === today ? 'Today' : sel === toStr(new Date(new Date().getTime() + 86400000)) ? 'Tomorrow' : formatDisplay(sel).replace(/,\s\d{4}$/, '')}</b>
          <span style={{ marginLeft: 'auto', fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 700 }}>
            {doneHabitsSel.length} / {expectedOnDate(habits, vacationPeriods, sel).length} habits
          </span>
        </div>

        {dayTasks.length === 0 && dayHw.length === 0 && !doneHabitsSel.length ? (
          <p className="day-panel-empty">Nothing due this day. Quiet and clean.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {dayTasks.map((t) => (
              <TodoRow key={t.id} item={t} done={t.status === 'done'} color={PRIO_COLORS[t.priority] || '#3b82f6'}
                onToggle={() => toggleTask(t.id)} meta={{ priority: t.priority !== 'medium' ? t.priority : null }}
                onSelect={() => setUI({ currentView: 'tasks' })} />
            ))}
            {dayHw.map((h) => {
              const sub = subjects.find((x) => x.id === h.subject_id);
              return (
                <TodoRow key={h.id} item={h} done={h.status === 'completed'} color={sub?.color || '#f59e0b'}
                  onToggle={() => toggleHomework(h.id)} meta={{ subject: sub?.name, subjectColor: sub?.color }}
                  onSelect={() => setUI({ currentView: 'homework' })} />
              );
            })}
            {doneHabitsSel.length > 0 && (
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className="chip" style={{ color: 'var(--accent)' }}><Check size={9} /> done:</span>
                {doneHabitsSel.map((h) => (
                  <span key={h.id} className="chip" style={{ color: h.color }}><DynIcon name={h.icon} size={10} /> {h.name}</span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="field" style={{ marginTop: 8 }}>
          <label className="field-label"><StickyNote size={10} style={{ verticalAlign: -1 }} /> Day note {noteSaved && <span style={{ color: 'var(--accent)' }}>— saved</span>}</label>
          <textarea className="textarea" rows={3} placeholder={`What happened ${sel === today ? 'today' : `on ${MONTH_NAMES[m]} ${Number(sel.slice(8))}`}?`}
            value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)} />
        </div>
      </div>
    </div>
  );
}
