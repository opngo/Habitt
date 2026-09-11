import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  LayoutDashboard, ListChecks, GraduationCap, StickyNote, BookOpen, BarChart3, Settings,
  Plus, Zap, Timer, Sun, Moon, Search, CornerDownLeft, Download, Sparkles,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday } from '../../lib/utils';
import DynIcon from './DynIcon';

const NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, keywords: 'home habits today' },
  { id: 'tasks', label: 'Tasks', icon: ListChecks, keywords: 'todo kanban' },
  { id: 'homework', label: 'Homework', icon: GraduationCap, keywords: 'school assignments subjects' },
  { id: 'notes', label: 'Notes', icon: StickyNote, keywords: 'memos writing' },
  { id: 'journal', label: 'Journal', icon: BookOpen, keywords: 'mood diary' },
  { id: 'stats', label: 'Statistics', icon: BarChart3, keywords: 'analytics achievements xp' },
  { id: 'settings', label: 'Settings', icon: Settings, keywords: 'theme export import data' },
];

export default function CommandPalette() {
  const { setView, setUI, habits, toggleTheme } = useStore();
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);
  const listRef = useRef(null);

  const theme = document.documentElement.dataset.theme;

  const actions = useMemo(() => {
    const base = [
      ...NAV.map((n) => ({ ...n, kind: 'Go', run: () => setView(n.id) })),
      { id: 'new', label: 'Create new habit', icon: Plus, kind: 'Do', keywords: 'add habit create', color: 'var(--accent)', run: () => setUI({ showCreateModal: true, editingHabit: null }) },
      { id: 'tpl', label: 'Browse habit templates', icon: Sparkles, kind: 'Do', keywords: 'templates presets', run: () => setUI({ showTemplates: true }) },
      { id: 'qc', label: 'Quick check-in mode', icon: Zap, kind: 'Do', keywords: 'rapid check', color: 'var(--amber)', run: () => setUI({ quickCheckinMode: true }) },
      { id: 'note', label: 'Add a day note', icon: StickyNote, kind: 'Do', keywords: 'note today journal short', run: () => setUI({ showDayNoteModal: true, dayNoteDate: getToday() }) },
      { id: 'focus', label: 'Start focus timer', icon: Timer, kind: 'Do', keywords: 'pomodoro work', run: () => setUI({ showFocusTimer: true }) },
      { id: 'theme', label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`, icon: theme === 'dark' ? Sun : Moon, kind: 'Do', keywords: 'theme dark light appearance', run: () => toggleTheme() },
      { id: 'export', label: 'Export data as JSON backup', icon: Download, kind: 'Do', keywords: 'backup save', run: () => { setView('settings'); } },
    ];
    const habitActions = habits
      .filter((h) => !h.archived)
      .map((h) => ({
        id: `h-${h.id}`, label: `Toggle “${h.name}” today`, icon: h.icon, kind: 'Habit',
        keywords: `${h.name} ${h.category}`, color: h.color,
        run: () => useStore.getState().toggleCompletion(h.id, getToday()),
      }));
    const all = [...base, ...habitActions];
    if (!q.trim()) return all;
    const ql = q.toLowerCase();
    return all.filter((a) => `${a.label} ${a.keywords || ''} ${a.kind}`.toLowerCase().includes(ql));
  }, [q, habits, theme]); // eslint-disable-line

  useEffect(() => setSel(0), [q]);
  useEffect(() => {
    const el = listRef.current?.querySelector('[data-sel="1"]');
    el?.scrollIntoView({ block: 'nearest' });
  }, [sel]);

  const run = (a) => { a.run(); setUI({ showCommandPalette: false }); };

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setUI({ showCommandPalette: false }); }}>
      <div className="modal palette">
        <div className="palette-input-row">
          <Search size={17} color="var(--text-faint)" />
          <input
            className="palette-input" autoFocus placeholder="Type a command, habit, or page…"
            value={q} onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') { e.stopPropagation(); setUI({ showCommandPalette: false }); }
              if (e.key === 'ArrowDown') { e.preventDefault(); setSel((s) => Math.min(actions.length - 1, s + 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setSel((s) => Math.max(0, s - 1)); }
              if (e.key === 'Enter' && actions[sel]) { e.preventDefault(); run(actions[sel]); }
            }}
          />
          <span className="chip">↑↓ ↵</span>
        </div>
        <div className="palette-list" ref={listRef}>
          {actions.length === 0 && <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-faint)', fontSize: '0.85rem' }}>Nothing matches “{q}”</div>}
          {actions.map((a, i) => (
            <button key={a.id + i} data-sel={i === sel ? '1' : undefined} className={`palette-item ${i === sel ? 'sel' : ''}`} onMouseEnter={() => setSel(i)} onClick={() => run(a)}>
              {a.icon && (a.kind === 'Habit' ? <DynIcon name={a.icon} size={15} color={a.color} /> : React.createElement(a.icon, { size: 15, color: a.color }))}
              <span style={{ flex: 1 }}>{a.label}</span>
              <span className="hint">{a.kind === 'Go' ? 'Open' : a.kind}</span>
              {i === sel && <CornerDownLeft size={12} color="var(--text-faint)" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
