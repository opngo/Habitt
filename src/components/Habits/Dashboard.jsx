import React, { useMemo } from 'react';
import { View, Text, Button, Icon, Badge, Divider } from 'reshaped';
import { Plus, Zap, Search, LayoutGrid, List, Filter } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, getLast365Days, toStr } from '../../lib/utils';
import { DAILY_QUOTES } from '../../lib/constants';
import YearHeatmap from '../Heatmap/YearHeatmap';
import HabitCard from './HabitCard';

export default function Dashboard({ refreshData }) {
  const {
    habits, completions, showCreateModal, setShowCreateModal,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    setView, setQuickCheckinMode, addToast, addXp
  } = useStore();

  const activeHabits = habits.filter(h => !h.archived);
  const today = getToday();
  const categories = ['All', ...new Set(activeHabits.map(h => h.category))];

  const todayCompletions = useMemo(() => {
    return new Set(completions.filter(c => c.date === today).map(c => c.habit_id));
  }, [completions, today]);

  const filtered = useMemo(() => {
    return activeHabits.filter(h => {
      const matchSearch = !searchQuery || h.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCat = selectedCategory === 'All' || h.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [activeHabits, searchQuery, selectedCategory]);

  const quote = DAILY_QUOTES[new Date().getDate() % DAILY_QUOTES.length];
  const completionPct = activeHabits.length > 0
    ? Math.round((todayCompletions.size / activeHabits.length) * 100) : 0;

  return (
    <div>
      {/* Header */}
      <View direction="row" align="center" gap={4} paddingBottom={6} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View>
          <Text variant="title-1" weight="bold">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'} 👋
          </Text>
          <Text variant="body-2" color="neutral-faded">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View direction="row" gap={2}>
          <Button
            variant="faded"
            color="neutral"
            startIcon={<Icon svg={<Zap size={16} />} />}
            onClick={() => setQuickCheckinMode(true)}
          >
            Quick Check-in
          </Button>
          <Button
            color="primary"
            startIcon={<Icon svg={<Plus size={16} />} />}
            onClick={() => setShowCreateModal(true)}
          >
            New Habit
          </Button>
        </View>
      </View>

      {/* Daily Quote */}
      <View padding={4} marginBottom={6} style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))',
        borderRadius: 12, border: '1px solid rgba(34,197,94,0.15)'
      }}>
        <Text variant="body-3" color="neutral-faded" style={{ fontStyle: 'italic' }}>
          ✨ {quote}
        </Text>
      </View>

      {/* Today Progress Bar */}
      <View marginBottom={6} padding={4} style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)',
        borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
      }}>
        <View direction="row" align="center" gap={3} style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="body-2" weight="bold">Today's Progress</Text>
          <View direction="row" gap={2} align="center">
            <Badge color="primary" variant="faded" rounded size="small">
              {todayCompletions.size} / {activeHabits.length}
            </Badge>
            <Text variant="featured-2" weight="bold" color={completionPct === 100 ? 'success' : 'neutral'}>
              {completionPct}%
            </Text>
          </View>
        </View>
        <div style={{
          height: 8, borderRadius: 4, background: 'var(--rs-color-background-neutral-faded)',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%', borderRadius: 4, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            width: `${completionPct}%`,
            background: completionPct === 100
              ? 'linear-gradient(90deg, #22c55e, #16a34a)'
              : 'linear-gradient(90deg, #3b82f6, #22c55e)',
          }} />
        </div>
      </View>

      {/* Year Heatmap */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Your Year at a Glance</Text>
        <YearHeatmap completions={completions} habits={activeHabits} />
      </View>

      <Divider marginBottom={6} />

      {/* Today's Habits */}
      <View direction="row" align="center" gap={3} marginBottom={4} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Text variant="title-3" weight="bold">Today's Habits</Text>
        <View direction="row" gap={2} align="center">
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder="Search habits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 32px', borderRadius: 8,
                border: '1px solid var(--rs-color-border-neutral-faded)',
                background: 'var(--rs-color-background-neutral-default)',
                color: 'var(--rs-color-foreground-neutral-default)',
                fontSize: '0.8125rem', outline: 'none', width: 200,
              }}
            />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rs-color-foreground-neutral-faded)' }} />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 8,
              border: '1px solid var(--rs-color-border-neutral-faded)',
              background: 'var(--rs-color-background-neutral-default)',
              color: 'var(--rs-color-foreground-neutral-default)',
              fontSize: '0.8125rem',
            }}
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View padding={10} align="center" style={{
          background: 'var(--rs-color-background-neutral-faded)',
          borderRadius: 16, border: '2px dashed var(--rs-color-border-neutral-faded)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌱</div>
          <Text variant="title-3" weight="bold" marginBottom={2}>
            {activeHabits.length === 0 ? 'Start your habit journey' : 'No habits match'}
          </Text>
          <Text variant="body-2" color="neutral-faded" marginBottom={4}>
            {activeHabits.length === 0
              ? 'Create your first habit to begin tracking your progress'
              : 'Try adjusting your search or filter'}
          </Text>
          {activeHabits.length === 0 && (
            <Button color="primary" size="large" onClick={() => setShowCreateModal(true)}
              startIcon={<Icon svg={<Plus size={16} />} />}>
              Create Your First Habit
            </Button>
          )}
        </View>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {filtered.map((habit, i) => (
            <div key={habit.id} className={`animate-slide-up stagger-${(i % 6) + 1}`}>
              <HabitCard
                habit={habit}
                isCompleted={todayCompletions.has(habit.id)}
                refreshData={refreshData}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
