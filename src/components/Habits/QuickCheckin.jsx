import React, { useState } from 'react';
import { View, Text, Button, Icon } from 'reshaped';
import { X, Check, Zap, Flame } from 'lucide-react';
import { useStore } from '../../lib/store';
import { toggleCompletion } from '../../lib/db';
import { getToday, getCurrentStreak } from '../../lib/utils';

export default function QuickCheckin({ refreshData }) {
  const { habits, completions, setQuickCheckinMode, addToast, addXp } = useStore();
  const activeHabits = habits.filter(h => !h.archived);
  const today = getToday();
  const [checkedIds, setCheckedIds] = useState(new Set(
    completions.filter(c => c.date === today).map(c => c.habit_id)
  ));

  async function handleCheck(habit) {
    const wasAdded = await toggleCompletion(habit.id, today);
    await refreshData();
    const newSet = new Set(checkedIds);
    if (wasAdded) {
      newSet.add(habit.id);
      addXp(10);
      addToast({ type: 'success', message: `✅ ${habit.name} done! +10 XP` });
    } else {
      newSet.delete(habit.id);
    }
    setCheckedIds(newSet);
  }

  const done = checkedIds.size;
  const total = activeHabits.length;

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '2rem',
    }}>
      <div style={{ width: '100%', maxWidth: 500 }}>
        {/* Header */}
        <View direction="row" align="center" gap={3} marginBottom={6} style={{ justifyContent: 'space-between' }}>
          <View direction="row" align="center" gap={2}>
            <Zap size={24} color="#f59e0b" />
            <Text variant="title-1" weight="bold">Quick Check-in</Text>
          </View>
          <button onClick={() => setQuickCheckinMode(false)} style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'var(--rs-color-background-neutral-faded)',
            border: 'none', cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center',
          }}><X size={18} /></button>
        </View>

        {/* Progress */}
        <View marginBottom={6}>
          <View direction="row" align="center" gap={2} marginBottom={2} style={{ justifyContent: 'space-between' }}>
            <Text variant="body-2" weight="bold">{done} of {total} completed</Text>
            <Text variant="featured-2" weight="bold" color={done === total ? 'success' : 'primary'}>
              {total > 0 ? Math.round((done / total) * 100) : 0}%
            </Text>
          </View>
          <div style={{ height: 8, borderRadius: 4, background: 'var(--rs-color-background-neutral-faded)', overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.5s ease',
              width: `${total > 0 ? (done / total) * 100 : 0}%`,
              background: done === total ? '#22c55e' : 'linear-gradient(90deg, #3b82f6, #22c55e)',
            }} />
          </div>
        </View>

        {/* Habit List */}
        <View gap={2}>
          {activeHabits.map((habit, i) => {
            const done = checkedIds.has(habit.id);
            const streak = getCurrentStreak(completions.filter(c => c.habit_id === habit.id));
            return (
              <button
                key={habit.id}
                onClick={() => handleCheck(habit)}
                className={`animate-slide-up stagger-${(i % 6) + 1}`}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 16,
                  padding: '16px 20px', borderRadius: 12, cursor: 'pointer',
                  border: `2px solid ${done ? habit.color : 'var(--rs-color-border-neutral-faded)'}`,
                  background: done ? `${habit.color}08` : 'var(--rs-color-background-neutral-default)',
                  transition: 'all 0.2s', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${habit.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem',
                }}>
                  {habit.icon}
                </div>
                <View style={{ flex: 1 }}>
                  <Text variant="body-1" weight="bold" style={{
                    textDecoration: done ? 'line-through' : 'none',
                    opacity: done ? 0.6 : 1,
                  }}>{habit.name}</Text>
                  <View direction="row" gap={1} align="center">
                    <Flame size={12} color="#f97316" />
                    <Text variant="caption-1" color="neutral-faded">{streak} day streak</Text>
                  </View>
                </View>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  border: `2px solid ${done ? habit.color : 'var(--rs-color-border-neutral-faded)'}`,
                  background: done ? habit.color : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                }}>
                  {done && <Check size={18} color="white" />}
                </div>
              </button>
            );
          })}
        </View>

        {activeHabits.length === 0 && (
          <View align="center" padding={8}>
            <Text variant="body-2" color="neutral-faded">No habits to check in. Create some first!</Text>
          </View>
        )}

        {done === total && total > 0 && (
          <View marginTop={6} align="center" padding={4} style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(59,130,246,0.05))',
            borderRadius: 12, border: '1px solid rgba(34,197,94,0.2)',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎉</div>
            <Text variant="title-3" weight="bold">All Done!</Text>
            <Text variant="body-3" color="neutral-faded">Amazing work today. Keep the streak going!</Text>
          </View>
        )}
      </div>
    </div>
  );
}
