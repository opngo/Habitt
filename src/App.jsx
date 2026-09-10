import React, { useEffect, useCallback } from 'react';
import { Reshaped, Theme } from 'reshaped';
import 'reshaped/themes/slate/theme.css';
import { Sprout } from 'lucide-react';
import { useStore } from './lib/store';
import { getHabits, getCompletions, getJournalEntries, getAllSettings, getSetting } from './lib/db';
import Titlebar from './components/Layout/Titlebar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './components/Habits/Dashboard';
import HabitDetailPage from './components/Habits/HabitDetailPage';
import JournalPage from './components/Journal/JournalPage';
import StatsDashboard from './components/Stats/StatsDashboard';
import SettingsPage from './components/Settings/SettingsPage';
import Tutorial from './components/Tutorial/Tutorial';
import PasswordGate from './components/Shared/PasswordGate';
import CreateHabitModal from './components/Habits/CreateHabitModal';
import CommandPalette from './components/Shared/CommandPalette';
import ToastContainer from './components/Shared/ToastContainer';
import QuickCheckin from './components/Habits/QuickCheckin';

export default function App() {
  const {
    currentView, colorMode, setColorMode, isAuthenticated, passwordEnabled,
    setPasswordEnabled, setAuthenticated, tutorialDone, setTutorialDone,
    setHabits, setCompletions, setJournalEntries, showCreateModal,
    showCommandPalette, setShowCommandPalette, quickCheckinMode,
    setQuickCheckinMode, toasts
  } = useStore();

  const [loading, setLoading] = React.useState(true);

  const refreshData = useCallback(async () => {
    try {
      const [h, c, j] = await Promise.all([getHabits(), getCompletions(), getJournalEntries()]);
      setHabits(h); setCompletions(c); setJournalEntries(j);
    } catch (e) { console.error('Refresh error:', e); }
  }, [setHabits, setCompletions, setJournalEntries]);

  useEffect(() => {
    (async () => {
      try {
        const theme = await getSetting('theme');
        if (theme) { setColorMode(theme); }
        const pwd = await getSetting('password_hash');
        if (pwd) { setPasswordEnabled(true); } else { setAuthenticated(true); }
        const tut = await getSetting('tutorial_completed');
        if (tut) setTutorialDone(true);
        await refreshData();
      } catch (e) { console.error('Init error:', e); setAuthenticated(true); }
      finally { setLoading(false); }
    })();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        useStore.setState({ showCreateModal: true });
      }
      if (e.key === 'Escape') {
        setShowCommandPalette(false);
        useStore.setState({ showCreateModal: false, showTemplateLibrary: false });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  if (loading) {
    return (
    <Reshaped theme="slate" colorMode={colorMode}>
      <Titlebar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', flexDirection:'column', gap:'1rem', paddingTop: 36 }}>
          <Sprout size={48} color="var(--rs-color-foreground-primary-default)" />
          <div style={{ fontSize:'1.25rem', fontWeight:700, color:'var(--rs-color-foreground-neutral-default)' }}>Habitt.</div>
          <div style={{ color:'var(--rs-color-foreground-neutral-faded)', fontSize:'0.875rem' }}>Loading your habits...</div>
        </div>
      </Reshaped>
    );
  }

  if (!isAuthenticated) {
    return (
      <Reshaped theme="slate" colorMode={colorMode}>
        <PasswordGate />
      </Reshaped>
    );
  }

  if (!tutorialDone && currentView !== 'settings') {
    return (
      <Reshaped theme="slate" colorMode={colorMode}>
        <Tutorial />
      </Reshaped>
    );
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard refreshData={refreshData} />;
      case 'habit': return <HabitDetailPage refreshData={refreshData} />;
      case 'journal': return <JournalPage refreshData={refreshData} />;
      case 'stats': return <StatsDashboard />;
      case 'settings': return <SettingsPage refreshData={refreshData} />;
      default: return <Dashboard refreshData={refreshData} />;
    }
  };

  return (
    <Reshaped theme="slate" colorMode={colorMode}>
      <div className="app-shell">
        <Sidebar />
        <main className="app-main">
          {quickCheckinMode ? (
            <QuickCheckin refreshData={refreshData} />
          ) : (
            <div className="app-main-inner animate-fade-in" key={currentView}>
              {renderView()}
            </div>
          )}
        </main>
      </div>
      {showCreateModal && <CreateHabitModal refreshData={refreshData} />}
      {showCommandPalette && <CommandPalette />}
      <ToastContainer />
    </Reshaped>
  );
}
