import React, { useState, useMemo, useRef, useEffect } from 'react';
import { View, Text, Icon } from 'reshaped';
import {
  Plus, LayoutDashboard, BookOpen, BarChart3, Settings, Search,
  Flame, Moon, Sun, Zap, Trash2, Archive
} from 'lucide-react';
import { useStore } from '../../lib/store';

export default function CommandPalette() {
  const { setShowCommandPalette, setView, setShowCreateModal, habits,
    colorMode, setColorMode, setQuickCheckinMode } = useStore();
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const commands = useMemo(() => [
    { id: 'dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, action: () => setView('dashboard') },
    { id: 'journal', label: 'Go to Journal', icon: BookOpen, action: () => setView('journal') },
    { id: 'stats', label: 'Go to Statistics', icon: BarChart3, action: () => setView('stats') },
    { id: 'settings', label: 'Go to Settings', icon: Settings, action: () => setView('settings') },
    { id: 'new-habit', label: 'Create New Habit', icon: Plus, action: () => { setShowCreateModal(true); } },
    { id: 'quick-checkin', label: 'Quick Check-in Mode', icon: Zap, action: () => setQuickCheckinMode(true) },
    { id: 'toggle-theme', label: `Switch to ${colorMode === 'light' ? 'Dark' : 'Light'} Mode`, icon: colorMode === 'light' ? Moon : Sun,
      action: () => setColorMode(colorMode === 'light' ? 'dark' : 'light') },
    ...habits.filter(h => !h.archived).map(h => ({
      id: `habit-${h.id}`, label: `Open: ${h.icon} ${h.name}`,
      icon: Flame, action: () => setView('habit', h.id),
    })),
  ], [habits, colorMode]);

  const filtered = useMemo(() =>
    commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase())),
    [commands, query]
  );

  function execute(cmd) {
    cmd.action();
    setShowCommandPalette(false);
  }

  function handleKeyDown(e) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === 'Enter' && filtered[activeIdx]) execute(filtered[activeIdx]);
    if (e.key === 'Escape') setShowCommandPalette(false);
  }

  return (
    <div className="command-palette-overlay" onClick={(e) => e.target === e.currentTarget && setShowCommandPalette(false)}>
      <div className="command-palette animate-scale-in">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 1.25rem', borderBottom: '1px solid var(--rs-color-border-neutral-faded)' }}>
          <Search size={16} color="var(--rs-color-foreground-neutral-faded)" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setActiveIdx(0); }}
            onKeyDown={handleKeyDown}
            placeholder="Type a command or search..."
          />
        </div>
        <div style={{ maxHeight: 320, overflow: 'auto', padding: '4px 0' }}>
          {filtered.length === 0 && (
            <View padding={4} align="center">
              <Text variant="body-3" color="neutral-faded">No results found</Text>
            </View>
          )}
          {filtered.map((cmd, i) => (
            <div
              key={cmd.id}
              className={`command-item ${i === activeIdx ? 'active' : ''}`}
              onClick={() => execute(cmd)}
              onMouseEnter={() => setActiveIdx(i)}
            >
              <cmd.icon size={16} />
              <Text variant="body-3">{cmd.label}</Text>
            </div>
          ))}
        </div>
        <View padding={2} style={{
          borderTop: '1px solid var(--rs-color-border-neutral-faded)',
          justifyContent: 'center',
        }}>
          <Text variant="caption-2" color="neutral-faded">
            ↑↓ Navigate • Enter to select • Esc to close
          </Text>
        </View>
      </div>
    </div>
  );
}
