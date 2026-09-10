import React, { useMemo, useState } from 'react';
import { View, Text, Icon, Badge, Tooltip } from 'reshaped';
import { Flame, Trophy, Check, Circle, Timer, CheckCircle, ShieldAlert, Gauge, ListChecks, Ban } from 'lucide-react';
import { useStore } from '../../lib/store';
import { toggleCompletion, saveCompletion } from '../../lib/db';
import { getToday, getCurrentStreak, getLongestStreak } from '../../lib/utils';
import { CATEGORIES, HABIT_TYPES } from '../../lib/constants';
import DynIcon from '../Shared/DynIcon';

export default function HabitCard({ habit, isCompleted, refreshData, onFocusTimer }) {
  const { completions, setView, addToast, addXp, unlockAchievement } = useStore();
  const [amount, setAmount] = useState('');
  const [showChecklist, setShowChecklist] = useState(false);

  const habitCompletions = useMemo(
    () => completions.filter(c => c.habit_id === habit.id),
    [completions, habit.id]
  );
  const streak = getCurrentStreak(habitCompletions);
  const longest = getLongestStreak(habitCompletions);
  const habitType = habit.habit_type || 'normal';
  const checklist = habit.checklist || [];

  // Today's completion data
  const todayCompletion = useMemo(() => {
    return habitCompletions.find(c => c.date === getToday());
  }, [habitCompletions]);

  const checklistDone = todayCompletion?.checklist_done || [];
  const allChecklistDone = checklist.length > 0 && checklistDone.length === checklist.length;

  async function handleToggle(e) {
    e.stopPropagation();
    if (habitType === 'amount') {
      // For amount habits, prompt for amount or use quick increment
      const newAmount = (todayCompletion?.amount || 0) + 1;
      await saveCompletion(habit.id, getToday(), { amount: newAmount, count: 1 });
      await refreshData();
      if (newAmount >= (habit.target_count || 1)) {
        addXp(10);
        addToast({ type: 'success', message: `${habit.name}: ${newAmount}/${habit.target_count} ${habit.unit || ''} - goal met! +10 XP` });
        unlockAchievement('amount_goal');
      } else {
        addToast({ type: 'info', message: `${habit.name}: ${newAmount}/${habit.target_count} ${habit.unit || ''}` });
      }
      return;
    }

    const today = getToday();
    const wasAdded = await toggleCompletion(habit.id, today);
    await refreshData();

    if (wasAdded) {
      addXp(10);
      if (habitType === 'avoid') {
        addToast({ type: 'success', message: `${habit.name} avoided today! +10 XP` });
      } else {
        addToast({ type: 'success', message: `${habit.name} completed! +10 XP` });
      }
      const hour = new Date().getHours();
      if (hour < 7) unlockAchievement('early_bird');
      if (hour >= 22) unlockAchievement('night_owl');
      if (streak + 1 >= 3) unlockAchievement('streak_3');
      if (streak + 1 >= 7) unlockAchievement('streak_7');
      if (streak + 1 >= 30) unlockAchievement('streak_30');
      const newStreak = streak + 1;
      if (newStreak % 7 === 0 || newStreak % 30 === 0) {
        try {
          const confetti = (await import('canvas-confetti')).default;
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        } catch {}
      }
    }
  }

  async function handleChecklistToggle(stepIdx) {
    const newDone = [...checklistDone];
    const idx = newDone.indexOf(stepIdx);
    if (idx >= 0) newDone.splice(idx, 1);
    else newDone.push(stepIdx);

    await saveCompletion(habit.id, getToday(), { checklist_done: newDone, count: 1 });
    await refreshData();

    if (newDone.length === checklist.length) {
      addXp(15);
      addToast({ type: 'success', message: `All steps complete! +15 XP` });
      unlockAchievement('checklist_done');
    }
  }

  function openPage() {
    setView('habit', habit.id);
  }

  const typeIcon = { normal: 'CheckCircle', avoid: 'ShieldAlert', amount: 'Gauge', checklist: 'ListChecks' };
  const typeLabel = { normal: '', avoid: 'Avoid', amount: `${habit.target_count} ${habit.unit || ''}`, checklist: `${checklist.length} steps` };

  return (
    <div className={`habit-card ${isCompleted || allChecklistDone ? 'completed' : ''}`}
      style={{ '--accent-color': habit.color }}
      onClick={openPage} role="button" tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && openPage()}>

      {/* Header */}
      <View direction="row" align="start" gap={3} marginBottom={3}>
        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: `${habit.color}15`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, boxShadow: `0 2px 8px ${habit.color}15`,
        }}>
          <DynIcon name={habit.icon || 'Zap'} size={22} color={habit.color} />
        </div>
        <View style={{ flex: 1, minWidth: 0 }}>
          <Text variant="body-1" weight="bold" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {habit.name}
          </Text>
          <View direction="row" gap={1} align="center" marginTop={1} style={{ flexWrap: 'wrap' }}>
            <Badge size="small" variant="faded" color="neutral" rounded>{habit.category}</Badge>
            {habitType !== 'normal' && (
              <Badge size="small" variant="faded" rounded
                color={habitType === 'avoid' ? 'critical' : habitType === 'amount' ? 'primary' : 'neutral'}>
                <View direction="row" gap={1} align="center">
                  <DynIcon name={typeIcon[habitType]} size={10} />
                  {typeLabel[habitType]}
                </View>
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
        {habitType === 'amount' && todayCompletion && (
          <View direction="row" gap={1} align="center">
            <Gauge size={14} color={habit.color} />
            <Text variant="caption-1" weight="bold">{todayCompletion.amount || 0}/{habit.target_count}</Text>
            <Text variant="caption-2" color="neutral-faded">{habit.unit || ''}</Text>
          </View>
        )}
      </View>

      {/* Mini heatmap (last 7 days) */}
      <View direction="row" gap={1} marginBottom={3}>
        {Array.from({ length: 7 }).map((_, i) => {
          const d = new Date(); d.setDate(d.getDate() - (6 - i));
          const ds = d.toISOString().split('T')[0];
          const has = habitCompletions.some(c => c.date === ds);
          return (
            <div key={i} style={{
              width: '100%', height: 6, borderRadius: 99,
              background: has ? habit.color : 'var(--rs-color-background-neutral-faded)',
              opacity: has ? 1 : 0.4, transition: 'all 0.3s',
            }} />
          );
        })}
      </View>

      {/* Checklist (if applicable) */}
      {checklist.length > 0 && (
        <View marginBottom={3}>
          <button onClick={(e) => { e.stopPropagation(); setShowChecklist(!showChecklist); }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '4px 0', background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', fontWeight: 600, color: 'var(--rs-color-foreground-neutral-faded)',
            }}>
            <View direction="row" gap={1} align="center">
              <ListChecks size={12} />
              <span>{checklistDone.length}/{checklist.length} steps</span>
            </View>
            <span style={{ fontSize: '0.65rem' }}>{showChecklist ? 'Hide' : 'Show'}</span>
          </button>
          {showChecklist && (
            <View gap={1} marginTop={1}>
              {checklist.map((step, idx) => {
                const done = checklistDone.includes(idx);
                return (
                  <button key={idx} onClick={(e) => { e.stopPropagation(); handleChecklistToggle(idx); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '4px 8px', borderRadius: 8, border: 'none', cursor: 'pointer',
                      background: done ? `${habit.color}10` : 'var(--rs-color-background-neutral-faded)',
                      width: '100%', textAlign: 'left', fontSize: '0.75rem',
                      color: done ? habit.color : 'var(--rs-color-foreground-neutral-default)',
                      textDecoration: done ? 'line-through' : 'none',
                    }}>
                    {done ? <CheckCircle size={14} color={habit.color} /> : <Circle size={14} />}
                    {step}
                  </button>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* Action buttons */}
      <View direction="row" gap={2}>
        <button onClick={handleToggle}
          style={{
            flex: 1, padding: '0.5rem', borderRadius: 10,
            border: `2px solid ${isCompleted || allChecklistDone ? habit.color : 'var(--rs-color-border-neutral-faded)'}`,
            background: isCompleted || allChecklistDone ? `${habit.color}10` : 'transparent',
            color: isCompleted || allChecklistDone ? habit.color : 'var(--rs-color-foreground-neutral-faded)',
            fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem',
            transition: 'all 0.2s',
          }}>
          {isCompleted || allChecklistDone ? <><Check size={16} /> Done</> : <><Circle size={16} /> {habitType === 'amount' ? '+1' : habitType === 'avoid' ? 'Avoided' : 'Mark Done'}</>}
        </button>
        <button onClick={(e) => { e.stopPropagation(); onFocusTimer?.(); }}
          style={{
            width: 40, height: 38, borderRadius: 10,
            border: '1px solid var(--rs-color-border-neutral-faded)',
            background: 'transparent', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--rs-color-foreground-neutral-faded)', transition: 'all 0.15s',
          }}
          title="Focus timer">
          <Timer size={16} />
        </button>
      </View>
    </div>
  );
}
