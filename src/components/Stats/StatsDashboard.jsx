import React, { useMemo } from 'react';
import { View, Text, Badge, Divider } from 'reshaped';
import { Trophy, Flame, Target, TrendingUp, Calendar, Award, Star, Zap } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getCurrentStreak, getLongestStreak, getCompletionRate, getLast30Days, getLast7Days, getDayOfWeekStats, toStr } from '../../lib/utils';
import { ACHIEVEMENTS, MOODS } from '../../lib/constants';
import YearHeatmap from '../Heatmap/YearHeatmap';

export default function StatsDashboard() {
  const { habits, completions, journalEntries, achievements, xp, level } = useStore();
  const activeHabits = habits.filter(h => !h.archived);

  const overallStats = useMemo(() => {
    const last30 = getLast30Days();
    const last7 = getLast7Days();
    const totalCompletions = completions.length;
    const activeDays = new Set(completions.map(c => c.date)).size;
    const rate30 = completions.length > 0 ? getCompletionRate(completions, last30) : 0;
    const rate7 = completions.length > 0 ? getCompletionRate(completions, last7) : 0;

    // Streaks per habit
    const streaks = activeHabits.map(h => ({
      ...h,
      current: getCurrentStreak(completions.filter(c => c.habit_id === h.id)),
      longest: getLongestStreak(completions.filter(c => c.habit_id === h.id)),
    })).sort((a, b) => b.current - a.current);

    const bestStreak = streaks[0]?.current || 0;
    const avgRate = activeHabits.length > 0
      ? Math.round(activeHabits.reduce((sum, h) => sum + getCompletionRate(completions.filter(c => c.habit_id === h.id), last30), 0) / activeHabits.length)
      : 0;

    // Day of week overall
    const dayStats = getDayOfWeekStats(completions);

    // Category breakdown
    const catBreakdown = {};
    activeHabits.forEach(h => {
      if (!catBreakdown[h.category]) catBreakdown[h.category] = { count: 0, completions: 0 };
      catBreakdown[h.category].count++;
      catBreakdown[h.category].completions += completions.filter(c => c.habit_id === h.id).length;
    });

    // Mood trend
    const moodTrend = journalEntries.slice(0, 14).reverse().map(e => ({
      date: e.date, mood: e.mood, energy: e.energy || 3,
    }));

    return {
      totalCompletions, activeDays, rate30, rate7, bestStreak, avgRate,
      streaks, dayStats, catBreakdown, moodTrend,
    };
  }, [habits, completions, journalEntries]);

  return (
    <div className="animate-fade-in">
      <View marginBottom={6}>
        <Text variant="title-1" weight="bold">Statistics</Text>
        <Text variant="body-2" color="neutral-faded">Your habit tracking insights and progress</Text>
      </View>

      {/* Top Stats */}
      <div className="grid-4 mb-xl">
        {[
          { icon: <Zap size={22} color="#8b5cf6" />, value: xp, label: 'Total XP', bg: 'rgba(139,92,246,0.08)' },
          { icon: <Flame size={22} color="#f97316" />, value: overallStats.bestStreak, label: 'Best Active Streak', bg: 'rgba(249,115,22,0.08)' },
          { icon: <Target size={22} color="#3b82f6" />, value: `${overallStats.avgRate}%`, label: 'Avg 30-Day Rate', bg: 'rgba(59,130,246,0.08)' },
          { icon: <Calendar size={22} color="#22c55e" />, value: overallStats.activeDays, label: 'Active Days', bg: 'rgba(34,197,94,0.08)' },
        ].map((s, i) => (
          <div key={i} className={`stat-card animate-slide-up stagger-${i + 1}`}>
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12,
            }}>{s.icon}</div>
            <Text variant="display-2" weight="bold">{s.value}</Text>
            <Text variant="caption-1" color="neutral-faded">{s.label}</Text>
          </div>
        ))}
      </div>

      {/* Overall Heatmap */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>Overall Activity</Text>
        <YearHeatmap completions={completions} habits={activeHabits} />
      </View>

      {/* Streak Leaderboard */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>🏆 Streak Leaderboard</Text>
        <View gap={2}>
          {overallStats.streaks.slice(0, 8).map((h, i) => (
            <View key={h.id} direction="row" align="center" gap={3} padding={3} style={{
              background: 'var(--rs-color-background-neutral-default)',
              border: '1px solid var(--rs-color-border-neutral-faded)',
              borderRadius: 10, transition: 'all 0.2s',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: i === 0 ? '#fbbf24' : i === 1 ? '#94a3b8' : i === 2 ? '#d97706' : 'var(--rs-color-background-neutral-faded)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, color: i < 3 ? 'white' : 'var(--rs-color-foreground-neutral-faded)',
              }}>{i + 1}</div>
              <span style={{ fontSize: '1.25rem' }}>{h.icon}</span>
              <View style={{ flex: 1 }}>
                <Text variant="body-3" weight="bold">{h.name}</Text>
                <Text variant="caption-2" color="neutral-faded">{h.category}</Text>
              </View>
              <View align="end">
                <View direction="row" gap={1} align="center">
                  <Flame size={14} color="#f97316" />
                  <Text variant="body-2" weight="bold">{h.current}</Text>
                </View>
                <Text variant="caption-2" color="neutral-faded">Best: {h.longest}</Text>
              </View>
              {/* Progress bar */}
              <div style={{ width: 60, height: 6, borderRadius: 3, background: 'var(--rs-color-background-neutral-faded)', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 3, background: h.color,
                  width: `${Math.min((h.current / 30) * 100, 100)}%`,
                  transition: 'width 0.8s ease',
                }} />
              </div>
            </View>
          ))}
          {overallStats.streaks.length === 0 && (
            <Text variant="body-3" color="neutral-faded" style={{ fontStyle: 'italic' }}>Create habits and start checking in to see your leaderboard!</Text>
          )}
        </View>
      </View>

      {/* Day of Week Pattern */}
      <View direction="row" gap={6} marginBottom={6}>
        <View style={{ flex: 1 }}>
          <Text variant="title-3" weight="bold" marginBottom={3}>📅 Day of Week Pattern</Text>
          <View padding={4} style={{
            background: 'var(--rs-color-background-neutral-default)',
            border: '1px solid var(--rs-color-border-neutral-faded)',
            borderRadius: 12,
          }}>
            <div className="bar-chart">
              {overallStats.dayStats.map((d, i) => {
                const max = Math.max(...overallStats.dayStats.map(x => x.count), 1);
                return (
                  <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                    <div className="bar" style={{
                      height: `${Math.max((d.count / max) * 100, 4)}%`,
                      background: 'linear-gradient(to top, #3b82f6, #22c55e)',
                    }} />
                    <Text variant="caption-2" color="neutral-faded">{d.name}</Text>
                    <Text variant="caption-2" weight="bold">{d.count}</Text>
                  </div>
                );
              })}
            </div>
          </View>
        </View>

        {/* Category Breakdown */}
        <View style={{ flex: 1 }}>
          <Text variant="title-3" weight="bold" marginBottom={3}>📊 Category Breakdown</Text>
          <View gap={2}>
            {Object.entries(overallStats.catBreakdown).map(([cat, data]) => (
              <View key={cat} direction="row" align="center" gap={3} padding={2} style={{
                background: 'var(--rs-color-background-neutral-faded)', borderRadius: 8,
              }}>
                <Text variant="body-3" style={{ flex: 1 }}>{cat}</Text>
                <Badge size="small" variant="faded" rounded>{data.count} habits</Badge>
                <Text variant="caption-1" weight="bold">{data.completions} ✓</Text>
              </View>
            ))}
            {Object.keys(overallStats.catBreakdown).length === 0 && (
              <Text variant="body-3" color="neutral-faded" style={{ fontStyle: 'italic' }}>No habits yet</Text>
            )}
          </View>
        </View>
      </View>

      {/* Mood Trend */}
      {overallStats.moodTrend.length > 0 && (
        <View marginBottom={6}>
          <Text variant="title-3" weight="bold" marginBottom={3}>😊 Mood Trend (Last 14 Entries)</Text>
          <View padding={4} style={{
            background: 'var(--rs-color-background-neutral-default)',
            border: '1px solid var(--rs-color-border-neutral-faded)',
            borderRadius: 12,
          }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 80 }}>
              {overallStats.moodTrend.map((m, i) => (
                <div key={i} style={{ flex: 1, textAlign: 'center' }}>
                  <div style={{
                    height: `${m.mood * 20}%`, minHeight: 8,
                    background: MOODS[m.mood - 1]?.color || '#94a3b8',
                    borderRadius: '4px 4px 0 0', transition: 'height 0.5s',
                  }} />
                  <Text variant="caption-2">{MOODS[m.mood - 1]?.emoji}</Text>
                </div>
              ))}
            </div>
          </View>
        </View>
      )}

      {/* Achievements */}
      <View marginBottom={6}>
        <Text variant="title-3" weight="bold" marginBottom={3}>🏅 Achievements ({achievements.length}/{ACHIEVEMENTS.length})</Text>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
          {ACHIEVEMENTS.map(a => {
            const unlocked = achievements.includes(a.id);
            return (
              <div key={a.id} className={`badge-achievement ${unlocked ? 'unlocked' : 'locked'}`}>
                <span className="badge-icon">{a.icon}</span>
                <span className="badge-name">{a.name}</span>
                <span className="badge-desc">{a.desc}</span>
                {unlocked && <Badge size="small" color="primary" variant="faded" rounded>Unlocked</Badge>}
              </div>
            );
          })}
        </div>
      </View>
    </div>
  );
}
