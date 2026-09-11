import React, { useMemo, useState } from 'react';
import { CheckSquare, Plus, Archive, Search, ArrowUpDown, LayoutGrid, Rows3, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { expectedOnDate, getToday, amountOf } from '../../lib/utils';
import HabitCard from './HabitCard';

export default function HabitsView() {
  const { habits, completions, vacationPeriods, setUI, setView } = useStore();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('manual'); // manual | name | streak | recent
  const [mode, setMode] = useState('active'); // active | archived | all
  const [showDone, setShowDone] = useState(true);
  const today = getToday();

  const list = useMemo(() => {
    let l = [...habits];
    if (mode === 'active') l = l.filter((h) => !h.archived);
    if (mode === 'archived') l = l.filter((h) => h.archived);
    if (q) l = l.filter((h) => `${h.name} ${h.description} ${h.category}`.toLowerCase().includes(q.toLowerCase()));
    const streakOf = (h) => h._streak || 0;
    if (sort === 'name') l.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'streak') l.sort((a, b) => streakOf(b) - streakOf(a));
    if (sort === 'recent') l.sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
    if (sort === 'manual') l.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    // annotate streaks for sorting
    if (sort === 'streak') {
      l = l.map((h) => ({ ...h, _streak: h.habit_type === 'avoid' ? 0 : streakOf(h) }));
    }
    if (!showDone && mode !== 'archived') {
      l = l.filter((h) => {
        if (h.archived) return true;
        const scheduled = expectedOnDate([h], vacationPeriods, today).length > 0 || h.habit_type === 'avoid';
        if (!scheduled) return true;
        const c = completions.find((x) => x.habit_id === h.id && x.date === today);
        if (h.habit_type === 'amount') return !c || amountOf(c) < (h.target_count || 1);
        return !c;
      });
    }
    return l;
  }, [habits, q, sort, mode, showDone, completions, vacationPeriods, today]);

  const archivedCount = habits.filter((h) => h.archived).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 16 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 className="page-title"><CheckSquare size={22} color="var(--accent)" /> Habits</h2>
          <p className="page-sub">{habits.filter((h) => !h.archived).length} active · tap any card to log it for today</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-sm" onClick={() => setUI({ showTemplates: true })}><Sparkles size={13} color="var(--violet)" /> Templates</button>
          <button className="btn btn-sm btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={13} /> New habit</button>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 14, padding: '10px 12px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 180px', maxWidth: 260 }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input className="input" style={{ paddingLeft: 29, padding: '7px 10px 7px 29px', fontSize: '0.82rem' }} placeholder="Search habits…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 5 }}>
            {['active', 'archived', 'all'].map((m) => (
              <button key={m} className={`chip chip-btn ${mode === m ? 'on' : ''}`} onClick={() => setMode(m)}>
                {m}{m === 'archived' && archivedCount ? ` (${archivedCount})` : ''}
              </button>
            ))}
          </div>
          <select className="select" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.78rem' }} value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="manual">Custom order</option>
            <option value="name">Name A–Z</option>
            <option value="streak">By streak</option>
            <option value="recent">Newest first</option>
          </select>
          <label className="chip chip-btn" style={{ cursor: 'pointer' }} onClick={() => setShowDone((s) => !s)}>
            {showDone ? <LayoutGrid size={11} /> : <Rows3 size={11} />} {showDone ? 'hide nothing' : 'hide done'}
          </label>
          <button className="btn btn-ghost btn-icon" onClick={() => setView('stats')} title="Statistics"><ArrowUpDown size={14} /></button>
        </div>
      </div>

      {list.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" style={{ background: 'var(--accent-soft)' }}><Archive size={24} color="var(--accent)" /></div>
          <h3 style={{ margin: 0 }}>{q ? 'No habits match' : mode === 'archived' ? 'Nothing archived' : 'No habits yet'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {q ? 'Try a different search.' : 'Create one and start your first streak of consistency.'}
          </p>
          <button className="btn btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={14} /> New habit</button>
        </div>
      ) : (
        <div className="grid grid-habits stagger">
          {list.map((h) => <HabitCard key={h.id} habit={h} />)}
        </div>
      )}
    </div>
  );
}
