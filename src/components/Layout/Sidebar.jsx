import React from 'react';
import { useStore } from '../../lib/store';
import { View, Text, Icon, Badge, Divider } from 'reshaped';
import {
  LayoutDashboard, BookOpen, BarChart3, Settings, HelpCircle,
  Flame, Target, Trophy, Zap, ChevronRight, Sprout
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'journal', label: 'Journal', icon: BookOpen },
  { id: 'stats', label: 'Statistics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export default function Sidebar() {
  const { currentView, setView, habits, completions, xp, level } = useStore();
  const activeHabits = habits.filter(h => !h.archived);
  const today = new Date().toISOString().split('T')[0];
  const todayDone = completions.filter(c => c.date === today).length;

  return (
    <aside className="app-sidebar">
      <View padding={5} gap={4} height="100%" direction="column">
        {/* Logo */}
        <View direction="row" align="center" gap={2} paddingBottom={3}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: '0 4px 12px rgba(34,197,94,0.3)'
          }}>
            <Sprout size={18} />
          </div>
          <View>
            <Text variant="title-3" weight="bold">Habitt</Text>
            <Text variant="caption-1" color="neutral-faded">Build better habits</Text>
          </View>
        </View>

        <Divider />

        {/* Navigation */}
        <View gap={1}>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '12px',
                  background: isActive ? 'var(--rs-color-background-primary-faded)' : 'transparent',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  color: isActive ? 'var(--rs-color-foreground-primary-default)' : 'var(--rs-color-foreground-neutral-default)',
                  fontWeight: isActive ? 600 : 500, fontSize: '0.875rem',
                }}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--rs-color-background-neutral-faded)'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon svg={<item.icon size={18} />} />
                <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>
                {isActive && <ChevronRight size={14} />}
              </button>
            );
          })}
        </View>

        <Divider />

        {/* Quick Stats */}
        <View gap={2}>
          <Text variant="caption-1" weight="bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Today
          </Text>

          <View direction="row" align="center" gap={2} padding={2} style={{
            background: 'var(--rs-color-background-neutral-faded)', borderRadius: '12px'
          }}>
            <Flame size={18} color="#f97316" />
            <Text variant="body-2" style={{ flex: 1 }}>{todayDone} / {activeHabits.length} done</Text>
          </View>

          <View direction="row" align="center" gap={2} padding={2} style={{
            background: 'var(--rs-color-background-neutral-faded)', borderRadius: '12px'
          }}>
            <Target size={18} color="#3b82f6" />
            <Text variant="body-2" style={{ flex: 1 }}>{activeHabits.length} active habits</Text>
          </View>

          {/* XP & Level */}
          <View direction="row" align="center" gap={2} padding={2} style={{
            background: 'linear-gradient(135deg, rgba(139,92,246,0.08), rgba(59,130,246,0.04))',
            borderRadius: '12px', border: '1px solid rgba(139,92,246,0.15)'
          }}>
            <Trophy size={18} color="#8b5cf6" />
            <View style={{ flex: 1 }}>
              <Text variant="caption-1" weight="bold">Level {level}</Text>
              <div style={{
                height: 4, borderRadius: 99, background: 'var(--rs-color-background-neutral-faded)',
                marginTop: 4, overflow: 'hidden'
              }}>
                <div style={{
                  height: '100%', borderRadius: 99,
                  background: 'linear-gradient(90deg, #8b5cf6, #3b82f6)',
                  width: `${(xp % 100)}%`, transition: 'width 0.5s ease'
                }} />
              </div>
            </View>
            <Badge rounded color="primary" variant="faded" size="small">{xp} XP</Badge>
          </View>
        </View>

        {/* Bottom */}
        <div style={{ marginTop: 'auto' }}>
          <Divider />
          <View paddingTop={2}>
            <button
              onClick={() => setView('tutorial')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                width: '100%', padding: '0.5rem 0.75rem', borderRadius: '12px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--rs-color-foreground-neutral-faded)', fontSize: '0.8125rem',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'var(--rs-color-background-neutral-faded)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <HelpCircle size={16} />
              <span>Help and Tutorial</span>
            </button>
            <View direction="row" align="center" gap={1} padding={2} style={{ justifyContent: 'center' }}>
              <Zap size={12} color="var(--rs-color-foreground-neutral-faded)" />
              <Text variant="caption-2" color="neutral-faded">Ctrl+K for commands</Text>
            </View>
          </View>
        </div>
      </View>
    </aside>
  );
}
