import React from 'react';
import { LayoutDashboard, ListChecks, GraduationCap, StickyNote, BookOpen, BarChart3, Settings, Flame, Trophy, Sprout } from 'lucide-react';
import { useStore, levelFor, XP_PER_LEVEL } from '../../lib/store';
import { getToday } from '../../lib/utils';
import { expectedOnDate } from '../../lib/utils';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: ListChecks },
  { id: 'homework', label: 'Homework', icon: GraduationCap },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, setView, habits, completions, tasks, homework, xp, vacationPeriods } = useStore();
  const today = getToday();
  const expected = expectedOnDate(habits, vacationPeriods, today);
  const doneToday = expected.filter((h) =>
    completions.some((c) => c.habit_id === h.id && c.date === today && (h.habit_type !== 'amount' || (c.amount || c.count || 0) >= (h.target_count || 1)))
  ).length;
  const pendingTasks = tasks.filter((t) => t.status !== 'done' && !t.parent_id).length;
  const pendingHW = homework.filter((h) => h.status !== 'completed').length;
  const level = levelFor(xp);
  const pct = xp % XP_PER_LEVEL;

  return (
    <aside className="app-sidebar">
      <div className="brand" onClick={() => setView('dashboard')} title="Habitt — dashboard">
        <div className="brand-mark"><Sprout size={20} /></div>
        <div className="brand-text">
          <div className="brand-name">Habitt<em>.</em></div>
          <div className="brand-sub">Build better days</div>
        </div>
      </div>

      <div className="nav-label">Menu</div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map((item) => {
          const active = currentView === item.id;
          const count = item.id === 'tasks' ? pendingTasks : item.id === 'homework' ? pendingHW : null;
          return (
            <button key={item.id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setView(item.id)} title={item.label}>
              <item.icon size={17} />
              <span className="hide-mobile" style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
              {count > 0 && <span className="nav-count">{count}</span>}
            </button>
          );
        })}
      </nav>

      <div className="nav-sep" />
      <div className="nav-label hide-mobile">Today</div>

      <div className="side-stat">
        <Flame size={18} color="#f97316" />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 800, fontSize: '0.86rem' }}>{doneToday}/{expected.length}</div>
          <div style={{ color: 'var(--text-faint)', fontSize: '0.7rem', fontWeight: 600 }}>habits done today</div>
        </div>
        {expected.length > 0 && (
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: `conic-gradient(#22c55e ${Math.round((doneToday / expected.length) * 360)}deg, var(--surface-3) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 800 }}>
              {Math.round((doneToday / expected.length) * 100)}
            </div>
          </div>
        )}
      </div>

      <div className="level-card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
          <Trophy size={16} color="#8b5cf6" />
          <span style={{ fontWeight: 800, fontSize: '0.84rem' }}>Level {level}</span>
          <span className="chip hide-mobile" style={{ marginLeft: 'auto' }}>{xp} XP</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)' }} />
        </div>
        <div className="hide-mobile" style={{ fontSize: '0.66rem', color: 'var(--text-faint)', marginTop: 5, fontWeight: 600 }}>
          {XP_PER_LEVEL - pct} XP to level {level + 1}
        </div>
      </div>

      <div style={{ marginTop: 'auto' }} className="hide-mobile">
        <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)', textAlign: 'center', padding: '8px 0 2px', fontWeight: 600 }}>
          <b>Ctrl+K</b> commands · <b>Ctrl+N</b> new habit
        </div>
      </div>
    </aside>
  );
}
