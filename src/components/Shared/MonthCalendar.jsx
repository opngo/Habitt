import React, { useMemo } from 'react';
import { View, Text } from 'reshaped';
import { ChevronLeft, ChevronRight, StickyNote, Check, AlertTriangle } from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  startOfMonth, endOfMonth, eachDayOfInterval, format, getDay, toStr,
  isToday, addMonths, subMonths, toDate, isHabitScheduledOnDate
} from '../../lib/utils';
import DynIcon from './DynIcon';

export default function MonthCalendar({ year, month, onDayClick, onDayNote }) {
  const { completions, habits, dayNotes, vacationPeriods } = useStore();
  const activeHabits = habits.filter(h => !h.archived);
  const todayStr = toStr(new Date());

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = getDay(monthStart);

  // Build completion map
  const completionMap = useMemo(() => {
    const map = {};
    const monthDates = new Set(days.map(d => toStr(d)));
    completions.filter(c => monthDates.has(c.date)).forEach(c => {
      if (!map[c.date]) map[c.date] = new Set();
      map[c.date].add(c.habit_id);
    });
    return map;
  }, [completions, days]);

  const noteMap = useMemo(() => {
    const map = {};
    dayNotes.forEach(n => { map[n.date] = n.content; });
    return map;
  }, [dayNotes]);

  return (
    <View style={{
      background: 'var(--rs-color-background-neutral-default)',
      border: '1px solid var(--rs-color-border-neutral-faded)',
      borderRadius: 16, overflow: 'hidden',
    }}>
      {/* Header */}
      <View direction="row" align="center" padding={4} style={{
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--rs-color-border-neutral-faded)',
      }}>
        <button onClick={() => onDayClick?.({ type: 'prev' })} style={{
          width: 32, height: 32, borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)',
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><ChevronLeft size={16} /></button>
        <Text variant="title-3" weight="bold">{format(monthStart, 'MMMM yyyy')}</Text>
        <button onClick={() => onDayClick?.({ type: 'next' })} style={{
          width: 32, height: 32, borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)',
          background: 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}><ChevronRight size={16} /></button>
      </View>

      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 1, padding: '8px 12px 0' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'var(--rs-color-foreground-neutral-faded)', padding: '4px 0', textTransform: 'uppercase' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 3, padding: '4px 12px 12px' }}>
        {/* Empty cells for alignment */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} style={{ aspectRatio: '1' }} />
        ))}

        {/* Day cells */}
        {days.map((date) => {
          const ds = toStr(date);
          const isTodayDay = ds === todayStr;
          const completedHabits = completionMap[ds] || new Set();
          const completedCount = completedHabits.size;
          const totalActive = activeHabits.length;
          const allDone = totalActive > 0 && completedCount >= totalActive;
          const someDone = completedCount > 0;
          const hasNote = !!noteMap[ds];

          return (
            <button
              key={ds}
              onClick={() => onDayClick?.({ date: ds })}
              onContextMenu={(e) => { e.preventDefault(); onDayNote?.(ds); }}
              style={{
                aspectRatio: '1', borderRadius: 12, border: isTodayDay ? '2px solid #22c55e' : '1px solid transparent',
                background: allDone ? 'rgba(34,197,94,0.12)' : someDone ? 'var(--rs-color-background-neutral-faded)' : 'transparent',
                cursor: 'pointer', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 2,
                transition: 'all 0.15s', position: 'relative',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = allDone ? 'rgba(34,197,94,0.18)' : 'var(--rs-color-background-neutral-faded)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = allDone ? 'rgba(34,197,94,0.12)' : someDone ? 'var(--rs-color-background-neutral-faded)' : 'transparent'; }}
            >
              <span style={{
                fontSize: '0.8125rem', fontWeight: isTodayDay ? 800 : 500,
                color: isTodayDay ? '#22c55e' : 'var(--rs-color-foreground-neutral-default)',
              }}>
                {format(date, 'd')}
              </span>

              {/* Completion dots */}
              {someDone && (
                <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: '80%' }}>
                  {Array.from(completedHabits).slice(0, 4).map(hId => {
                    const h = activeHabits.find(ha => ha.id === hId);
                    return h ? (
                      <div key={hId} style={{
                        width: 5, height: 5, borderRadius: 99,
                        background: h.color,
                      }} />
                    ) : null;
                  })}
                  {completedCount > 4 && (
                    <span style={{ fontSize: '0.5rem', color: 'var(--rs-color-foreground-neutral-faded)' }}>+{completedCount - 4}</span>
                  )}
                </div>
              )}

              {/* All done checkmark */}
              {allDone && (
                <Check size={10} color="#22c55e" style={{ position: 'absolute', top: 3, right: 3 }} />
              )}

              {/* Note indicator */}
              {hasNote && (
                <div style={{ position: 'absolute', bottom: 2, right: 3 }}>
                  <StickyNote size={8} color="#f59e0b" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </View>
  );
}
