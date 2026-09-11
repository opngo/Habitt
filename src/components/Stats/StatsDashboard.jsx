import React, { useMemo } from 'react';
import { BarChart3, Flame, Trophy, Crown, Medal, Award, Percent, CalendarDays, CheckCircle2, Layers } from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  getToday, toStr, getLast30Days, getLast7Days, getCompletionRate, getCurrentStreak, getLongestStreak,
  getBestDay, formatShort, differenceInCalendarDays, subDays, getDay,
} from '../../lib/utils';
import { ACHIEVEMENTS, CATEGORIES, DAY_NAMES_SHORT } from '../../lib/constants';
import DynIcon from '../Shared/DynIcon';
import YearHeatmap from '../Heatmap/YearHeatmap';

export default function StatsDashboard() {
  const { habits, completions, journalEntries, vacationPeriods, xp, achievements } = useStore();
  const active = habits.filter((h) => !h.archived);
  const today = getToday();

  const rate30 = getCompletionRate(habits, completions, vacationPeriods, getLast30Days());
  const rate7 = getCompletionRate(habits, completions, vacationPeriods, getLast7Days());
  const best = getBestDay(completions);

  // streak leaderboard
  const board = useMemo(() => active
    .map((h) => ({ h, cur: getCurrentStreak(h, completions.filter((c) => c.habit_id === h.id), vacationPeriods), best: getLongestStreak(h, completions.filter((c) => c.habit_id === h.id), vacationPeriods) }))
    .sort((a, b) => b.cur - a.cur || b.best - a.best),
  [active, completions, vacationPeriods]);

  // monthly trend for current year
  const year = new Date().getFullYear();
  const months = useMemo(() => {
    const out = [];
    for (let m = 0; m < 12; m++) {
      const count = completions.filter((c) => { const d = new Date(c.date + 'T12:00:00'); return d.getFullYear() === year && d.getMonth() === m; }).length;
      out.push({ m, count });
    }
    return out;
  }, [completions, year]);
  const maxMonth = Math.max(1, ...months.map((x) => x.count));

  // day-of-week overall
  const dow = useMemo(() => {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    completions.forEach((c) => counts[getDay(new Date(c.date + 'T12:00:00'))]++);
    const max = Math.max(1, ...counts);
    return counts.map((count, i) => ({ i, count, pct: (count / max) * 100 }));
  }, [completions]);

  // category breakdown
  const byCat = useMemo(() => {
    const map = {};
    habits.forEach((h) => { map[h.category] = (map[h.category] || 0) + completions.filter((c) => c.habit_id === h.id).length; });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map).map(([name, n]) => ({ name, n, pct: Math.round((n / total) * 100) })).sort((a, b) => b.n - a.n);
  }, [habits, completions]);

  // mood correlation: avg completion-rate bucketed by mood
  const moodCorr = useMemo(() => {
    if (!journalEntries.length || !habits.length) return null;
    const buckets = { 1: [], 2: [], 3: [], 4: [], 5: [] };
    journalEntries.forEach((j) => {
      const exp = habits.filter((h) => !h.archived);
      const done = exp.filter((h) => completions.some((c) => c.habit_id === h.id && c.date === j.date)).length;
      const m = buckets[j.mood || 3];
      if (m && exp.length) m.push(Math.round((done / exp.length) * 100));
    });
    const stats = [1, 2, 3, 4, 5].map((mood) => {
      const arr = buckets[mood];
      return { mood, n: arr.length, avg: arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null };
    }).filter((x) => x.n > 0);
    return stats.length ? stats : null;
  }, [journalEntries, habits, completions]);

  const unlocked = ACHIEVEMENTS.filter((a) => achievements.includes(a.id));
  const locked = ACHIEVEMENTS.filter((a) => !achievements.includes(a.id));
  const achPct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  return (
    <div>
      <div className="page-head">
        <h2 className="page-title"><BarChart3 size={22} color="var(--blue)" /> Statistics</h2>
        <p className="page-sub">The numbers behind the momentum.</p>
      </div>

      {/* headline */}
      <div className="grid grid-stats stagger" style={{ marginBottom: 18 }}>
        {[
          { i: Percent, l: 'Completion · 30d', v: `${rate30}%`, c: '#22c55e', sub: `7d: ${rate7}%` },
          { i: CheckCircle2, l: 'Total completions', v: completions.length, c: '#3b82f6', sub: `${active.length} active habits` },
          { i: Flame, l: 'Longest streak', v: board.length ? Math.max(...board.map((b) => Math.max(b.cur, b.best))) : 0, c: '#f97316', sub: 'days in a row' },
          { i: CalendarDays, l: 'Best day ever', v: best.date ? best.count : 0, c: '#8b5cf6', sub: best.date ? formatShort(best.date) : '—' },
        ].map((s, i) => (
          <div key={s.l} className="card stat-card" style={{ '--i': i }}>
            <div className="stat-icon" style={{ background: `color-mix(in srgb, ${s.c} 13%, transparent)` }}><s.i size={21} color={s.c} /></div>
            <div>
              <div className="stat-value">{s.v}</div>
              <div className="stat-label">{s.l}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-faint)', marginTop: 2, fontWeight: 600 }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card card-pad" style={{ marginBottom: 18 }}>
        <h3 style={{ margin: '0 0 10px', fontSize: '0.95rem', fontWeight: 800 }}>Consistency heatmap</h3>
        <YearHeatmap />
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {/* Monthly trend */}
        <div className="card card-pad">
          <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800 }}>Monthly trend · {year}</h3>
          <div className="bars">
            {months.map((m) => (
              <div key={m.m} className="bar-col" title={`${m.count} completions`}>
                <div className="bar" style={{ height: `${(m.count / maxMonth) * 100}%`, background: m.count ? 'linear-gradient(180deg, #22c55e, #15803d)' : 'var(--surface-3)' }} />
                <div className="bar-label">{'JFMAMJJASOND'[m.m]}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Day of week */}
        <div className="card card-pad">
          <h3 style={{ margin: '0 0 14px', fontSize: '0.95rem', fontWeight: 800 }}>When you show up</h3>
          <div className="bars" style={{ height: 130 }}>
            {dow.map((d) => (
              <div key={d.i} className="bar-col" title={`${d.count} completions on ${DAY_NAMES_SHORT[d.i]}`}>
                <div className="bar" style={{ height: `${d.pct}%`, background: 'linear-gradient(180deg, #3b82f6, #8b5cf6)', maxWidth: 34, margin: '0 auto' }} />
                <div className="bar-label">{DAY_NAMES_SHORT[d.i].slice(0, 1)}</div>
              </div>
            ))}
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '0.72rem', color: 'var(--text-faint)', fontWeight: 600 }}>
            Strongest day: {dow.length ? DAY_NAMES_SHORT[dow.reduce((a, b) => (b.count > a.count ? b : a)).i] : '—'}
          </p>
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {/* Categories */}
        <div className="card card-pad">
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', gap: 7, alignItems: 'center' }}><Layers size={15} color="var(--cyan)" /> Category breakdown</h3>
          {byCat.length === 0 ? <p style={{ color: 'var(--text-faint)', fontSize: '0.84rem', margin: 0 }}>Create habits to see the split.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
              {byCat.map((c) => {
                const meta = CATEGORIES.find((x) => x.name === c.name);
                return (
                  <div key={c.name}>
                    <div style={{ display: 'flex', fontSize: '0.78rem', fontWeight: 700, marginBottom: 4 }}>
                      <DynIcon name={meta?.icon || 'Zap'} size={12} color={meta?.color} />
                      <span style={{ marginLeft: 6, flex: 1 }}>{c.name}</span>
                      <span style={{ color: 'var(--text-faint)' }}>{c.n} · {c.pct}%</span>
                    </div>
                    <div className="progress-track" style={{ height: 7 }}>
                      <div className="progress-fill" style={{ width: `${c.pct}%`, background: `linear-gradient(90deg, ${meta?.color || '#22c55e'}, color-mix(in srgb, ${meta?.color || '#22c55e'} 55%, #fff))` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Mood correlation */}
        <div className="card card-pad">
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', gap: 7, alignItems: 'center' }}><span style={{ fontSize: 15 }}>😊</span> Mood ↔ habit correlation</h3>
          {!moodCorr ? (
            <p style={{ color: 'var(--text-faint)', fontSize: '0.84rem', margin: 0, lineHeight: 1.5 }}>
              Log moods in the <b>Journal</b> and Habitt will show whether you complete more habits on good days, bad days, or both.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {moodCorr.map((s) => (
                <div key={s.mood} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem' }}>
                  <span style={{ width: 26, textAlign: 'center', fontSize: '1rem' }}>{['😖', '🙁', '😐', '🙂', '😄'][s.mood - 1]}</span>
                  <div className="progress-track" style={{ flex: 1, height: 9 }}>
                    <div className="progress-fill" style={{ width: `${s.avg ?? 0}%`, background: `linear-gradient(90deg, ${['#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e'][s.mood - 1]})` }} />
                  </div>
                  <span style={{ width: 76, textAlign: 'right', color: 'var(--text-muted)', fontWeight: 700 }}>{s.avg}% · {s.n} day{s.n === 1 ? '' : 's'}</span>
                </div>
              ))}
              {moodCorr.length >= 2 && (() => {
                const hi = [...moodCorr].sort((a, b) => (b.avg ?? 0) - (a.avg ?? 0))[0];
                const lo = [...moodCorr].sort((a, b) => (a.avg ?? 0) - (b.avg ?? 0))[0];
                return <p style={{ margin: '6px 0 0', fontSize: '0.76rem', color: 'var(--text-muted)' }}>On <b>{['terrible','bad','okay','good','great'][hi.mood-1]}</b> days you complete <b>{hi.avg - lo.avg >= 0 ? `+${hi.avg - lo.avg}` : 'the same'}</b> pts more than {['terrible','bad','okay','good','great'][lo.mood-1]} days. Keep journaling for a sharper picture.</p>;
              })()}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 18 }}>
        {/* Leaderboard */}
        <div className="card card-pad">
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', gap: 7, alignItems: 'center' }}><Trophy size={15} color="var(--amber)" /> Streak leaderboard</h3>
          {board.length === 0 ? <p style={{ color: 'var(--text-faint)', fontSize: '0.84rem', margin: 0 }}>Add habits to compete with yourself.</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
              {board.map((b, i) => (
                <div key={b.h.id} className="lb-row">
                  <div className="lb-rank" style={i === 0 ? { background: 'linear-gradient(135deg,#fbbf24,#d97706)', color: '#fff' } : i === 1 ? { background: 'var(--surface-3)', color: 'var(--text-muted)' } : i === 2 ? { background: 'color-mix(in srgb,#b45309 18%,transparent)', color: '#b45309' } : { background: 'var(--surface-3)', color: 'var(--text-faint)' }}>
                    {i === 0 ? <Crown size={13} /> : i + 1}
                  </div>
                  <DynIcon name={b.h.icon} size={16} color={b.h.color} />
                  <span style={{ flex: 1, fontWeight: 700, fontSize: '0.84rem' }}>{b.h.name}</span>
                  <span className="chip" style={{ color: b.cur > 0 ? '#f97316' : undefined }}><Flame size={10} /> {b.cur}d now</span>
                  <span className="chip">best {b.best}d</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* XP */}
        <div className="card card-pad" style={{ background: 'linear-gradient(150deg, color-mix(in srgb, var(--violet) 10%, var(--surface)), var(--surface))' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: '0.95rem', fontWeight: 800, display: 'flex', gap: 7, alignItems: 'center' }}><Award size={15} color="var(--violet)" /> Level & XP</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 74, height: 74, borderRadius: '50%', background: 'conic-gradient(#8b5cf6 ' + ((xp % 100) * 3.6) + 'deg, var(--surface-3) 0deg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: 58, height: 58, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                <span style={{ fontWeight: 900, fontSize: '1.15rem' }}>{Math.floor(xp / 100) + 1}</span>
                <span style={{ fontSize: '0.55rem', fontWeight: 800, color: 'var(--text-faint)' }}>LEVEL</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>{xp} XP total</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '3px 0 8px' }}>{100 - (xp % 100)} XP to level {Math.floor(xp / 100) + 2}</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${xp % 100}%`, background: 'linear-gradient(90deg,#8b5cf6,#3b82f6)' }} /></div>
              <div style={{ display: 'flex', gap: 6, marginTop: 10, flexWrap: 'wrap' }}>
                <span className="chip"><Medal size={10} /> {unlocked.length} unlocked</span>
                <span className="chip">{achPct}% complete</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="card card-pad">
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800 }}>Achievements</h3>
          <span className="chip" style={{ marginLeft: 10 }}>{unlocked.length}/{ACHIEVEMENTS.length} · {achPct}%</span>
          <div className="progress-track" style={{ width: 180, marginLeft: 'auto' }}>
            <div className="progress-fill" style={{ width: `${achPct}%`, background: 'linear-gradient(90deg,#f59e0b,#ec4899)' }} />
          </div>
        </div>
        <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
          {[...unlocked, ...locked].map((a, i) => {
            const has = achievements.includes(a.id);
            return (
              <div key={a.id} className={`ach-tile ${has ? '' : 'locked'}`} style={{ '--i': i }} title={a.desc}>
                <div className="ach-icon" style={has ? { background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(236,72,153,0.15))', color: '#f59e0b' } : { background: 'var(--surface-2)', color: 'var(--text-faint)' }}>
                  <DynIcon name={a.icon} size={20} />
                </div>
                <b style={{ fontSize: '0.76rem' }}>{a.name}</b>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-faint)', lineHeight: 1.3 }}>{a.desc}</span>
                {has && <span className="chip" style={{ color: 'var(--accent)', fontSize: '0.58rem', padding: '1px 7px' }}>+50 XP</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
