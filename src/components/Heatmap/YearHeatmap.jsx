import React, { useMemo } from 'react';
import { View, Text, Tooltip } from 'reshaped';
import { getLast365Days, getLast7Days, getLast30Days, toStr, getWeeksFromDays, getCompletionIntensity, format, getMonthDays } from '../../lib/utils';
import { useStore } from '../../lib/store';
import DynIcon from '../Shared/DynIcon';

export default function YearHeatmap({ completions, habits, habitId, view = 'year' }) {
  const { dayNotes } = useStore();
  const noteDates = useMemo(() => new Set((dayNotes || []).map(n => n.date)), [dayNotes]);

  const days = useMemo(() => {
    if (view === 'week') return getLast7Days();
    if (view === 'month') return getLast30Days();
    return getLast365Days();
  }, [view]);

  const weeks = useMemo(() => getWeeksFromDays(days), [days]);

  const countMap = useMemo(() => {
    const map = {};
    const filtered = habitId ? completions.filter(c => c.habit_id === habitId) : completions;
    filtered.forEach(c => { map[c.date] = (map[c.date] || 0) + (c.count || 1); });
    return map;
  }, [completions, habitId]);

  // Habits completed per day (for tooltip)
  const dayHabits = useMemo(() => {
    const map = {};
    const filtered = habitId ? completions.filter(c => c.habit_id === habitId) : completions;
    filtered.forEach(c => {
      if (!map[c.date]) map[c.date] = [];
      const h = habits?.find(ha => ha.id === c.habit_id);
      if (h) map[c.date].push(h);
    });
    return map;
  }, [completions, habits, habitId]);

  // Month labels
  const monthLabels = useMemo(() => {
    if (view !== 'year') return [];
    const labels = [];
    let lastMonth = -1;
    days.forEach((date, index) => {
      const month = date.getMonth();
      if (month !== lastMonth) {
        labels.push({ month: format(date, 'MMM'), index });
        lastMonth = month;
      }
    });
    return labels;
  }, [days, view]);

  const dayLabels = view === 'year' ? ['', 'Mon', '', 'Wed', '', 'Fri', ''] : [];
  const totalCompletions = Object.values(countMap).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(countMap).length;

  function getTooltipContent(date) {
    const ds = toStr(date);
    const count = countMap[ds] || 0;
    const dateStr = format(date, 'EEEE, MMM d, yyyy');
    const hasNote = noteDates.has(ds);
    const habitsOnDay = dayHabits[ds] || [];

    return (
      <div style={{ maxWidth: 220 }}>
        <div style={{ fontWeight: 600, marginBottom: 4 }}>{dateStr}</div>
        <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
          {count === 0 ? 'No completions' : `${count} completion${count > 1 ? 's' : ''}`}
        </div>
        {habitsOnDay.length > 0 && (
          <div style={{ marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 3 }}>
            {habitsOnDay.slice(0, 6).map(h => (
              <span key={h.id} style={{
                display: 'inline-flex', alignItems: 'center', gap: 2,
                padding: '1px 6px', borderRadius: 6, fontSize: '0.65rem',
                background: `${h.color}30`, color: 'white',
              }}>
                {h.name}
              </span>
            ))}
          </div>
        )}
        {hasNote && (
          <div style={{ marginTop: 4, fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: 3, opacity: 0.8 }}>
            <DynIcon name="StickyNote" size={10} /> Has a note
          </div>
        )}
      </div>
    );
  }

  return (
    <View padding={4} style={{
      background: 'var(--rs-color-background-neutral-default)',
      border: '1px solid var(--rs-color-border-neutral-faded)',
      borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
    }}>
      {/* Stats summary */}
      <View direction="row" gap={6} marginBottom={3} style={{ justifyContent: 'flex-end' }}>
        <View direction="row" gap={1} align="center">
          <Text variant="caption-1" color="neutral-faded">Total:</Text>
          <Text variant="caption-1" weight="bold">{totalCompletions}</Text>
        </View>
        <View direction="row" gap={1} align="center">
          <Text variant="caption-1" color="neutral-faded">Active days:</Text>
          <Text variant="caption-1" weight="bold">{activeDays}</Text>
        </View>
        {days.length > 0 && (
          <View direction="row" gap={1} align="center">
            <Text variant="caption-1" color="neutral-faded">Rate:</Text>
            <Text variant="caption-1" weight="bold">{Math.round((activeDays / days.length) * 100)}%</Text>
          </View>
        )}
      </View>

      {/* Month labels */}
      {monthLabels.length > 0 && (
        <div style={{ display: 'flex', marginLeft: 32, marginBottom: 4, position: 'relative', height: 16 }}>
          {monthLabels.map((label, i) => (
            <span key={i} style={{
              position: 'absolute', left: label.index * 16,
              fontSize: '0.625rem', color: 'var(--rs-color-foreground-neutral-faded)',
            }}>{label.month}</span>
          ))}
        </div>
      )}

      {/* Heatmap grid */}
      <div className="heatmap-wrap">
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Day labels */}
          {dayLabels.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 28 }}>
              {dayLabels.map((label, i) => (
                <div key={i} style={{
                  height: 13, fontSize: '0.6rem', color: 'var(--rs-color-foreground-neutral-faded)',
                  display: 'flex', alignItems: 'center', lineHeight: '13px'
                }}>{label}</div>
              ))}
            </div>
          )}

          {/* Weeks/Days */}
          {view === 'year' ? (
            <div className="heatmap-grid">
              {weeks.map((week, wi) => (
                <div key={wi} className="heatmap-week">
                  {week.map((date, di) => {
                    if (!date) return <div key={di} className="heatmap-cell" style={{ visibility: 'hidden' }} />;
                    const ds = toStr(date);
                    const count = countMap[ds] || 0;
                    const level = getCompletionIntensity(count);
                    const hasNote = noteDates.has(ds);
                    return (
                      <Tooltip key={di} text={getTooltipContent(date)} position="top">
                        <div className={`heatmap-cell heatmap-l${level}`} style={{
                          position: 'relative',
                          ...(hasNote ? { boxShadow: 'inset 0 0 0 1px #f59e0b' } : {}),
                        }} />
                      </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          ) : (
            // Week or Month view - horizontal row
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              {days.map((date) => {
                const ds = toStr(date);
                const count = countMap[ds] || 0;
                const level = getCompletionIntensity(count);
                const isToday = ds === toStr(new Date());
                const hasNote = noteDates.has(ds);
                return (
                  <Tooltip key={ds} text={getTooltipContent(date)} position="top">
                    <div style={{
                      width: view === 'week' ? 56 : 32,
                      height: view === 'week' ? 56 : 32,
                      borderRadius: view === 'week' ? 14 : 8,
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: isToday ? '2px solid #22c55e' : '1px solid transparent',
                      boxShadow: hasNote ? 'inset 0 0 0 1px #f59e0b' : 'none',
                      background: level === 0 ? 'var(--rs-color-background-neutral-faded)' :
                        level === 1 ? '#bbf7d0' : level === 2 ? '#4ade80' : level === 3 ? '#16a34a' : '#166534',
                    }}>
                      <span style={{
                        fontSize: view === 'week' ? '0.65rem' : '0.55rem',
                        fontWeight: 600, color: level >= 3 ? 'white' : 'var(--rs-color-foreground-neutral-faded)',
                        textTransform: 'uppercase',
                      }}>{format(date, 'EEE')}</span>
                      <span style={{
                        fontSize: view === 'week' ? '1.125rem' : '0.75rem',
                        fontWeight: 800, color: level >= 3 ? 'white' : 'var(--rs-color-foreground-neutral-default)',
                      }}>{format(date, 'd')}</span>
                      {count > 0 && (
                        <span style={{
                          fontSize: '0.55rem', fontWeight: 700,
                          color: level >= 3 ? 'rgba(255,255,255,0.8)' : 'var(--rs-color-foreground-neutral-faded)',
                        }}>{count}</span>
                      )}
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Legend */}
      {view === 'year' && (
        <View direction="row" align="center" gap={1} marginTop={3} style={{ justifyContent: 'flex-end' }}>
          <Text variant="caption-2" color="neutral-faded">Less</Text>
          {[0, 1, 2, 3, 4].map(l => (
            <div key={l} className={`heatmap-cell heatmap-l${l}`} style={{ width: 11, height: 11 }} />
          ))}
          <Text variant="caption-2" color="neutral-faded">More</Text>
        </View>
      )}
    </View>
  );
}
