import React, { useMemo, useState } from 'react';
import { View, Text, Button, Icon, Badge, Tooltip } from 'reshaped';
import { Plus, Zap, Search, Calendar, BarChart3, Timer, StickyNote, Quote, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, getLast365Days, getLast7Days, toStr, format, getCompletionIntensity, getWeeksFromDays, getMonthDays, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from '../../lib/utils';
import { DAILY_QUOTES } from '../../lib/constants';
import YearHeatmap from '../Heatmap/YearHeatmap';
import HabitCard from './HabitCard';
import MonthCalendar from '../Shared/MonthCalendar';
import DynIcon from '../Shared/DynIcon';

export default function Dashboard({ refreshData }) {
  const {
    habits, completions, dayNotes, showCreateModal, setShowCreateModal,
    searchQuery, setSearchQuery, selectedCategory, setSelectedCategory,
    setView, setQuickCheckinMode, setShowFocusTimer, setFocusTimerHabitId,
    setShowDayNoteModal, setSelectedDate, heatmapView, setHeatmapView,
    calendarMonth, setCalendarMonth, globalVacationMode, setGlobalVacationMode,
    addToast
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

  // Day notes map for quick access
  const noteDates = useMemo(() => new Set(dayNotes.map(n => n.date)), [dayNotes]);

  function handleCalendarDayClick(data) {
    if (data.type === 'prev') {
      setCalendarMonth(subMonths(calendarMonth, 1));
    } else if (data.type === 'next') {
      setCalendarMonth(addMonths(calendarMonth, 1));
    } else if (data.date) {
      setSelectedDate(data.date);
      setShowDayNoteModal(true);
    }
  }

  function handleDayNote(date) {
    setSelectedDate(date);
    setShowDayNoteModal(true);
  }

  function openFocusTimer(habitId) {
    setFocusTimerHabitId(habitId);
    setShowFocusTimer(true);
  }

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Good night' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div>
      {/* Header */}
      <View direction="row" align="center" gap={4} paddingBottom={4} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View>
          <Text variant="title-1" weight="bold">{greeting}</Text>
          <Text variant="body-2" color="neutral-faded">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </Text>
        </View>
        <View direction="row" gap={2}>
          <Button variant="faded" color="neutral" onClick={() => setQuickCheckinMode(true)}
            startIcon={<Icon svg={<Zap size={16} />} />}>Quick Check-in</Button>
          <Button variant="faded" color="neutral" onClick={() => { setFocusTimerHabitId(null); setShowFocusTimer(true); }}
            startIcon={<Icon svg={<Timer size={16} />} />}>Focus</Button>
          <Button color="primary" onClick={() => setShowCreateModal(true)}
            startIcon={<Icon svg={<Plus size={16} />} />}>New Habit</Button>
        </View>
      </View>

      {/* Quote */}
      <View direction="row" align="center" gap={2} padding={4} marginBottom={5} style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(59,130,246,0.03))',
        borderRadius: 14, border: '1px solid rgba(34,197,94,0.12)'
      }}>
        <Quote size={16} color="#22c55e" style={{ flexShrink: 0 }} />
        <Text variant="body-3" color="neutral-faded" style={{ fontStyle: 'italic' }}>{quote}</Text>
      </View>

      {/* Today Progress */}
      <View marginBottom={5} padding={4} style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)',
        borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
      }}>
        <View direction="row" align="center" gap={3} style={{ justifyContent: 'space-between', marginBottom: 8 }}>
          <Text variant="body-2" weight="bold">Today's Progress</Text>
          <View direction="row" gap={2} align="center">
            <Badge color="primary" variant="faded" rounded size="small">{todayCompletions.size} / {activeHabits.length}</Badge>
            <Text variant="featured-2" weight="bold" color={completionPct === 100 ? 'success' : 'neutral'}>{completionPct}%</Text>
          </View>
        </View>
        <div style={{ height: 8, borderRadius: 99, background: 'var(--rs-color-background-neutral-faded)', overflow: 'hidden' }}>
          <div style={{
            height: '100%', borderRadius: 99, transition: 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
            width: `${completionPct}%`,
            background: completionPct === 100 ? 'linear-gradient(90deg, #22c55e, #16a34a)' : 'linear-gradient(90deg, #3b82f6, #22c55e)',
          }} />
        </div>
      </View>

      {/* Big Heatmap + Calendar Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Big Heatmap */}
        <View>
          <View direction="row" align="center" gap={3} marginBottom={3} style={{ justifyContent: 'space-between' }}>
            <Text variant="title-3" weight="bold">Activity Overview</Text>
            <View direction="row" gap={1}>
              {['year', 'month', 'week'].map(v => (
                <button key={v} onClick={() => setHeatmapView(v)} style={{
                  padding: '4px 12px', borderRadius: 8,
                  border: `1px solid ${heatmapView === v ? '#22c55e' : 'var(--rs-color-border-neutral-faded)'}`,
                  background: heatmapView === v ? 'rgba(34,197,94,0.08)' : 'transparent',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                  color: heatmapView === v ? '#22c55e' : 'var(--rs-color-foreground-neutral-faded)',
                  transition: 'all 0.15s',
                }}>{v}</button>
              ))}
            </View>
          </View>
          <YearHeatmap completions={completions} habits={activeHabits} view={heatmapView} />
        </View>

        {/* Calendar */}
        <View>
          <Text variant="title-3" weight="bold" marginBottom={3}>Calendar</Text>
          <MonthCalendar
            year={calendarMonth.getFullYear()}
            month={calendarMonth.getMonth()}
            onDayClick={handleCalendarDayClick}
            onDayNote={handleDayNote}
          />
          <Text variant="caption-2" color="neutral-faded" marginTop={2} style={{ textAlign: 'center' }}>
            Click a day for notes. Right-click to add a day note.
          </Text>
        </View>
      </div>

      {/* Today's Habits */}
      <View direction="row" align="center" gap={3} marginBottom={4} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <Text variant="title-3" weight="bold">Today's Habits</Text>
        <View direction="row" gap={2} align="center">
          <div style={{ position: 'relative' }}>
            <input type="text" placeholder="Search..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '6px 12px 6px 32px', borderRadius: 10,
                border: '1px solid var(--rs-color-border-neutral-faded)',
                background: 'var(--rs-color-background-neutral-default)',
                color: 'var(--rs-color-foreground-neutral-default)',
                fontSize: '0.8125rem', outline: 'none', width: 180,
              }} />
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rs-color-foreground-neutral-faded)' }} />
          </div>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}
            style={{
              padding: '6px 12px', borderRadius: 10,
              border: '1px solid var(--rs-color-border-neutral-faded)',
              background: 'var(--rs-color-background-neutral-default)',
              color: 'var(--rs-color-foreground-neutral-default)',
              fontSize: '0.8125rem',
            }}>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </View>
      </View>

      {filtered.length === 0 ? (
        <View padding={10} align="center" style={{
          background: 'var(--rs-color-background-neutral-faded)',
          borderRadius: 20, border: '2px dashed var(--rs-color-border-neutral-faded)', textAlign: 'center'
        }}>
          <DynIcon name="Sprout" size={48} color="#22c55e" style={{ marginBottom: 12 }} />
          <Text variant="title-3" weight="bold" marginBottom={2}>
            {activeHabits.length === 0 ? 'Start your habit journey' : 'No habits match'}
          </Text>
          <Text variant="body-2" color="neutral-faded" marginBottom={4}>
            {activeHabits.length === 0 ? 'Create your first habit to begin tracking' : 'Try adjusting your search or filter'}
          </Text>
          {activeHabits.length === 0 && (
            <Button color="primary" size="large" onClick={() => setShowCreateModal(true)}
              startIcon={<Icon svg={<Plus size={16} />} />}>Create Your First Habit</Button>
          )}
        </View>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {filtered.map((habit, i) => (
            <div key={habit.id} className={`animate-slide-up stagger-${(i % 6) + 1}`}>
              <HabitCard habit={habit} isCompleted={todayCompletions.has(habit.id)}
                refreshData={refreshData} onFocusTimer={() => openFocusTimer(habit.id)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
