import React, { useEffect, useCallback } from 'react';
import { Reshaped } from 'reshaped';
import 'reshaped/themes/slate/theme.css';
import { Sprout } from 'lucide-react';
import { useStore } from './lib/store';
import { getHabits, getCompletions, getJournalEntries, getDayNotes, getFocusSessions, getVacationPeriods, getTasks, getNotes, getHomework, getSubjects, getSetting } from './lib/db';
import Titlebar from './components/Layout/Titlebar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Habits/Dashboard';
import HabitDetailPage from './components/Habits/HabitDetailPage';
import TaskBoard from './components/Tasks/TaskBoard';
import HomeworkBoard from './components/Homework/HomeworkBoard';
import NotesBoard from './components/Notes/NotesBoard';
import JournalPage from './components/Journal/JournalPage';
import StatsDashboard from './components/Stats/StatsDashboard';
import SettingsPage from './components/Settings/SettingsPage';
import Tutorial from './components/Tutorial/Tutorial';
import PasswordGate from './components/Shared/PasswordGate';
import CreateHabitModal from './components/Habits/CreateHabitModal';
import CommandPalette from './components/Shared/CommandPalette';
import ToastContainer from './components/Shared/ToastContainer';
import QuickCheckin from './components/Habits/QuickCheckin';
import FocusTimer from './components/Shared/FocusTimer';
import DayNoteModal from './components/Shared/DayNoteModal';

export default function App() {
  const s = useStore();
  const [loading, setLoading] = React.useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [h, c, j, n, f, v, t, no, hw, su] = await Promise.all([
        getHabits(), getCompletions(), getJournalEntries(), getDayNotes(),
        getFocusSessions(), getVacationPeriods(), getTasks(), getNotes(),
        getHomework(), getSubjects()
      ]);
      s.setHabits(h); s.setCompletions(c); s.setJournalEntries(j);
      s.setDayNotes(n||[]); s.setFocusSessions(f||[]); s.setVacationPeriods(v||[]);
      s.setTasks(t||[]); s.setNotes(no||[]); s.setHomework(hw||[]); s.setSubjects(su||[]);
    } catch (e) { console.error('Refresh error:', e); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const theme = await getSetting('theme');
        if (theme) s.setColorMode(theme);
        const pwd = await getSetting('password_hash');
        if (pwd) s.setPasswordEnabled(true); else s.setAuthenticated(true);
        const tut = await getSetting('tutorial_completed');
        if (tut) s.setTutorialDone(true);
        await refreshData();
      } catch (e) { console.error('Init:', e); s.setAuthenticated(true); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const h = (e) => {
      if ((e.metaKey||e.ctrlKey)&&e.key==='k') { e.preventDefault(); s.setShowCommandPalette(true); }
      if ((e.metaKey||e.ctrlKey)&&e.key==='n') { e.preventDefault(); useStore.setState({showCreateModal:true}); }
      if (e.key==='Escape') { s.setShowCommandPalette(false); useStore.setState({showCreateModal:false}); }
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  if (loading) return (
    <Reshaped theme="slate" colorMode={s.colorMode}><Titlebar />
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',flexDirection:'column',gap:'1rem',paddingTop:36}}>
        <Sprout size={48} color="var(--rs-color-foreground-primary-default)" />
        <div style={{fontSize:'1.25rem',fontWeight:700}}>Habitt</div>
      </div>
    </Reshaped>
  );

  if (!s.isAuthenticated) return <Reshaped theme="slate" colorMode={s.colorMode}><Titlebar /><PasswordGate /></Reshaped>;
  if (!s.tutorialDone && s.currentView !== 'settings') return <Reshaped theme="slate" colorMode={s.colorMode}><Titlebar /><Tutorial /></Reshaped>;

  const renderView = () => {
    switch (s.currentView) {
      case 'dashboard': return <Dashboard refreshData={refreshData} />;
      case 'habit': return <HabitDetailPage refreshData={refreshData} />;
      case 'tasks': return <TaskBoard refreshData={refreshData} />;
      case 'homework': return <HomeworkBoard refreshData={refreshData} />;
      case 'notes': return <NotesBoard refreshData={refreshData} />;
      case 'journal': return <JournalPage refreshData={refreshData} />;
      case 'stats': return <StatsDashboard />;
      case 'settings': return <SettingsPage refreshData={refreshData} />;
      default: return <Dashboard refreshData={refreshData} />;
    }
  };

  return (
    <Reshaped theme="slate" colorMode={s.colorMode}>
      <Titlebar />
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          {s.quickCheckinMode ? <QuickCheckin refreshData={refreshData} /> : (
            <div className="app-main-inner animate-fade-in" key={s.currentView}>{renderView()}</div>
          )}
        </main>
      </div>
      {s.showCreateModal && <CreateHabitModal refreshData={refreshData} />}
      {s.showCommandPalette && <CommandPalette />}
      {s.showFocusTimer && <FocusTimer refreshData={refreshData} />}
      {s.showDayNoteModal && <DayNoteModal refreshData={refreshData} />}
      <ToastContainer />
    </Reshaped>
  );
}
