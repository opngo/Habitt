import React from 'react';
import { Sun, Moon, Command, Timer, Plus, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatDisplay, getToday } from '../../lib/utils';

export default function Topbar({ onToggleTheme, theme }) {
  const setUI = useStore((s) => s.setUI);
  const focusRunning = useStore((s) => s.timer && s.timer.running);
  return (
    <header className="topbar">
      <div>
        <div className="topbar-title">
          <Sparkles size={16} color="var(--accent)" />
          Habitt.
        </div>
        <div className="topbar-date">{formatDisplay(getToday())}</div>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        <button className="btn btn-sm" onClick={() => setUI({ showCommandPalette: true })} title="Command palette (Ctrl+K)">
          <Command size={14} /> <span className="hide-mobile-sm">⌘K</span>
        </button>
        <button className={`btn btn-sm ${focusRunning ? 'btn-violet' : ''}`} onClick={() => setUI({ showFocusTimer: true })} title="Focus timer">
          <Timer size={14} /> <span className="hide-mobile-sm">Focus</span>
        </button>
        <button className="btn btn-sm btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })} title="New habit (Ctrl+N)">
          <Plus size={14} /> <span className="hide-mobile-sm">New Habit</span>
        </button>
        <button className="btn btn-icon" onClick={onToggleTheme} title="Toggle theme">
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  );
}
