import React from 'react';
import { Sun, Moon, Command, Timer, Plus } from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatDisplay, getToday } from '../../lib/utils';

export default function Topbar({ onToggleTheme, theme }) {
  const setUI = useStore((s) => s.setUI);
  const setView = useStore((s) => s.setView);
  const timer = useStore((s) => s.timer);
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">Habitt</div>
        <div className="topbar-date">{formatDisplay(getToday())}</div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        {timer?.running && (
          <button className="btn btn-sm btn-violet timer-pill" onClick={() => setView('focus')} title="Timer is running — open">
            <Timer size={13} />
            {timer.phase === 'work' ? 'Focus' : 'Break'}
            <TimerMini />
          </button>
        )}
        <button className="btn btn-sm" onClick={() => setUI({ showCommandPalette: true })} title="Command palette (Ctrl+K)">
          <Command size={14} />
          <span className="hide-mobile-sm">Ctrl+K</span>
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })} title="New habit (Ctrl+N)">
          <Plus size={14} />
          <span className="hide-mobile-sm">New Habit</span>
        </button>
        <button className="btn btn-icon" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}

function TimerMini() {
  const timer = useStore((s) => s.timer);
  const [, force] = React.useState(0);
  React.useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);
  if (!timer) return null;
  const ms = timer.running ? Math.max(0, timer.endsAt - Date.now()) : (timer.remainingMs || 0);
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 800 }}>{m}:{String(s).padStart(2, '0')}</span>;
}
