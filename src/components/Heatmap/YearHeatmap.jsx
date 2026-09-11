import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../lib/store';
import { toStr, getWeeksFromDays, getCompletionIntensity, getYearDays, getMonthDays, formatDisplay, getToday } from '../../lib/utils';
import { MONTH_NAMES, DAY_NAMES } from '../../lib/constants';

export default function YearHeatmap({ habitId = null, compact = false }) {
  const { completions, habits, heatmapYear, setUI } = useStore();
  const [view, setView] = useState('year');
  const [month, setMonth] = useState(new Date().getMonth());
  const [tip, setTip] = useState(null);

  const year = habitId ? new Date().getFullYear() : heatmapYear;
  const nowYear = new Date().getFullYear();

  const byDate = useMemo(() => {
    const map = {};
    completions.forEach((c) => {
      if (habitId && c.habit_id !== habitId) return;
      // avoid habits log slips — don't paint them as "done"
      const h = habits.find((x) => x.id === c.habit_id);
      if (h?.habit_type === 'avoid') return;
      map[c.date] = (map[c.date] || 0) + 1;
    });
    return map;
  }, [completions, habitId, habits]);

  const showTip = (e, ds, count) => {
    const r = e.currentTarget.getBoundingClientRect();
    setTip({ x: r.left + r.width / 2, y: r.top - 8, text: count ? `${count} ${count === 1 ? 'completion' : 'completions'} · ${formatDisplay(ds)}` : `No completions · ${formatDisplay(ds)}` });
  };

  const clickDay = (ds) => {
    if (ds > getToday()) return;
    setUI({ showDayNoteModal: true, dayNoteDate: ds });
  };

  const total = useMemo(() => Object.entries(byDate).filter(([d]) => habitId || getYearOf(d) === year).reduce((a, [, v]) => a + v, 0), [byDate, year, habitId]);

  const cell = (d, i) => {
    if (!d) return <div key={`e${i}`} className="heat-cell" style={{ visibility: 'hidden' }} />;
    const ds = toStr(d);
    const count = byDate[ds] || 0;
    const future = ds > getToday();
    const cls = `heat-cell l${getCompletionIntensity(count)}${ds === getToday() ? ' today' : ''}${future ? ' future' : ''}${!habitId && d.getFullYear() !== year ? ' other-year' : ''}`;
    return (
      <div
        key={ds}
        className={cls}
        onMouseEnter={(e) => !future && showTip(e, ds, count)}
        onMouseLeave={() => setTip(null)}
        onClick={() => clickDay(ds)}
      />
    );
  };

  const years = [];
  const earliest = useMemo(() => {
    let min = nowYear;
    completions.forEach((c) => { const y = getYearOf(c.date); if (y < min) min = y; });
    habits.forEach((h) => { const y = new Date(h.created_at).getFullYear(); if (y < min) min = y; });
    return min;
  }, [completions, habits, nowYear]);
  for (let y = nowYear; y >= earliest; y--) years.push(y);

  return (
    <div>
      {!compact && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', borderRadius: 10, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <button className="btn btn-sm" style={{ border: 0, borderRadius: 0, background: view === 'year' ? 'var(--accent-soft)' : 'transparent', fontWeight: 700 }} onClick={() => setView('year')}>Year</button>
            <button className="btn btn-sm" style={{ border: 0, borderLeft: '1px solid var(--border)', borderRadius: 0, background: view === 'month' ? 'var(--accent-soft)' : 'transparent', fontWeight: 700 }} onClick={() => setView('month')}>Month</button>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
            {view === 'month' ? (
              <>
                <button className="btn btn-icon btn-sm" onClick={() => { if (month === 0) { setMonth(11); } else setMonth((m) => m - 1); }}><ChevronLeft size={14} /></button>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: 110, textAlign: 'center' }}>{MONTH_NAMES[month]} {year}</span>
                <button className="btn btn-icon btn-sm" onClick={() => { if (month === 11) { setMonth(0); } else setMonth((m) => m + 1); }}><ChevronRight size={14} /></button>
              </>
            ) : (
              <>
                <button className="btn btn-icon btn-sm" disabled={year <= earliest} onClick={() => setUI({ heatmapYear: year - 1 })}><ChevronLeft size={14} /></button>
                <span style={{ fontWeight: 800, fontSize: '0.85rem', minWidth: 60, textAlign: 'center' }}>{year}</span>
                <button className="btn btn-icon btn-sm" disabled={year >= nowYear} onClick={() => setUI({ heatmapYear: year + 1 })}><ChevronRight size={14} /></button>
              </>
            )}
            <span className="chip" style={{ marginLeft: 8 }}>{total} total</span>
          </div>
        </div>
      )}

      <div className="heat-scroll">
        {view === 'year' || compact ? (
          <div className="heat-wrap">
            {(() => {
              const weeks = getWeeksFromDays(getYearDays(year));
              // month label per column: first week whose leading day starts a new month
              const colLabels = weeks.map((w) => {
                const firstReal = w.find(Boolean);
                if (!firstReal) return null;
                const m = firstReal.getMonth();
                const day = firstReal.getDate();
                return day <= 7 ? MONTH_NAMES[m].slice(0, 3) : null;
              });
              let lastShown = -1;
              const labels = colLabels.map((l, i) => {
                if (!l) return '';
                if (i - lastShown < 4) return '';
                lastShown = i;
                return l;
              });
              return (
                <>
                  <div style={{ display: 'flex', gap: 3, marginLeft: 36 }}>
                    {labels.map((l, i) => <div key={i} className="heat-month" style={{ width: 13 }}>{l}</div>)}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, paddingTop: 17, justifyContent: 'flex-start' }}>
                      {DAY_NAMES.map((d, i) => <div key={i} style={{ height: 13, fontSize: '0.58rem', fontWeight: 700, color: 'var(--text-faint)', width: 30, textAlign: 'right' }}>{i % 2 ? d : ''}</div>)}
                    </div>
                    <div style={{ display: 'flex', gap: 3 }}>
                      {weeks.map((w, wi) => (
                        <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{w.map((d, i) => cell(d, wi * 7 + i))}</div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        ) : (
          <div className="heat-wrap">
            <div style={{ display: 'flex', gap: 3 }}>
              {getWeeksFromDays(getMonthDays(year, month)).map((w, wi) => (
                <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>{w.map((d, di) => d ? <div key={toStr(d)} style={{ width: 16, height: 16, borderRadius: 5, fontSize: '0.55rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', background: byDate[toStr(d)] ? 'var(--accent)' : 'var(--surface-3)', color: byDate[toStr(d)] ? '#fff' : 'var(--text-faint)', cursor: toStr(d) <= getToday() ? 'pointer' : 'default' }} onClick={() => clickDay(toStr(d))}>{d.getDate()}</div> : <div key={`e${wi}-${di}`} style={{ visibility: 'hidden', width: 16, height: 16 }} />)}</div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginTop: 10, gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 600, marginRight: 'auto' }}>Click any day to add a note</span>
        <div className="heat-legend">Less <div className="heat-cell" /> <div className="heat-cell l1" /> <div className="heat-cell l2" /> <div className="heat-cell l3" /> <div className="heat-cell l4" /> More</div>
      </div>

      {tip && <div className="tooltip" style={{ left: tip.x, top: tip.y, transform: 'translate(-50%, -100%)' }}>{tip.text}</div>}
    </div>
  );
}

function getYearOf(ds) { return Number(ds.slice(0, 4)); }

function monthLabels(year) {
  const labels = [];
  for (let m = 0; m < 12; m++) {
    const days = getMonthDays(year, m);
    const firstIdx = Math.floor(days[0].getTime()) ;
    labels.push({ label: MONTH_NAMES[m][0], span: Math.ceil(days.length / 7) });
  }
  return labels.filter((l) => l.label);
}
