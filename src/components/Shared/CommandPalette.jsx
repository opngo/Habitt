import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, CheckSquare, ListChecks, GraduationCap, StickyNote, BookOpen, BarChart3,
  Settings, Plus, Zap, Search, Timer, Sun, Moon, ArrowRight,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday } from '../../lib/utils';
import DynIcon from './DynIcon';

const VIEWS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, keywords: 'home today overview' },
  { id: 'habits', label: 'Habits', icon: CheckSquare, keywords: 'all habits list manage' },
  { id: 'tasks', label: 'Reminders', icon: ListChecks, keywords: 'todo tasks reminders' },
  { id: 'homework', label: 'Homework', icon: GraduationCap, keywords: 'assignments school' },
  { id: 'notes', label: 'Notes', icon: StickyNote, keywords: 'notes write' },
  { id: 'journal', label: 'Journal', icon: BookOpen, keywords: 'diary reflection' },
  { id: 'focus', label: 'Focus timer', icon: Timer, keywords: 'pomodoro timer work session' },
  { id: 'stats', label: 'Statistics', icon: BarChart3, keywords: 'analytics charts consistency' },
  { id: 'settings', label: 'Settings', icon: Settings, keywords: 'preferences data backup theme' },
];

export default function CommandPalette() {
  const { setUI, setView, toggleTheme } = useStore();
  const [q, setQ] = useState('');
  const [idx, setIdx] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const habits = useStore((s) => s.habits);

  const items = useMemo(() => {
    const ql = q.trim().toLowerCase();
    const base = [];
    VIEWS.forEach((v) => base.push({ id: `view-${v.id}`, label: v.label, hint: 'Go to', icon: v.icon, run: () => setView(v.id), kw: v.keywords }));
    base.push({ id: 'new-habit', label: 'Create new habit', hint: 'Do', icon: Plus, run: () => setUI({ showCreateModal: true, editingHabit: null }), kw: 'add habit create' });
    base.push({ id: 'quick', label: 'Quick check-in', hint: 'Do', icon: Zap, run: () => setUI({ quickCheckinMode: true }), kw: 'checkin fast log' });
    base.push({ id: 'focus-start', label: 'Start focus timer', hint: 'Do', icon: Timer, run: () => { setView('focus'); useStore.getState().startTimer(); }, kw: 'pomodoro work deep' });
    base.push({ id: 'note-today', label: 'Add a day note', hint: 'Do', icon: StickyNote, run: () => setUI({ currentView: 'dashboard', selectedDay: getToday() }), kw: 'note today journal day' });
    base.push({ id: 'theme', label: `Switch to ${document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark'} theme`, hint: 'Toggle', icon: document.documentElement.dataset.theme === 'dark' ? Sun : Moon, run: () => { toggleTheme(); }, kw: 'theme dark light appearance' });
    habits.filter((h) => !h.archived).slice(0, 12).forEach((h) => base.push({
      id: `log-${h.id}`, label: `Log "${h.name}" for today`, hint: 'Habit', icon: 'dot', color: h.color, hicon: h.icon,
      run: () => { const s = useStore.getState(); s.toggleCompletion(h.id, getToday()); }, kw: `log ${h.name} ${h.category}`,
    }));
    habits.filter((h) => !h.archived).slice(0, 12).forEach((h) => base.push({
      id: `open-${h.id}`, label: `Open ${h.name}`, hint: 'Habit', icon: ArrowRight, run: () => setView('habit', h.id), kw: `open ${h.name}`,
    }));
    const filtered = ql ? base.filter((b) => `${b.label} ${b.kw || ''}`.toLowerCase().includes(ql)) : base;
    return filtered.slice(0, 14);
  }, [q, habits, setUI, setView, toggleTheme]);

  useEffect(() => { setIdx(0); }, [q]);

  const runAt = (i) => { const it = items[i]; if (!it) return; it.run(); setUI({ showCommandPalette: false }); };

  return (
    <div className="palette-overlay" onMouseDown={(e) => { if (e.target === e.currentTarget) setUI({ showCommandPalette: false }); }}>
      <div className="palette card animate-pop-in" role="dialog" aria-label="Command palette">
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
          <Search size={16} color="var(--text-faint)" />
          <input
            ref={inputRef}
            className="palette-input"
            placeholder="Jump to a view, log a habit…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') { e.preventDefault(); setIdx((i) => Math.min(items.length - 1, i + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setIdx((i) => Math.max(0, i - 1)); }
              if (e.key === 'Enter') { e.preventDefault(); runAt(idx); }
              if (e.key === 'Escape') setUI({ showCommandPalette: false });
            }}
          />
          <kbd>esc</kbd>
        </div>
        <div ref={listRef} className="palette-list">
          {items.length === 0 && <div className="palette-empty">Nothing matches “{q}”.</div>}
          {items.map((it, i) => (
            <button
              key={it.id}
              className={`palette-row ${i === idx ? 'on' : ''}`}
              onMouseEnter={() => setIdx(i)}
              onClick={() => runAt(i)}
            >
              {it.icon === 'dot'
                ? <span className="pdot" style={{ background: it.color }} />
                : it.hicon ? <DynIcon name={it.hicon} size={14} /> : React.createElement(it.icon, { size: 14 })}
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{it.label}</span>
              <span className="palette-hint">{it.hint}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
