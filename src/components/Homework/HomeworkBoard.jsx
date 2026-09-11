import React, { useMemo, useState } from 'react';
import { GraduationCap, Plus, Trash2, BookOpen, CalendarClock, CheckCircle2, Circle, Layers } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, formatShort } from '../../lib/utils';
import DynIcon from '../Shared/DynIcon';
import ColorPicker from '../Shared/ColorPicker';
import IconPicker from '../Shared/IconPicker';
import Modal from '../Shared/Modal';

const STATUSES = [
  { value: 'pending', label: 'To do', color: '#94a3b8' },
  { value: 'in_progress', label: 'Working on it', color: '#3b82f6' },
  { value: 'completed', label: 'Submitted', color: '#22c55e' },
];
const PRIOS = [
  { value: 'low', label: 'Low', color: '#94a3b8' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

export default function HomeworkBoard() {
  const { homework, subjects, addHomework, updateHomework, deleteHomework, toggleHomework, addSubject, updateSubject, deleteSubject, addToast } = useStore();
  const [filterSub, setFilterSub] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showNew, setShowNew] = useState(false);
  const [showSubjects, setShowSubjects] = useState(false);
  const [form, setForm] = useState({ title: '', subject_id: '', due_date: getToday(), priority: 'medium' });

  const items = useMemo(() => homework
    .filter((h) => (filterSub === 'all' || h.subject_id === filterSub))
    .filter((h) => (filterStatus === 'all' || h.status === filterStatus))
    .sort((a, b) => (a.due_date || '9999').localeCompare(b.due_date || '9999')),
  [homework, filterSub, filterStatus]);

  const stats = useMemo(() => {
    const pending = homework.filter((h) => h.status !== 'completed');
    const week = new Date(); week.setDate(week.getDate() + 7);
    return {
      open: pending.length,
      thisWeek: pending.filter((h) => h.due_date && new Date(h.due_date + 'T12:00:00') <= week).length,
      overdue: pending.filter((h) => h.due_date && h.due_date < getToday()).length,
      done: homework.length - pending.length,
    };
  }, [homework]);

  const create = () => {
    if (!form.title.trim()) { addToast({ type: 'error', message: 'Title required' }); return; }
    addHomework({ ...form, subject_id: form.subject_id || subjects[0]?.id || null, tags: [] });
    setForm({ title: '', subject_id: '', due_date: getToday(), priority: 'medium' });
    setShowNew(false);
    addToast({ type: 'success', message: 'Homework added' });
  };

  const cycle = (hw) => {
    const order = ['pending', 'in_progress', 'completed'];
    const next = order[(order.indexOf(hw.status) + 1) % 3];
    updateHomework(hw.id, { status: next, completed_at: next === 'completed' ? new Date().toISOString() : null });
    if (next === 'completed') { useStore.getState().addXp(10, true); addToast({ type: 'success', message: `${hw.title} submitted! +10 XP` }); }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h2 className="page-title"><GraduationCap size={22} color="var(--blue)" /> Homework</h2>
          <p className="page-sub">Track assignments by subject, never miss a due date.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setShowSubjects(true)}><Layers size={15} /> Subjects <span className="chip">{subjects.length}</span></button>
          <button className="btn btn-primary" onClick={() => setShowNew(true)}><Plus size={15} /> Add homework</button>
        </div>
      </div>

      <div className="grid grid-stats" style={{ marginBottom: 18 }}>
        {[
          { l: 'Open', v: stats.open, c: '#3b82f6', i: BookOpen },
          { l: 'Due in 7 days', v: stats.thisWeek, c: '#f59e0b', i: CalendarClock },
          { l: 'Overdue', v: stats.overdue, c: '#ef4444', i: CalendarClock },
          { l: 'Submitted', v: stats.done, c: '#22c55e', i: CheckCircle2 },
        ].map((s, i) => (
          <div key={s.l} className="card stat-card" style={{ '--i': i }}>
            <div className="stat-icon" style={{ background: `color-mix(in srgb, ${s.c} 13%, transparent)` }}><s.i size={20} color={s.c} /></div>
            <div><div className="stat-value">{s.v}</div><div className="stat-label">{s.l}</div></div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 7, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <button className={`chip chip-btn ${filterSub === 'all' ? 'on' : ''}`} onClick={() => setFilterSub('all')}>All subjects</button>
        {subjects.map((s) => (
          <button key={s.id} className={`chip chip-btn ${filterSub === s.id ? 'on' : ''}`} style={filterSub === s.id ? { color: s.color, borderColor: s.color, background: `color-mix(in srgb, ${s.color} 10%, transparent)` } : {}} onClick={() => setFilterSub(s.id)}>
            <DynIcon name={s.icon} size={11} /> {s.name}
          </button>
        ))}
        <div style={{ width: 1, height: 18, background: 'var(--border)', margin: '0 4px' }} />
        {['all', ...STATUSES.map((s) => s.value)].map((sv) => (
          <button key={sv} className={`chip chip-btn ${filterStatus === sv ? 'on' : ''}`} onClick={() => setFilterStatus(sv)}>{sv === 'all' ? 'Any status' : STATUSES.find((x) => x.value === sv).label}</button>
        ))}
      </div>

      {showNew && (
        <div className="card card-pad animate-slide-up" style={{ marginBottom: 16, borderColor: 'color-mix(in srgb, var(--blue) 35%, var(--border))' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <input className="input" autoFocus style={{ flex: 2, minWidth: 200 }} placeholder="Assignment title…" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && create()} />
            <select className="select" style={{ width: 160 }} value={form.subject_id || subjects[0]?.id || ''} onChange={(e) => setForm((f) => ({ ...f, subject_id: e.target.value }))}>
              {subjects.length === 0 && <option value="">No subjects yet</option>}
              {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input className="input" type="date" style={{ width: 150 }} value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} />
            <select className="select" style={{ width: 120 }} value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
              {PRIOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            <button className="btn btn-primary" onClick={create}>Add</button>
          </div>
          {subjects.length === 0 && <p style={{ margin: '10px 0 0', fontSize: '0.78rem', color: 'var(--amber)', fontWeight: 650 }}>Tip: open “Subjects” to create Math, History, … for color-coded tracking.</p>}
        </div>
      )}

      {items.length === 0 ? (
        <div className="empty" style={{ padding: '44px 22px' }}>
          <div className="empty-icon" style={{ background: 'rgba(59,130,246,0.12)' }}><GraduationCap size={28} color="var(--blue)" /></div>
          <h3 style={{ margin: 0 }}>Nothing here</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Add an assignment above, or change the filters.</p>
        </div>
      ) : (
        <div className="grid stagger" style={{ gap: 10 }}>
          {items.map((hw, i) => {
            const sub = subjects.find((s) => s.id === hw.subject_id);
            const st = STATUSES.find((x) => x.value === hw.status) || STATUSES[0];
            const overdue = hw.status !== 'completed' && hw.due_date && hw.due_date < getToday();
            const soon = hw.status !== 'completed' && hw.due_date && !overdue && new Date(hw.due_date + 'T12:00:00') - new Date(getToday() + 'T12:00:00') <= 2 * 86400000;
            const prio = PRIOS.find((p) => p.value === hw.priority) || PRIOS[1];
            return (
              <div key={hw.id} className="card" style={{ '--i': i, display: 'flex', alignItems: 'center', gap: 14, padding: '13px 16px', borderLeft: `4px solid ${sub?.color || st.color}`, opacity: hw.status === 'completed' ? 0.6 : 1 }}>
                <button className="btn btn-ghost btn-icon" onClick={() => cycle(hw)} title="Cycle status" style={{ width: 34, height: 34 }}>
                  {hw.status === 'completed' ? <CheckCircle2 size={22} color="var(--accent)" /> : hw.status === 'in_progress' ? <Circle size={22} color={sub?.color || '#3b82f6'} fill="color-mix(in srgb, currentColor 30%, transparent)" /> : <Circle size={22} color="var(--text-faint)" />}
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 750, fontSize: '0.92rem', textDecoration: hw.status === 'completed' ? 'line-through' : 'none' }}>{hw.title}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                    {sub && <span className="chip" style={{ color: sub.color }}><DynIcon name={sub.icon} size={10} /> {sub.name}</span>}
                    <span className="chip" style={{ color: st.color }}>{st.label}</span>
                    {hw.due_date && (
                      <span className="chip" style={overdue ? { color: 'var(--red)', borderColor: 'var(--red)' } : soon ? { color: 'var(--amber)' } : {}}>
                        <CalendarClock size={10} /> {hw.due_date === getToday() ? 'Due today' : `Due ${formatShort(hw.due_date)}`}
                      </span>
                    )}
                    <span className="chip" style={{ color: prio.color }}>▲ {prio.label}</span>
                  </div>
                </div>
                <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => deleteHomework(hw.id)}><Trash2 size={14} color="var(--text-faint)" /></button>
              </div>
            );
          })}
        </div>
      )}

      {showSubjects && <SubjectsModal onClose={() => setShowSubjects(false)} />}
    </div>
  );
}

function SubjectsModal({ onClose }) {
  const { subjects, addSubject, updateSubject, deleteSubject, homework } = useStore();
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', color: '#3b82f6', icon: 'BookOpen' });
  const [showIcons, setShowIcons] = useState(false);

  const save = () => {
    if (!form.name.trim()) return;
    if (editing) updateSubject(editing, form);
    else addSubject(form);
    setEditing(null); setForm({ name: '', color: '#3b82f6', icon: 'BookOpen' });
  };

  return (
    <Modal title="Subjects" icon={<Layers size={18} color="var(--blue)" />} onClose={onClose}
      footer={<button className="btn btn-primary" onClick={onClose}>Done</button>}>
      <p style={{ margin: 0, fontSize: '0.83rem', color: 'var(--text-muted)', marginTop: -4 }}>Subjects color-code your homework list.</p>
      <div className="form-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <input className="input" placeholder={editing ? 'Subject name' : 'New subject (e.g. Mathematics)'} value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} onKeyDown={(e) => e.key === 'Enter' && save()} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn" onClick={() => setShowIcons((s) => !s)} style={{ flex: 1 }}><DynIcon name={form.icon} size={16} color={form.color} /></button>
          <button className="btn btn-primary" onClick={save} style={{ flex: 1 }}>{editing ? 'Save' : 'Add'}</button>
        </div>
      </div>
      {showIcons && <div className="card card-pad animate-slide-up"><IconPicker selected={form.icon} onSelect={(n) => { setForm((f) => ({ ...f, icon: n })); setShowIcons(false); }} color={form.color} /></div>}
      <ColorPicker selected={form.color} onSelect={(c) => setForm((f) => ({ ...f, color: c }))} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {subjects.length === 0 && <p style={{ margin: 0, color: 'var(--text-faint)', fontSize: '0.84rem', fontStyle: 'italic' }}>No subjects yet.</p>}
        {subjects.map((s) => (
          <div key={s.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderLeft: `4px solid ${s.color}` }}>
            <DynIcon name={s.icon} size={18} color={s.color} />
            <b style={{ flex: 1 }}>{s.name}</b>
            <span className="chip">{homework.filter((h) => h.subject_id === s.id).length} homework</span>
            <button className="btn btn-sm" title="Edit" onClick={() => { setEditing(s.id); setForm({ name: s.name, color: s.color, icon: s.icon }); }}>Edit</button>
            <button className="btn btn-ghost btn-icon" title="Delete" onClick={() => { if (confirm(`Delete "${s.name}" and its homework?`)) deleteSubject(s.id); }}><Trash2 size={13} color="var(--red)" /></button>
          </div>
        ))}
      </div>
    </Modal>
  );
}
