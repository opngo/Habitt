import React from 'react';
import {
  LayoutDashboard, ListChecks, GraduationCap, StickyNote, BookOpen, BarChart3, Settings,
  Flame, Sprout, PanelLeftClose, PanelLeftOpen, Timer, CheckSquare,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, expectedOnDate, amountOf } from '../../lib/utils';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'habits', label: 'Habits', icon: CheckSquare },
  { id: 'tasks', label: 'Reminders', icon: ListChecks },
  { id: 'homework', label: 'Homework', icon: GraduationCap },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'focus', label: 'Focus Timer', icon: Timer },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, setView, habits, completions, tasks, homework, settings, toggleSidebar, timer } = useStore();
  const collapsed = !!settings.sidebarCollapsed;
  const today = getToday();
  const expected = expectedOnDate(habits, useStore.getState().vacationPeriods, today);
  const doneToday = expected.filter((h) =>
    completions.some((c) => c.habit_id === h.id && c.date === today && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1)))
  ).length;
  const pct = expected.length ? Math.round((doneToday / expected.length) * 100) : 0;
  const pendingTasks = tasks.filter((t) => t.status !== 'done' && !t.parent_id).length;
  const pendingHW = homework.filter((h) => h.status !== 'completed').length;

  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="brand" onClick={() => setView('dashboard')} title="Habitt — dashboard">
        <div className="brand-mark"><Sprout size={20} /></div>
        {!collapsed && (
          <div className="brand-text">
            <div className="brand-name">Habitt<em>.</em></div>
            <div className="brand-sub">Build better days</div>
          </div>
        )}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {NAV.map((item) => {
          const active = currentView === item.id || (item.id === 'habits' && currentView === 'habit');
          const count = item.id === 'tasks' ? pendingTasks : item.id === 'homework' ? pendingHW : null;
          return (
            <button key={item.id} className={`nav-item ${active ? 'active' : ''}`} onClick={() => setView(item.id)} title={collapsed ? item.label : undefined}>
              <span style={{ position: 'relative' }}>
                <item.icon size={17} />
                {item.id === 'focus' && timer?.running && <span className="run-dot" title="Timer running" />}
              </span>
              {!collapsed && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
              {count > 0 && (!collapsed ? <span className="nav-count">{count}</span> : <span className="nav-count mini">{count}</span>)}
            </button>
          );
        })}
      </nav>

      {!collapsed && (
        <>
          <div className="nav-sep" />
          <div className="side-stat">
            <Flame size={17} color="#f97316" />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '0.84rem' }}>{doneToday}/{expected.length}</div>
              <div style={{ color: 'var(--text-faint)', fontSize: '0.68rem', fontWeight: 600 }}>habits today</div>
            </div>
            {expected.length > 0 && (
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: `conic-gradient(#22c55e ${pct * 3.6}deg, var(--surface-3) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.53rem', fontWeight: 800 }}>
                  {pct}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <button className="btn btn-ghost" style={{ justifyContent: collapsed ? 'center' : 'flex-start' }} onClick={toggleSidebar} title={collapsed ? 'Expand sidebar (Ctrl+B)' : 'Collapse sidebar (Ctrl+B)'}>
          {collapsed ? <PanelLeftOpen size={16} /> : <><PanelLeftClose size={16} /> Collapse</>}
        </button>
      </div>
    </aside>
  );
}
