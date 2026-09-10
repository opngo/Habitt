import React, { useMemo } from 'react';
import { View, Text, Button, Icon, Badge, Divider } from 'reshaped';
import {
  ArrowLeft, Flame, Trophy, Target, TrendingUp, Calendar, Trash2,
  Archive, BarChart3, Check, Circle
} from 'lucide-react';
import DynIcon from '../Shared/DynIcon';
import { useStore } from '../../lib/store';
import { toggleCompletion, updateHabit, deleteHabit } from '../../lib/db';
import {
  getToday, getLast7Days, toStr, getCurrentStreak, getLongestStreak,
  getCompletionRate, getLast30Days, getDayOfWeekStats, getMonthlyData, format
} from '../../lib/utils';
import YearHeatmap from '../Heatmap/YearHeatmap';

export default function HabitDetailPage({ refreshData }) {
  const { selectedHabitId, habits, completions, setView, addToast } = useStore();
  const habit = habits.find(h => h.id === selectedHabitId);

  const habitCompletions = useMemo(
    () => completions.filter(c => c.habit_id === selectedHabitId),
    [completions, selectedHabitId]
  );

  const stats = useMemo(() => {
    if (!habit) return {};
    const current = getCurrentStreak(habitCompletions);
    const longest = getLongestStreak(habitCompletions);
    const last30 = getLast30Days();
    const rate30 = getCompletionRate(habitCompletions, last30);
    const dayStats = getDayOfWeekStats(habitCompletions);
    const monthly = getMonthlyData(habitCompletions, new Date().getFullYear());
    const maxDay = dayStats.reduce((a, b) => a.count > b.count ? a : b, dayStats[0]);
    return { current, longest, rate30, total: habitCompletions.length, dayStats, monthly, maxDay };
  }, [habitCompletions, habit]);

  if (!habit) return <Text>No habit selected</Text>;

  const last7 = getLast7Days();
  const completedDates = new Set(habitCompletions.map(c => c.date));

  async function handleToggleDay(date) {
    await toggleCompletion(habit.id, date);
    await refreshData();
  }

  return (
    <div className="animate-fade-in">
      {/* Back button */}
      <button onClick={() => setView('dashboard')} style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem 0',
        color: 'var(--rs-color-foreground-neutral-faded)', fontSize: '0.875rem', marginBottom: '1rem'
      }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* Hero Section */}
      <View padding={5} marginBottom={6} style={{
        borderRadius: 16, borderLeft: `4px solid ${habit.color}`,
        background: 'var(--rs-color-background-neutral-default)',
        boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      }}>
        <View direction="row" gap={4} align="start">
          <div style={{
            width: 64, height: 64, borderRadius: 16,
            background: `${habit.color}15`, display: 'flex',
            alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem',
            boxShadow: `0 4px 12px ${habit.color}20`,
          }}>
            <DynIcon name={habit.icon || 'Zap'} size={32} color={habit.color} />
          </div>
          <View style={{ flex: 1 }}>
            <Text variant="title-1" weight="bold">{habit.name}</Text>
            {habit.description && (
              <Text variant="body-2" color="neutral-faded" marginTop={1}>{habit.description}</Text>
            )}
            <View direction="row" gap={2} marginTop={2}>
              <Badge rounded color="neutral" variant="faded">{habit.category}</Badge>
              <Badge rounded color="neutral" variant="faded" style={{ textTransform: 'capitalize' }}>{habit.frequency}</Badge>
              {habit.target_count > 1 && <Badge rounded color="neutral" variant="faded">{habit.target_count}x/day</Badge>}
            </View>
          </View>
        </View>
      </View>

      {/* Stats Grid */}
      <div className="grid-4 mb-xl">
        {[
          { icon: <Flame size={20} color="#f97316" />, value: stats.current || 0, label: 'Current Streak', sub: 'days' },
          { icon: <Trophy size={20} color="#eab308" />, value: stats.longest || 0, label: 'Longest Streak', sub: 'days' },
          { icon: <TrendingUp size={20} color="#3b82f6" />, value: `${stats.rate30 || 0}%`, label: '30-Day Rate', sub: 'completion' },
          { icon: <Check size={20} color="#22c55e" />, value: stats.total || 0, label: 'Total Check-ins', sub: 'all time' },
        ].map((s, i) => (
          <div key={i} className={`stat-card animate-slide-up stagger-${i + 1}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              {s.icon}
              <Text variant="caption-1" color="neutral-faded">{s.label}</Text>
            </div>
            <Text variant="display-2" weight="bold">{s.value}</Text>
            <Text variant="caption-2" color="neutral-faded">{s.sub}</Text>
          </div>
        ))}
      </div>

      {/* Last 7 Days */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Last 7 Days</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
          {last7.map((date) => {
            const ds = toStr(date);
            const done = completedDates.has(ds);
            return (
              <button key={ds} className={`day-chip ${done ? 'completed' : ''}`} onClick={() => handleToggleDay(ds)}>
                <span className="day-label">{format(date, 'EEE')}</span>
                <span className="day-num">{format(date, 'd')}</span>
                <span className="day-icon">{done ? '' : ''}</span>
              </button>
            );
          })}
        </div>
      </View>

      {/* Heatmap */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Activity Heatmap</Text>
        <YearHeatmap completions={completions} habits={[]} habitId={habit.id} />
      </View>

      {/* Day of Week Pattern */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Day of Week Pattern</Text>
        <View padding={4} style={{
          background: 'var(--rs-color-background-neutral-default)',
          border: '1px solid var(--rs-color-border-neutral-faded)',
          borderRadius: 12,
        }}>
          <div className="bar-chart">
            {(stats.dayStats || []).map((d, i) => {
              const maxCount = Math.max(...(stats.dayStats || []).map(x => x.count), 1);
              const height = (d.count / maxCount) * 100;
              return (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div className="bar" style={{
                    height: `${Math.max(height, 4)}%`,
                    background: d.name === stats.maxDay?.name
                      ? habit.color
                      : `${habit.color}60`,
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.8s cubic-bezier(0.4, 0, 0.2, 1)',
                  }} />
                  <Text variant="caption-2" color="neutral-faded">{d.name}</Text>
                  <Text variant="caption-2" weight="bold">{d.count}</Text>
                </div>
              );
            })}
          </div>
          <View marginTop={2}>
            <Text variant="caption-1" color="neutral-faded">
               Best day: <strong>{stats.maxDay?.name}</strong> with {stats.maxDay?.count} completions
            </Text>
          </View>
        </View>
      </View>

      {/* Monthly Trend */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Monthly Trend ({new Date().getFullYear()})</Text>
        <View padding={4} style={{
          background: 'var(--rs-color-background-neutral-default)',
          border: '1px solid var(--rs-color-border-neutral-faded)',
          borderRadius: 12,
        }}>
          <div className="bar-chart" style={{ height: 100 }}>
            {(stats.monthly || []).map((m, i) => (
              <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                <div className="bar" style={{
                  height: `${Math.max(m.rate, 4)}%`,
                  background: m.rate >= 80 ? habit.color : m.rate >= 50 ? `${habit.color}90` : `${habit.color}50`,
                  borderRadius: '4px 4px 0 0',
                }} />
                <Text variant="caption-2" color="neutral-faded">{m.month}</Text>
              </div>
            ))}
          </div>
        </View>
      </View>

      {/* Recent Completions */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Recent Completions</Text>
        {habitCompletions.length === 0 ? (
          <Text variant="body-2" color="neutral-faded">No completions yet. Start checking in!</Text>
        ) : (
          <View gap={2}>
            {habitCompletions.slice(0, 15).map((c, i) => (
              <View key={c.id || i} direction="row" align="center" gap={3} padding={3} style={{
                background: 'var(--rs-color-background-neutral-faded)',
                borderRadius: 8,
              }}>
                <Check size={16} color={habit.color} />
                <Text variant="body-3" weight="medium">
                  {format(new Date(c.date + 'T12:00:00'), 'EEEE, MMM d, yyyy')}
                </Text>
                {c.note && <Text variant="caption-1" color="neutral-faded" style={{ fontStyle: 'italic' }}>"{c.note}"</Text>}
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Danger Zone */}
      <View padding={4} style={{
        border: '1px solid var(--rs-color-border-critical-faded)',
        borderRadius: 12,
      }}>
        <Text variant="body-2" weight="bold" color="critical" marginBottom={3}>Manage Habit</Text>
        <View direction="row" gap={2}>
          <Button variant="faded" color="neutral" startIcon={<Icon svg={<Archive size={14} />} />}
            onClick={async () => {
              await updateHabit(habit.id, { archived: 1 });
              await refreshData();
              setView('dashboard');
              addToast({ type: 'info', message: 'Habit archived' });
            }}>
            Archive
          </Button>
          <Button variant="faded" color="critical" startIcon={<Icon svg={<Trash2 size={14} />} />}
            onClick={async () => {
              if (confirm(`Delete "${habit.name}"? This cannot be undone.`)) {
                await deleteHabit(habit.id);
                await refreshData();
                setView('dashboard');
                addToast({ type: 'error', message: 'Habit deleted' });
              }
            }}>
            Delete
          </Button>
        </View>
      </View>
    </div>
  );
}
