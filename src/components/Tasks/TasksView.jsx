import React, { useMemo, useState } from 'react';
import { ListChecks, Plus, Trash2, ChevronDown, ChevronRight, Flag, CalendarClock, X, AlignLeft, Check } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, formatShort } from '../../lib/utils';
import TodoRow, { PRIO_COLORS } from '../Shared/TodoRow';

const PRIORITIES = ['low', 'medium', 'high', 'urgent'];

export default function TasksView() {
  const { tasks } = useStore();
  const [draft, setDraft] = useState('');
  const [openId, setOpenId] = useState(null);
  const today = getToday();

  const root = tasks.filter((t) => !t.parent_id);
  const groups = useMemo(() => {
    const open = root.filter((t) => t.status !== 'done');
    const overdue = open.filter((t) => t.due_date && t.due_date < today);
    const todayL = open.filter((t) => t.due_date === today);
    const scheduled = open.filter((t) => t.due_date && t.due_date > today).sort((a, b) => a.due_date.localeCompare(b.due_date));
    const anytime = open.filter((t) => !t.due_date);
    const completed = root.filter((t) => t.status === 'done');
    return { overdue, today: todayL, scheduled, anytime, completed };
  }, [root, today]);

  const addTask = useStore((s) => s.addTask);
  const create = () => {
    if (!draft.trim()) return;
    const t = addTask({ title: draft });
    setDraft('');
    setOpenId(t.id);
  };

  return (
    <div className="rem-wrap" style={{ maxWidth: 620, margin: '0 auto' }}>
      <div className="page-head">
        <h2 className="page-title"><ListChecks size={22} color="var(--blue)" /> Reminders</h2>
        <p className="page-sub">
          {groups.today.length} today · {groups.overdue.length} overdue · {groups.anytime.length} anytime
        </p>
      </div>

      <div className="rem-card">
        <Section label="Overdue" color="#ef4444" items={groups.overdue} showDates openId={openId} setOpenId={setOpenId} />
        <Section label="Today" color="var(--text)" items={groups.today} openId={openId} setOpenId={setOpenId} />
        <Section label="Scheduled" color="var(--text-muted)" items={groups.scheduled} showDates openId={openId} setOpenId={setOpenId} />
        <Section label="All" color="var(--text-muted)" items={groups.anytime} openId={openId} setOpenId={setOpenId} />
        <div className="rem-add">
          <Plus size={17} color="var(--blue)" style={{ flexShrink: 0, marginTop: 2 }} />
          <input placeholder="Add a new reminder" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} />
        </div>
        {groups.completed.length > 0 && (
          <details className="rem-completed">
            <summary>{groups.completed.length} completed</summary>
            <div className="rem-list">
              {groups.completed.map((t) => <RemItem key={t.id} t={t} open={openId === t.id} setOpen={setOpenId} />)}
            </div>
          </details>
        )}
      </div>
    </div>
  );
}

function Section({ label, color, items, showDates, openId, setOpenId }) {
  const [collapsed, setCollapsed] = useState(false);
  if (!items.length) return null;
  return (
    <section className="rem-section">
      <button className="rem-head" onClick={() => setCollapsed((c) => !c)}>
        {collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        <span style={{ color, fontWeight: 800 }}>{label}</span>
        <span className="chip" style={{ marginLeft: 'auto' }}>{items.length}</span>
      </button>
      {!collapsed && (
        <div className="rem-list">
          {items.map((t) => <RemItem key={t.id} t={t} showDates={showDates} open={openId === t.id} setOpen={setOpenId} />)}
        </div>
      )}
    </section>
  );
}

function RemItem({ t, showDates, open, setOpen }) {
  const { tasks, updateTask, deleteTask, toggleTask, addTask, addToast } = useStore();
  const [subDraft, setSubDraft] = useState('');
  const today = getToday();
  const subs = tasks.filter((x) => x.parent_id === t.id);
  const subsDone = subs.filter((x) => x.status === 'done').length;
  const overdue = t.due_date && t.due_date < today && t.status !== 'done';
  const dueLabel = !t.due_date ? null : t.due_date === today ? 'Today' : overdue ? `${formatShort(t.due_date)} overdue` : formatShort(t.due_date);
  const isDone = t.status === 'done';

  return (
    <div className={`rem-item ${open ? 'open' : ''}`}>
      <TodoRow
        item={t}
        done={isDone}
        color={PRIO_COLORS[t.priority] || '#3b82f6'}
        onToggle={() => toggleTask(t.id)}
        onSelect={() => setOpen(open ? null : t.id)}
        meta={{
          dueLabel: showDates || overdue || t.due_date === today ? dueLabel : (!isDone && t.description ? t.description.slice(0, 44) : null),
          overdue,
          subs: subs.length,
          subsDone,
        }}
      >
        {open && (
          <button className="btn btn-ghost btn-icon" style={{ width: 26, height: 26 }} title="Delete reminder"
            onClick={(e) => { e.stopPropagation(); deleteTask(t.id); addToast({ type: 'info', message: 'Reminder deleted' }); }}>
            <X size={14} color="var(--text-faint)" />
          </button>
        )}
      </TodoRow>

      {open && (
        <div className="rem-detail animate-slide-up" onClick={(e) => e.stopPropagation()}>
          <div className="detail-grid">
            <div className="field">
              <label className="field-label"><CalendarClock size={10} style={{ verticalAlign: -1 }} /> Date</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input type="date" className="input" value={t.due_date || ''} onChange={(e) => updateTask(t.id, { due_date: e.target.value || null })} />
                {t.due_date && <button className="btn btn-sm" onClick={() => updateTask(t.id, { due_date: null })}>Clear</button>}
              </div>
            </div>
            <div className="field">
              <label className="field-label"><Flag size={10} style={{ verticalAlign: -1 }} /> Priority</label>
              <div style={{ display: 'flex', gap: 5 }}>
                {PRIORITIES.map((p) => (
                  <button key={p} className={`chip chip-btn ${t.priority === p ? 'on' : ''}`} style={t.priority === p ? { color: PRIO_COLORS[p], borderColor: PRIO_COLORS[p] } : {}} onClick={() => updateTask(t.id, { priority: p })}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="field">
            <label className="field-label"><AlignLeft size={10} style={{ verticalAlign: -1 }} /> Notes</label>
            <textarea className="textarea" rows={2} placeholder="Details…" value={t.description || ''} onChange={(e) => updateTask(t.id, { description: e.target.value })} />
          </div>
          <div className="field">
            <label className="field-label">Subtasks {subs.length > 0 && `(${subsDone}/${subs.length})`}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {subs.map((s) => (
                <div key={s.id} className="sub-row" style={{ opacity: s.status === 'done' ? 0.5 : 1 }}>
                  <button className="sub-check" style={{ background: s.status === 'done' ? 'var(--accent)' : undefined, borderColor: s.status === 'done' ? 'var(--accent)' : undefined }} onClick={() => toggleTask(s.id)}>
                    {s.status === 'done' && <Check size={9} strokeWidth={3.5} color="#fff" />}
                  </button>
                  <span style={{ flex: 1, textDecoration: s.status === 'done' ? 'line-through' : 'none', fontWeight: 600, fontSize: '0.84rem' }}>{s.title}</span>
                  <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22 }} onClick={() => deleteTask(s.id)}><Trash2 size={11} color="var(--text-faint)" /></button>
                </div>
              ))}
              <input className="input" style={{ padding: '7px 10px', fontSize: '0.8rem', background: 'transparent' }} placeholder="+ subtask (Enter)"
                value={subDraft} onChange={(e) => setSubDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && subDraft.trim()) { addTask({ title: subDraft.trim(), parent_id: t.id }); setSubDraft(''); } }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
