import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Minus } from 'lucide-react';
import { useStore } from '../../lib/store';
import {
  toStr, getWeeksFromDays, getYearDays, getMonthDays, formatDisplay, getToday,
  subDays, amountOf, getDay, expectedOnDate, isOnVacation, isHabitScheduledOnDate,
} from '../../lib/utils';
import { MONTH_NAMES, DAY_NAMES, DAY_NAMES_SHORT } from '../../lib/constants';
import DynIcon from '../Shared/DynIcon';

/**
 * Heatmap with four ranges — Day / Week / Month / Year.
 * Brightness is relative: dimmer cells = fewer habits done that day,
 * brighter = more. Numeric habits contribute their fraction of the goal.
 */
export default function Heatmap({ habitId = null, onSelectDay, selectedDay, showRange = true }) {
  const { completions, habits, vacationPeriods } = useStore();
  const [range, setRange] = useState('year');
  const [anchor, setAnchor] = useState(() => new Date()); // month/year cursor
  const [tip, setTip] = useState(null);
  const today = getToday();

  // weighted value per date (fraction for amount habits, 1 for normal)
  const byDate = useMemo(() => {
    const map = {};
    const targetOf = {};
    habits.forEach((h) => { targetOf[h.id] = h.habit_type === 'amount' ? (h.target_count || 1) : 1; });
    completions.forEach((c) => {
      const h = habits.find((x) => x.id === c.habit_id);
      if (!h) return;
      if (habitId && h.id !== habitId) return;
      const val = h.habit_type === 'amount' ? Math.min(1.25, amountOf(c) / (targetOf[h.id] || 1)) : 1;
      map[c.date] = (map[c.date] || 0) + val;
    });
    return map;
  }, [completions, habits, habitId]);

  const datesIn = useMemo(() => {
    if (range === 'day') return Array.from({ length: 14 }, (_, i) => toStr(subDays(new Date(), 13 - i)));
    if (range === 'week') return Array.from({ length: 7 }, (_, i) => { const d = new Date(anchor); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - 6 + i); return toStr(d); });
    if (range === 'month') { const y = anchor.getFullYear(); const m = anchor.getMonth(); return getMonthDays(y, m).map(toStr); }
    return getYearDays(anchor.getFullYear()).map(toStr);
  }, [range, anchor]);

  const maxVal = useMemo(() => Math.max(1, ...datesIn.map((d) => byDate[d] || 0)), [datesIn, byDate]);
  const level = (v) => (!v ? 0 : Math.max(1, Math.min(4, Math.round((v / maxVal) * 4))));

  const shift = (dir) => {
    const d = new Date(anchor);
    if (range === 'day') { d.setDate(d.getDate() + dir * 14); }
    if (range === 'week') { d.setDate(d.getDate() + dir * 7); }
    if (range === 'month') d.setMonth(d.getMonth() + dir);
    if (range === 'year') d.setFullYear(d.getFullYear() + dir);
    setAnchor(d);
  };

  const click = (ds) => { if (ds <= today) onSelectDay?.(ds === selectedDay ? null : ds); };
  const showTip = (e, ds) => {
    const r = e.currentTarget.getBoundingClientRect();
    const v = byDate[ds] || 0;
    setTip({ x: r.left + r.width / 2, y: r.top - 8, text: `${formatDisplay(ds)} — ${v ? `${Math.round(v * 10) / 10}${habitId ? ' units' : ' habits'} done` : 'nothing logged'}` });
  };

  const rangeLabel =
    range === 'day' ? 'Last 14 days' :
    range === 'week' ? `Week of ${datesIn[0] && datesIn[0].slice(5)}` :
    range === 'month' ? `${MONTH_NAMES[anchor.getMonth()]} ${anchor.getFullYear()}` :
    String(anchor.getFullYear());

  const total = datesIn.reduce((a, d) => a + (byDate[d] ? 1 : 0), 0);

  return (
    <div>
      {showRange && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            {['day', 'week', 'month', 'year'].map((r) => (
              <button key={r} className="seg-btn" style={range === r ? { background: 'var(--accent-soft)', color: 'var(--accent)', fontWeight: 800 } : {}} onClick={() => setRange(r)}>
                {r[0].toUpperCase() + r.slice(1)}
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            <button className="btn btn-icon btn-sm" onClick={() => shift(-1)}><ChevronLeft size={14} /></button>
            <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: 130, textAlign: 'center' }}>{rangeLabel}</span>
            <button className="btn btn-icon btn-sm" disabled={toStr(anchor) > today} onClick={() => shift(1)}><ChevronRight size={14} /></button>
            <span className="chip" style={{ marginLeft: 6 }}>{total} active days</span>
          </div>
        </div>
      )}

      {range === 'year' ? (
        <div className="heat-scroll">
          <div className="heat-wrap">
            {(() => {
              const weeks = getWeeksFromDays(getYearDays(anchor.getFullYear()));
              const labels = labelsFor(weeks);
              return (
                <>
                  <div style={{ display: 'flex', gap: 3, marginLeft: 34 }}>
                    {labels.map((l, i) => <div key={i} className="heat-month" style={{ width: 13 }}>{l}</div>)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 17 }}>
                      {DAY_NAMES.map((d, i) => <div key={i} style={{ height: 13, fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', width: 28, textAlign: 'right' }}>{i % 2 ? d : ''}</div>)}
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {weeks.map((w, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                          {w.map((d, i) => d ? (
                            <div key={toStr(d)} className={`heat-cell l${level(byDate[toStr(d)] || 0)}${toStr(d) === today ? ' today' : ''}${toStr(d) > today ? ' future' : ''}`}
                              onMouseEnter={(e) => showTip(e, toStr(d))} onMouseLeave={() => setTip(null)} onClick={() => click(toStr(d))} />
                          ) : <div key={`e${wi}${i}`} className="heat-cell" style={{ visibility: 'hidden' }} />)}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      ) : range === 'day' || range === 'week' ? (
        <div className="strip-row">
          {datesIn.map((ds) => {
            const v = byDate[ds] || 0;
            const d = new Date(ds + 'T12:00:00');
            return (
              <button key={ds} className={`strip-cell l${level(v)} ${ds === selectedDay ? 'sel' : ''} ${ds > today ? 'future' : ''}`}
                onClick={() => click(ds)} onMouseEnter={(e) => showTip(e, ds)} onMouseLeave={() => setTip(null)}
                style={{ flex: 1, '--selc': 'var(--accent)' }}>
                <span className="strip-dow">{DAY_NAMES_SHORT[getDay(d)].slice(0, 2)}</span>
                <span className="strip-num">{d.getDate()}</span>
                <span className="strip-val">{v ? (Math.round(v * 10) / 10) : ''}</span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="month-grid">
          {Array.from({ length: getDay(getMonthDays(anchor.getFullYear(), anchor.getMonth())[0]) }).map((_, i) => <div key={`x${i}`} />)}
          {datesIn.map((ds) => {
            const v = byDate[ds] || 0;
            return (
              <button key={ds} className={`month-cell l${level(v)} ${ds === today ? 'today' : ''} ${ds === selectedDay ? 'sel' : ''}`}
                onClick={() => click(ds)} onMouseEnter={(e) => showTip(e, ds)} onMouseLeave={() => setTip(null)}>
                <b>{Number(ds.slice(8))}</b>
                {v > 0 && <span className="month-cell-count">{Math.round(v * 10) / 10}</span>}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10, gap: 12 }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 600, marginRight: 'auto' }}>
          {onSelectDay ? 'Click a day to see its to-dos and note' : ''}
        </span>
        <div className="heat-legend">dimmer <div className="heat-cell" /> <div className="heat-cell l1" /> <div className="heat-cell l2" /> <div className="heat-cell l3" /> <div className="heat-cell l4" /> brighter</div>
      </div>

      {tip && <div className="tooltip" style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, -100%)' }}>{tip.text}</div>}
    </div>
  );
}

function labelsFor(weeks) {
  let lastShown = -9;
  return weeks.map((w) => {
    const firstReal = w.find(Boolean);
    if (!firstReal) return '';
    const m = firstReal.getMonth();
    if (firstReal.getDate() > 7 || m === lastShown) return '';
    lastShown = m;
    return MONTH_NAMES[m].slice(0, 3);
  });
}
