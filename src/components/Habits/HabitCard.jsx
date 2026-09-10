import React, { useMemo } from 'react';
import { View, Text, Icon, Badge, Tooltip } from 'reshaped';
import { Flame, Trophy, Check, Circle } from 'lucide-react';
import DynIcon from '../Shared/DynIcon';
import { useStore } from '../../lib/store';
import { toggleCompletion } from '../../lib/db';
import { getToday, getCurrentStreak, getLongestStreak } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';

export default function HabitCard({ habit, isCompleted, refreshData }) {
  const { completions, setView, addToast, addXp, unlockAchievement } = useStore();

  const habitCompletions = useMemo(
    () => completions.filter(c => c.habit_id === habit.id),
    [completions, habit.id]
  );
  const streak = getCurrentStreak(habitCompletions);
  const longest = getLongestStreak(habitCompletions);
  const cat = CATEGORIES.find(c => c.name === habit.category);

  async function handleToggle(e) {
    e.stopPropagation();
    const today = getToday();
    const wasAdded = await toggleCompletion(habit.id, today);
    await refreshData();

    if (wasAdded) {
      addXp(10);
      addToast({ type: 'success', message: `${habit.name} completed! +10 XP` });

      // Check time-based achievements
      const hour = new Date().getHours();
      if (hour < 7) unlockAchievement('early_bird');
      if (hour >= 22) unlockAchievement('night_owl');

      // Check streak milestones
      if (streak + 1 >= 3) unlockAchievement('streak_3');
      if (streak + 1 >= 7) unlockAchievement('streak_7');
      if (streak + 1 >= 30) unlockAchievement('streak_30');

      // Confetti for milestones
      const newStreak = streak + 1;
      if (newStreak % 7 === 0 || newStreak % 30 === 0) {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    }
  }

  function openPage() {
    setView('habit', habit.id);
  }

  return (
    <div
      className={`habit-card ${isCompleted ? 'completed' : ''}`}
      style={{ '--accent-color': habit.color }}
      onClick={openPage}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openPage()}
    >
      {/* Header */}
      <View direction="row" align="start" gap={3} marginBottom={3}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${habit.color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.5rem', flexShrink: 0,
          boxShadow: `0 2px 8px ${habit.color}20`
        }}>
          <DynIcon name={habit.icon || 'Zap'} size={24} color={habit.color} />
        </div>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body-1" weight="bold" style={{
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            {habit.name}
          </Text>
          <View direction="row" gap={1} align="center" marginTop={1}>
            <Badge size="small" variant="faded" color="neutral" rounded>
              {habit.category}
            </Badge>
            {habit.frequency !== 'daily' && (
              <Badge size="small" variant="faded" color="neutral" rounded>
                {habit.frequency}
              </Badge>
            )}
          </View>
        </View>
      </View>

      {/* Stats row */}
      <View direction="row" gap={4} marginBottom={3}>
        <View direction="row" gap={1} align="center">
          <Flame size={14} color="#f97316" />
          <Text variant="caption-1" weight="bold">{streak}</Text>
          <Text variant="caption-2" color="neutral-faded">streak</Text>
        </View>
        <View direction="row" gap={1} align="center">
          <Trophy size={14} color="#eab308" />
          <Text variant="caption-1" weight="bold">{longest}</Text>
          <Text variant="caption-2" color="neutral-faded">best</Text>
        </View>
      </View>

      {/* Mini heatmap (last 7 days) */}
      <View direction="row" gap={1} marginBottom={3}>
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          const ds = d.toISOString().split('T')[0];
          const has = habitCompletions.some(c => c.date === ds);
          return (
            <div key={i} style={{
              width: '100%', height: 6, borderRadius: 3,
              background: has ? habit.color : 'var(--rs-color-background-neutral-faded)',
              opacity: has ? 1 : 0.5,
              transition: 'all 0.3s'
            }} />
          );
        })}
      </View>

      {/* Action button */}
      <button
        onClick={handleToggle}
        style={{
          width: '100%', padding: '0.5rem', borderRadius: 8,
          border: `2px solid ${isCompleted ? habit.color : 'var(--rs-color-border-neutral-faded)'}`,
          background: isCompleted ? `${habit.color}10` : 'transparent',
          color: isCompleted ? habit.color : 'var(--rs-color-foreground-neutral-faded)',
          fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => {
          if (!isCompleted) {
            e.currentTarget.style.borderColor = habit.color;
            e.currentTarget.style.color = habit.color;
          }
        }}
        onMouseLeave={(e) => {
          if (!isCompleted) {
            e.currentTarget.style.borderColor = 'var(--rs-color-border-neutral-faded)';
            e.currentTarget.style.color = 'var(--rs-color-foreground-neutral-faded)';
          }
        }}
      >
        {isCompleted ? (
          <><Check size={16} /> Done!</>
        ) : (
          <><Circle size={16} /> Mark Done</>
        )}
      </button>
    </div>
  );
}
