import React, { useEffect, useState } from 'react';
import { useStore } from './lib/store';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Dashboard from './components/Habits/Dashboard';
import HabitsView from './components/Habits/HabitsView';
import HabitDetailPage from './components/Habits/HabitDetailPage';
import CreateHabitModal from './components/Habits/CreateHabitModal';
import QuickCheckin from './components/Habits/QuickCheckin';
import TemplatesModal from './components/Habits/TemplatesModal';
import TasksView from './components/Tasks/TasksView';
import HomeworkBoard from './components/Homework/HomeworkBoard';
import NotesView from './components/Notes/NotesView';
import JournalPage from './components/Journal/JournalPage';
import StatsDashboard from './components/Stats/StatsDashboard';
import SettingsPage from './components/Settings/SettingsPage';
import CommandPalette from './components/Shared/CommandPalette';
import ToastContainer from './components/Shared/ToastContainer';
import FocusView from './components/Shared/FocusView';

export default function App() {
  const currentView = useStore((s) => s.currentView);
  const quickCheckinMode = useStore((s) => s.quickCheckinMode);
  const showCreateModal = useStore((s) => s.showCreateModal);
  const showCommandPalette = useStore((s) => s.showCommandPalette);
  const showTemplates = useStore((s) => s.showTemplates);
  const setUI = useStore((s) => s.setUI);
  const setView = useStore((s) => s.setView);
  const timer = useStore((s) => s.timer);
  const tickTimer = useStore((s) => s.tickTimer);

  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  useEffect(() => {
    const h = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setUI({ showCommandPalette: !useStore.getState().showCommandPalette }); return; }
      if (mod && e.key.toLowerCase() === 'n' && !typing) { e.preventDefault(); setUI({ showCreateModal: true, editingHabit: null }); return; }
      if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); setView('journal'); return; }
      if (mod && e.key.toLowerCase() === 'f') { e.preventDefault(); setView('focus'); return; }
      if (mod && e.key.toLowerCase() === 'q') { e.preventDefault(); setUI({ quickCheckinMode: !useStore.getState().quickCheckinMode }); return; }
      if (mod && e.key.toLowerCase() === 'b') { e.preventDefault(); useStore.getState().toggleSidebar(); return; }
      if (e.key === 'Escape' && !typing) {
        const s = useStore.getState();
        if (s.showCommandPalette) setUI({ showCommandPalette: false });
        else if (s.showTemplates) setUI({ showTemplates: false });
        else if (s.showCreateModal) setUI({ showCreateModal: false, editingHabit: null });
        else if (s.quickCheckinMode) setUI({ quickCheckinMode: false });
        else if (useStore.getState().currentView === 'focus') s.setView('dashboard');
        else if (s.currentView !== 'dashboard') s.setView('dashboard');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [setUI, setView]);

  // timer heartbeat — keeps running on every screen
  useEffect(() => {
    if (!timer?.running) return undefined;
    const id = setInterval(() => tickTimer(), 250);
    return () => clearInterval(id);
  }, [timer?.running, timer?.endsAt, tickTimer]);

  const toggleTheme = () => {
    useStore.getState().toggleTheme();
    setTheme(document.documentElement.dataset.theme);
  };

  const view = () => {
    switch (currentView) {
      case 'habits': return <HabitsView />;
      case 'habit': return <HabitDetailPage />;
      case 'focus': return <FocusView />;
      case 'tasks': return <TasksView />;
      case 'homework': return <HomeworkBoard />;
      case 'notes': return <NotesView />;
      case 'journal': return <JournalPage />;
      case 'stats': return <StatsDashboard />;
      case 'settings': return <SettingsPage onToggleTheme={toggleTheme} theme={theme} />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="app-shell">
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Topbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="app-main" style={currentView === 'focus' ? { padding: 0 } : undefined}>
          {quickCheckinMode ? (
            <div className="animate-fade-in"><QuickCheckin /></div>
          ) : (
            <div className={`app-main-inner ${currentView === 'focus' ? 'flush' : 'animate-fade-in'}`} key={currentView + (useStore.getState().selectedHabitId || '')}>
              {view()}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && <CreateHabitModal />}
      {showTemplates && <TemplatesModal />}
      {showCommandPalette && <CommandPalette />}
      <ToastContainer />
    </div>
  );
}
