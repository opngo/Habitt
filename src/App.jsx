import React, { useEffect, useState, useSyncExternalStore } from 'react';

import { useStore } from './lib/store';
import Sidebar from './components/Layout/Sidebar';
import Topbar from './components/Layout/Topbar';
import Dashboard from './components/Habits/Dashboard';
import HabitDetailPage from './components/Habits/HabitDetailPage';
import CreateHabitModal from './components/Habits/CreateHabitModal';
import QuickCheckin from './components/Habits/QuickCheckin';
import TemplatesModal from './components/Habits/TemplatesModal';
import TaskBoard from './components/Tasks/TaskBoard';
import HomeworkBoard from './components/Homework/HomeworkBoard';
import NotesBoard from './components/Notes/NotesBoard';
import JournalPage from './components/Journal/JournalPage';
import StatsDashboard from './components/Stats/StatsDashboard';
import SettingsPage from './components/Settings/SettingsPage';
import CommandPalette from './components/Shared/CommandPalette';
import ToastContainer from './components/Shared/ToastContainer';
import FocusTimer from './components/Shared/FocusTimer';
import DayNoteModal from './components/Shared/DayNoteModal';

export default function App() {
  const currentView = useStore((s) => s.currentView);
  const quickCheckinMode = useStore((s) => s.quickCheckinMode);
  const showCreateModal = useStore((s) => s.showCreateModal);
  const showCommandPalette = useStore((s) => s.showCommandPalette);
  const showFocusTimer = useStore((s) => s.showFocusTimer);
  const showDayNoteModal = useStore((s) => s.showDayNoteModal);
  const showTemplates = useStore((s) => s.showTemplates);
  const setUI = useStore((s) => s.setUI);
  const timer = useStore((s) => s.timer);
  const tickTimer = useStore((s) => s.tickTimer);

  const [theme, setTheme] = useState(() => document.documentElement.dataset.theme || 'light');

  // global keyboard shortcuts
  useEffect(() => {
    const h = (e) => {
      const mod = e.metaKey || e.ctrlKey;
      const tag = (e.target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || tag === 'select' || e.target?.isContentEditable;
      if (mod && e.key.toLowerCase() === 'k') { e.preventDefault(); setUI({ showCommandPalette: !useStore.getState().showCommandPalette }); return; }
      if (mod && e.key.toLowerCase() === 'n' && !typing) { e.preventDefault(); setUI({ showCreateModal: true, editingHabit: null }); return; }
      if (mod && e.key.toLowerCase() === 'j') { e.preventDefault(); useStore.getState().setView('journal'); return; }
      if (mod && e.key.toLowerCase() === 'f') { e.preventDefault(); setUI({ showFocusTimer: true }); return; }
      if (mod && e.key.toLowerCase() === 'q') { e.preventDefault(); setUI({ quickCheckinMode: !useStore.getState().quickCheckinMode }); return; }
      if (e.key === 'Escape' && !typing) {
        const s = useStore.getState();
        if (s.showCommandPalette) setUI({ showCommandPalette: false });
        else if (s.showTemplates) setUI({ showTemplates: false });
        else if (s.quickCheckinMode) setUI({ quickCheckinMode: false });
        else if (s.currentView !== 'dashboard') s.setView('dashboard');
      }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [setUI]);

  // timer heartbeat
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
      case 'habit': return <HabitDetailPage />;
      case 'tasks': return <TaskBoard />;
      case 'homework': return <HomeworkBoard />;
      case 'notes': return <NotesBoard />;
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
        <main className="app-main">
          {quickCheckinMode ? (
            <div className="animate-fade-in"><QuickCheckin /></div>
          ) : (
            <div className="app-main-inner animate-fade-in" key={currentView + (useStore.getState().selectedHabitId || '')}>
              {view()}
            </div>
          )}
        </main>
      </div>

      {showCreateModal && <CreateHabitModal />}
      {showTemplates && <TemplatesModal />}
      {showCommandPalette && <CommandPalette />}
      {showDayNoteModal && <DayNoteModal />}
      {showFocusTimer && <FocusTimer />}
      <ToastContainer />
    </div>
  );
}
