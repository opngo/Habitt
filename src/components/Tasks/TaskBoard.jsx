import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Search, Flag, Clock, ChevronDown, ChevronRight, ListChecks, Tag, Circle } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday } from '../../lib/utils';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#94a3b8' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#f97316' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444' },
];
const COLUMNS = [
  { value: 'todo', label: 'To do', color: '#94a3b8' },
  { value: 'in_progress', label: 'In progress', color: '#3b82f6' },
  { value: 'done', label: 'Done', color: '#22c55e' },
];

export default function TaskBoard() {
  const { tasks, addTask, deleteTask, toggleTask, updateTask, addToast } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [prio, setPrio] = useState('medium');
  const [due, setDue] = useState('');
  const [title, setTitle] = useState('');
  const [subOpen, setSubOpen] = useState(new Set());
  const [drag, setDrag] = useState(null);
  const [overCol, setOverCol] = useState(null);

  const match = (t) => !search || t.title.toLowerCase().includes(search.toLowerCase()) || (t.tags || []).some((x) => x.toLowerCase().includes(search.toLowerCase()));
  const root = (status) => tasks.filter((t) => !t.parent_id && t.status === status && match(t))
    .sort((a, b) => ({ urgent: 0, high: 1, medium: 2, low: 3 }[a.priority] ?? 2) - ({ urgent: 0, high: 1, medium: 2, low: 3 }[b.priority] ?? 2) || (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const subs = (id) => tasks.filter((t) => t.parent_id === id);
  const counts = useMemo(() => COLUMNS.map((c) => root(c.value).length), [tasks, search]); // eslint-disable-line

  const create = () => {
    if (!title.trim()) return;
    addTask({ title, priority: prio, due_date: due || null });
    setTitle(''); setDue(''); setShowNew(false);
    addToast({ type: 'success', message: 'Task added' });
  };

  const drop = (status) => {
    if (drag) { updateTask(drag, { status, completed_at: status === 'done' ? new Date().toISOString() : null }); if (status === 'done') useStore.getState().addXp(5, true); }
    setDrag(null); setOverCol(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h2 className="page-title"><ListChecks size={22} color="var(--accent)" /> Tasks</h2>
          <p className="page-sub">Drag between columns, tick things off, earn XP.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input className="input" style={{ width: 190, padding: '8px 10px 8px 30px', fontSize: '0.82rem' }} placeholder="Search tasks…" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setShowNew((s) => !s)}><Plus size={15} /> New task</button>
        </div>
      </div>

      {showNew && (
        <div className="card card-pad animate-slide-up" style={{ marginBottom: 16, borderColor: 'color-mix(in srgb, var(--accent) 35%, var(--border))' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className="input" autoFocus style={{ flex: 2, minWidth: 220 }} placeholder="What needs doing?" value={title} onChange={(e) => setTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()} />
            <select className="select" style={{ width: 130 }} value={prio} onChange={(e) => setPrio(e.target.value)}>
              {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <input className="input" type="date" style={{ width: 150 }} value={due} onChange={(e) => setDue(e.target.value)} />
            <button className="btn btn-primary" onClick={create}>Add</button>
          </div>
        </div>
      )}

      <div className="kanban">
        {COLUMNS.map((col, ci) => {
          const items = root(col.value);
          return (
            <div key={col.value} className={`kanban-col ${overCol === col.value ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setOverCol(col.value); }}
              onDragLeave={() => setOverCol(null)}
              onDrop={() => drop(col.value)}
            >
              <div className="kanban-col-head">
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                {col.label}
                <span className="chip" style={{ marginLeft: 'auto' }}>{items.length}</span>
              </div>
              {items.length === 0 && <div style={{ padding: '18px 8px', textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.78rem', fontWeight: 600, border: '1.5px dashed var(--border-strong)', borderRadius: 12 }}>Drop or add tasks here</div>}
              {items.map((t) => {
                const s = subs(t.id);
                const done = s.filter((x) => x.status === 'done').length;
                const p = PRIORITIES.find((x) => x.value === t.priority) || PRIORITIES[1];
                const overdue = t.due_date && t.due_date < getToday() && t.status !== 'done';
                return (
                  <div key={t.id}>
                    <div className={`task-card ${t.status === 'done' ? 'done-card' : ''} ${drag === t.id ? 'dragging' : ''}`} draggable
                      onDragStart={() => setDrag(t.id)} onDragEnd={() => { setDrag(null); setOverCol(null); }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                        <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24, marginTop: -2 }} onClick={() => toggleTask(t.id)} title="Toggle done">
                          {t.status === 'done' ? <Circle size={15} fill="currentColor" style={{ color: 'var(--accent)' }} /> : <Circle size={15} style={{ color: p.color }} />}
                        </button>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="task-title">{t.title}</div>
                          <div style={{ display: 'flex', gap: 5, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                            <span className="chip" style={{ color: p.color }}><Flag size={9} /> {p.label}</span>
                            {t.due_date && <span className="chip" style={overdue ? { color: 'var(--red)', borderColor: 'var(--red)' } : {}}><Clock size={9} /> {t.due_date === getToday() ? 'Today' : t.due_date.slice(5).replace('-', '/')}</span>}
                            {(t.tags || []).map((tg) => <span key={tg} className="chip"><Tag size={8} /> {tg}</span>)}
                            <button className="chip chip-btn" onClick={() => setSubOpen((o) => { const n = new Set(o); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; })}>
                              {subOpen.has(t.id) ? <ChevronDown size={10} /> : <ChevronRight size={10} />} {s.length ? `${done}/${s.length} sub` : '+ subtask'}
                            </button>
                            <button className="btn btn-ghost btn-icon" style={{ width: 22, height: 22, marginLeft: 'auto', color: 'var(--text-faint)' }} title="Delete"
                              onClick={() => deleteTask(t.id)}><Trash2 size={12} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {subOpen.has(t.id) && (
                      <div style={{ marginBottom: 8 }}>
                        {s.map((sub) => (
                          <div key={sub.id} className="subtask-row" style={{ opacity: sub.status === 'done' ? 0.55 : 1, textDecoration: sub.status === 'done' ? 'line-through' : 'none' }} onClick={() => toggleTask(sub.id)}>
                            <span style={{ width: 14, height: 14, borderRadius: 5, border: '1.5px solid var(--border-strong)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0, background: sub.status === 'done' ? 'var(--accent)' : undefined, fontSize: 9 }}>{sub.status === 'done' && '✓'}</span>
                            {sub.title}
                            <button className="btn btn-ghost btn-icon" style={{ width: 20, height: 20, marginLeft: 'auto', color: 'var(--text-faint)' }} onClick={(e) => { e.stopPropagation(); deleteTask(sub.id); }}><Trash2 size={11} /></button>
                          </div>
                        ))}
                        <AddSub parentId={t.id} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 14, fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>
        Tip: drag cards between columns, use the circle to toggle done, and “+ subtask” to break work down. +5 XP per completed task.
      </div>
    </div>
  );
}

function AddSub({ parentId }) {
  const [v, setV] = useState('');
  const { addTask } = useStore();
  return (
    <input className="input" style={{ marginTop: 4, padding: '6px 10px', fontSize: '0.78rem', background: 'transparent' }} placeholder="+ subtask (Enter)"
      value={v} onChange={(e) => setV(e.target.value)}
      onKeyDown={(e) => { if (e.key === 'Enter' && v.trim()) { addTask({ title: v.trim(), parent_id: parentId, priority: 'medium' }); setV(''); } }} />
  );
}
