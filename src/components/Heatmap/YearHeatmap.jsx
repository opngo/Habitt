import React, { useMemo } from 'react';
import { View, Text, Tooltip } from 'reshaped';
import { getLast365Days, toStr, getWeeksFromDays, getCompletionIntensity, format } from '../../lib/utils';

export default function YearHeatmap({ completions, habits, habitId }) {
  const days = useMemo(() => getLast365Days(), []);
  const weeks = useMemo(() => getWeeksFromDays(days), [days]);

  const countMap = useMemo(() => {
    const map = {};
    const filtered = habitId ? completions.filter(c => c.habit_id === habitId) : completions;
    filtered.forEach(c => { map[c.date] = (map[c.date] || 0) + (c.count || 1); });
    return map;
  }, [completions, habitId]);

  // Month labels
  const monthLabels = useMemo(() => {
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
  }, [days]);

  // Day labels
  const dayLabels = ['', 'Mon', '', 'Wed', '', 'Fri', ''];

  const totalCompletions = Object.values(countMap).reduce((a, b) => a + b, 0);
  const activeDays = Object.keys(countMap).length;

  return (
    <View padding={4} style={{
      background: 'var(--rs-color-background-neutral-default)',
      border: '1px solid var(--rs-color-border-neutral-faded)',
      borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
    }}>
      {/* Stats summary */}
      <View direction="row" gap={6} marginBottom={4} style={{ justifyContent: 'flex-end' }}>
        <View direction="row" gap={1} align="center">
          <Text variant="caption-1" color="neutral-faded">Total:</Text>
          <Text variant="caption-1" weight="bold">{totalCompletions} completions</Text>
        </View>
        <View direction="row" gap={1} align="center">
          <Text variant="caption-1" color="neutral-faded">Active days:</Text>
          <Text variant="caption-1" weight="bold">{activeDays}</Text>
        </View>
      </View>

      {/* Month labels */}
      <div style={{ display: 'flex', marginLeft: 32, marginBottom: 4, position: 'relative', height: 16 }}>
        {monthLabels.map((label, i) => (
          <span key={i} style={{
            position: 'absolute', left: label.index * 16,
            fontSize: '0.625rem', color: 'var(--rs-color-foreground-neutral-faded)',
          }}>
            {label.month}
          </span>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="heatmap-wrap">
        <div style={{ display: 'flex', gap: 4 }}>
          {/* Day labels */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 28 }}>
            {dayLabels.map((label, i) => (
              <div key={i} style={{
                height: 13, fontSize: '0.6rem', color: 'var(--rs-color-foreground-neutral-faded)',
                display: 'flex', alignItems: 'center', lineHeight: '13px'
              }}>
                {label}
              </div>
            ))}
          </div>

          {/* Weeks */}
          <div className="heatmap-grid">
            {weeks.map((week, wi) => (
              <div key={wi} className="heatmap-week">
                {week.map((date, di) => {
                  if (!date) return <div key={di} className="heatmap-cell" style={{ visibility: 'hidden' }} />;
                  const ds = toStr(date);
                  const count = countMap[ds] || 0;
                  const level = getCompletionIntensity(count);
                  return (
                    <Tooltip
                      key={di}
                      text={`${count} completion${count !== 1 ? 's' : ''} on ${format(date, 'MMM d, yyyy')}`}
                      position="top"
                    >
                      <div className={`heatmap-cell heatmap-l${level}`} />
                    </Tooltip>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <View direction="row" align="center" gap={1} marginTop={3} style={{ justifyContent: 'flex-end' }}>
        <Text variant="caption-2" color="neutral-faded">Less</Text>
        {[0, 1, 2, 3, 4].map(l => (
          <div key={l} className={`heatmap-cell heatmap-l${l}`} style={{ width: 11, height: 11 }} />
        ))}
        <Text variant="caption-2" color="neutral-faded">More</Text>
      </View>
    </View>
  );
}
