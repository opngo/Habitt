import React, { useMemo, useState } from 'react';
import { BarChart3, Flame, Trophy, Activity, CalendarDays, BookOpen, TrendingUp, PenLine } from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  getToday, subDays, toStr, getCurrentStreak, getCompletionRate, expectedOnDate,
  amountOf, getLast7Days, formatShort,
} from '../../lib/utils';
import { CATEGORIES, DAY_NAMES_SHORT } from '../../lib/constants';
import Heatmap from '../Heatmap/YearHeatmap';
import DynIcon from '../Shared/DynIcon';

const RANGES = [
  { id: 'day', label: 'Day', days: 1 },
  { id: 'week', label: 'Week', days: 7 },
  { id: 'month', label: 'Month', days: 30 },
  { id: 'year', label: 'Year', days: 365 },
];

export default function StatsDashboard() {
  const { habits, completions, journalEntries, vacationPeriods } = useStore();
  const [range, setRange] = useState(RANGES[1]);
  const today = getToday();
  const live = habits.filter((h) => !h.archived);

  const dates = useMemo(() => {
    if (range.id === 'day') return [today];
    return Array.from({ length: range.days }, (_, i) => toStr(subDays(new Date(), range.days - 1 - i)));
  }, [range, today]);

  const perHabit = useMemo(() => live.map((h) => {
    const hc = completions.filter((c) => c.habit_id === h.id);
    const expectedIn = dates.filter((ds) => h.habit_type === 'avoid' || expectedOnDate([h], vacationPeriods, ds).length > 0);
    const doneIn = hc.filter((c) => dates.includes(c.date) && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1)));
    return {
      h,
      done: doneIn.length,
      target: expectedIn.length,
      rate: expectedIn.length ? Math.round((doneIn.length / expectedIn.length) * 100) : 0,
      streak: h.habit_type === 'avoid' ? 0 : getCurrentStreak(h, hc, vacationPeriods),
      best: bestStreakOf(h, hc, vacationPeriods),
    };
  }).sort((a, b) => b.rate - a.rate || b.streak - a.streak), [live, completions, dates, vacationPeriods]);

  const overall = useMemo(() => {
    const expected = dates.reduce((acc, ds) => acc + expectedOnDate(habits, vacationPeriods, ds).length, 0);
    const done = completions.filter((c) => dates.includes(c.date)).length;
    return { expected, done, rate: expected ? Math.round((done / expected) * 100) : 0 };
  }, [habits, completions, dates, vacationPeriods]);

  const byCat = useMemo(() => {
    const map = {};
    live.forEach((h) => {
      map[h.category] = map[h.category] || { color: CATEGORIES.find((c) => c.name === h.name?.category)?.color || h.color, habits: 0, done: 0 };
      map[h.category].habits += 1;
      map[h.category].done += completions.filter((c) => c.habit_id === h.id).length;
    });
    return Object.entries(map).sort((a, b) => b[1].done - a[1].done);
  }, [live, completions]);

  const weekBars = useMemo(() => {
    const days = getLast7Days();
    const max = Math.max(1, ...days.map((ds) => completions.filter((c) => c.date === ds).length));
    return days.map((ds) => ({ ds, n: completions.filter((c) => c.date === ds).length, max }));
  }, [completions]);

  return (
    <div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap', marginBottom: 18 }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <h2 className="page-title"><BarChart3 size={22} color="var(--blue)" /> Statistics</h2>
          <p className="page-sub">Your numbers for the {range.label.toLowerCase()} — nobody grades you but you.</p>
        </div>
        <div style={{ display: 'flex', borderRadius: 11, border: '1px solid var(--border)', overflow: 'hidden' }}>
          {RANGES.map((r) => (
            <button key={r.id} className="seg-btn" style={range.id === r.id ? { background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 800 } : {}} onClick={() => setRange(r)}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-stats stagger" style={{ marginBottom: 18 }}>
        <div className="card stat-card" style={{ '--i': 0 }}>
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.13)' }}><Activity size={21} color="#22c55e" /></div>
          <div>
            <div className="stat-value">{overall.done}<span style={{ color: 'var(--text-faint)', fontSize: '0.95rem' }}>/{overall.expected}</span></div>
            <div className="stat-label">Completions · {range.label.toLowerCase()}</div>
          </div>
        </div>
        <div className="card stat-card" style={{ '--i': 1 }}>
          <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.13)' }}><Flame size={21} color="#f97316" /></div>
          <div>
            <div className="stat-value">{perHabit.reduce((a, x) => Math.max(a, x.streak), 0)}</div>
            <div className="stat-label">Best active streak</div>
          </div>
        </div>
        <div className="card stat-card" style={{ '--i': 2 }}>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.13)' }}><Trophy size={21} color="#8b5cf6" /></div>
          <div>
            <div className="stat-value">{overall.rate}%</div>
            <div className="stat-label">Consistency this {range.label.toLowerCase()}</div>
          </div>
        </div>
        <div className="card stat-card" style={{ '--i': 3 }}>
          <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.13)' }}><BookOpen size={21} color="#3b82f6" /></div>
          <div>
            <div className="stat-value">{journalEntries.length}</div>
            <div className="stat-label">Journal entries</div>
          </div>
        </div>
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <h3 className="card-title"><CalendarDays size={14} color="var(--accent)" /> Heatmap</h3>
        <Heatmap />
      </div>

      <div className="grid-2" style={{ marginBottom: 18 }}>
        <div className="card card-pad">
          <h3 className="card-title"><TrendingUp size={14} color="var(--green, #22c55e)" /> Last 7 days</h3>
          <div className="bar-chart">
            {weekBars.map((b) => (
              <div key={b.ds} className="bar-col">
                <div className="bar-track">
                  <div className="bar-fill" style={{ height: `${(b.n / b.max) * 100}%` }} />
                </div>
                <span className="bar-label">{DAY_NAMES_SHORT[new Date(b.ds + 'T12:00:00').getDay()]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="card card-pad">
          <h3 className="card-title"><BarChart3 size={14} color="var(--violet)" /> By category</h3>
          {byCat.length === 0 && <p className="page-sub">No data yet.</p>}
          {byCat.map(([name, x]) => (
            <div key={name} className="cat-row">
              <span style={{ width: 96, fontWeight: 750, fontSize: '0.82rem' }}>{name}</span>
              <div className="progress-track" style={{ flex: 1 }}>
                <div className="progress-fill" style={{ width: `${Math.min(100, (x.done / Math.max(1, x.habits * 30)) * 100)}%`, background: x.color || 'var(--accent)' }} />
              </div>
              <span className="chip">{x.done}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card card-pad">
        <h3 className="card-title"><Trophy size={14} color="#f59e0b" /> Consistency ranking · {range.label.toLowerCase()}</h3>
        {perHabit.length === 0 && <p className="page-sub">Add habits to see your ranking.</p>}
        {perHabit.map((row, i) => (
          <div key={row.h.id} className="rank-row">
            <span className="rank-n">{i + 1}</span>
            <span className="habit-icon sm" style={{ background: `color-mix(in srgb, ${row.h.color} 14%, transparent)` }}><DynIcon name={row.h.icon} size={14} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <b style={{ fontSize: '0.86rem' }}>{row.h.name}</b>
              <div className="progress-track" style={{ marginTop: 4 }}>
                <div className="progress-fill" style={{ width: `${row.rate}%`, background: `linear-gradient(90deg, ${row.h.color}, color-mix(in srgb, ${row.h.color} 55%, #fff))` }} />
              </div>
            </div>
            <span style={{ fontWeight: 850, fontSize: '0.9rem', fontVariantNumeric: 'tabular-nums' }}>{row.rate}%</span>
            <span className="chip" title="done / expected">{row.done}/{row.target}</span>
            <span className="chip" style={{ color: row.streak > 0 ? '#f97316' : undefined }}><Flame size={9} /> {row.streak}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function bestStreakOf(habit, hc, vacationPeriods) {
  const dates = [...new Set(hc.map((c) => c.date))].sort();
  if (!dates.length) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const gap = Math.round((new Date(dates[i] + 'T12:00:00') - new Date(dates[i - 1] + 'T12:00:00')) / 86400000);
    const skipVac = vacationPeriods.some((v) => v.habit_id === habit.id && dates[i] > v.start_date && dates[i - 1] < (v.end_date || '9999'));
    cur = gap === 1 || skipVac ? cur + 1 : 1;
    best = Math.max(best, cur);
  }
  return best;
}
