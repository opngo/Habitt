import React, { useMemo, useState } from 'react';
import { Plus, LayoutGrid, Zap, StickyNote, Flame, Target, CheckCircle2, Quote, Search, BookOpen } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, greeting, getQuoteOfDay, expectedOnDate, getCurrentStreak, amountOf } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import HabitCard from './HabitCard';
import YearHeatmap from '../Heatmap/YearHeatmap';
import DynIcon from '../Shared/DynIcon';

export default function Dashboard() {
  const { habits, completions, vacationPeriods, setUI, setView, searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, xp } = useStore();
  const today = getToday();

  const sorted = useMemo(() => [...habits].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [habits]);
  const visible = sorted.filter((h) => {
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    if (searchQuery && !`${h.name} ${h.description} ${(h.tags || []).join(' ')}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const activeToday = visible.filter((h) => !h.archived);

  const expected = expectedOnDate(habits, vacationPeriods, today);
  const doneToday = expected.filter((h) =>
    completions.some((c) => c.habit_id === h.id && c.date === today && (h.habit_type !== 'amount' || amountOf(c) >= (h.target_count || 1)))
  ).length;
  const pct = expected.length ? Math.round((doneToday / expected.length) * 100) : 0;

  const bestStreak = useMemo(() => {
    let b = 0;
    habits.filter((h) => !h.archived && h.habit_type !== 'avoid').forEach((h) => {
      b = Math.max(b, getCurrentStreak(h, completions.filter((c) => c.habit_id === h.id), vacationPeriods));
    });
    return b;
  }, [habits, completions, vacationPeriods]);

  const cats = ['All', ...new Set(habits.map((h) => h.category))];

  return (
    <div>
      {/* Hero */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap', marginBottom: 22 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 className="page-title" style={{ fontSize: '1.9rem' }}>{greeting()} 👋</h1>
          <p className="page-sub">
            {expected.length === 0 ? 'No habits scheduled for today — enjoy the flexibility!' : doneToday === expected.length ? 'Every habit checked off. What a day. 🏆' : `${doneToday} of ${expected.length} habits done today.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setUI({ quickCheckinMode: true })} title="Quick check-in (Ctrl+Q)"><Zap size={15} color="var(--amber)" /> Quick check-in</button>
          <button className="btn" onClick={() => setUI({ showDayNoteModal: true, dayNoteDate: today })}><StickyNote size={15} color="var(--blue)" /> Day note</button>
          <button className="btn" onClick={() => setView('journal')}><BookOpen size={15} color="var(--violet)" /> Journal</button>
          <button className="btn btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={15} /> New Habit</button>
        </div>
      </div>

      {/* Stat row */}
      <div className="grid grid-stats stagger" style={{ marginBottom: 20 }}>
        <div className="card stat-card" style={{ '--i': 0 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `conic-gradient(#22c55e ${pct * 3.6}deg, var(--surface-3) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>{pct}%</div>
          </div>
          <div><div className="stat-value">{doneToday}<span style={{ color: 'var(--text-faint)', fontSize: '1rem' }}>/{expected.length}</span></div><div className="stat-label">Today</div></div>
        </div>
        <div className="card stat-card" style={{ '--i': 1 }}>
          <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.13)' }}><Flame size={22} color="#f97316" /></div>
          <div><div className="stat-value">{bestStreak}</div><div className="stat-label">Best active streak</div></div>
        </div>
        <div className="card stat-card" style={{ '--i': 2 }}>
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.13)' }}><CheckCircle2 size={22} color="#22c55e" /></div>
          <div><div className="stat-value">{completions.length}</div><div className="stat-label">Total completions</div></div>
        </div>
        <div className="card stat-card" style={{ '--i': 3 }}>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.13)' }}><Target size={22} color="#8b5cf6" /></div>
          <div><div className="stat-value">{Math.floor(xp / 100) + 1}</div><div className="stat-label">Level · {xp} XP</div></div>
        </div>
      </div>

      {/* Quote */}
      <div className="card" style={{ marginBottom: 20, padding: '14px 18px', display: 'flex', gap: 12, alignItems: 'center', background: 'linear-gradient(135deg, color-mix(in srgb, var(--violet) 8%, var(--surface)), color-mix(in srgb, var(--blue) 6%, var(--surface)))' }}>
        <Quote size={18} color="var(--violet)" style={{ flexShrink: 0 }} />
        <span style={{ fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 550 }}>{getQuoteOfDay()}</span>
      </div>

      {/* Heatmap */}
      <div className="card card-pad" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, letterSpacing: '-0.01em' }}>Your year in one grid</h3>
          <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setView('stats')}>Full statistics →</button>
        </div>
        <YearHeatmap />
      </div>

      {/* Habits */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LayoutGrid size={17} color="var(--accent)" /> My habits
        </h2>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setUI({ showTemplates: true })}><Plus size={13} /> Templates</button>
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input className="input" style={{ width: 190, padding: '8px 10px 8px 30px', fontSize: '0.82rem' }} placeholder="Search habits…" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      </div>

      {cats.length > 2 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 16 }}>
          {cats.map((c) => {
            const cat = CATEGORIES.find((x) => x.name === c);
            return (
              <button key={c} className={`chip chip-btn ${selectedCategory === c ? 'on' : ''}`} onClick={() => setSelectedCategory(c)} style={selectedCategory === c && cat ? { color: cat.color, borderColor: cat.color, background: `color-mix(in srgb, ${cat.color} 10%, transparent)` } : {}}>
                {cat && <DynIcon name={cat.icon} size={11} />}{c}
                <span style={{ opacity: 0.6 }}>{c === 'All' ? activeToday.length : habits.filter((h) => h.category === c && !h.archived).length}</span>
              </button>
            );
          })}
        </div>
      )}

      {habits.length === 0 ? (
        <EmptyDashboard />
      ) : visible.length === 0 ? (
        <div className="empty"><p style={{ fontWeight: 700 }}>No habits match your filters</p><button className="btn btn-sm" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>Clear filters</button></div>
      ) : (
        <div className="grid grid-habits stagger">
          {visible.map((h, i) => <div key={h.id} style={{ display: 'flex', '--i': i }}><div style={{ display: 'flex', width: '100%' }}><HabitCard habit={h} /></div></div>)}
        </div>
      )}
    </div>
  );
}

function EmptyDashboard() {
  const setUI = useStore((s) => s.setUI);
  const [seedBusy, setSeedBusy] = useState(false);
  const SEEDS = ['Drink Water', 'Exercise', 'Read', 'Meditate', 'Journal'];

  const quickStart = () => {
    setSeedBusy(true);
    const s = useStore.getState();
    SEEDS.forEach((name) => {
      if (s.habits.some((h) => h.name === name)) return;
      s.addHabit({ name, description: 'Starter habit — edit or delete freely', habit_type: 'normal', category: 'General', icon: 'Sprout', color: '#22c55e', schedule_type: 'daily', difficulty: 'easy' });
    });
    s.addToast({ type: 'success', message: '5 starter habits added. Make them yours!' });
    setTimeout(() => setSeedBusy(false), 400);
  };

  return (
    <div className="empty" style={{ padding: '56px 22px' }}>
      <div className="empty-icon" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(59,130,246,0.12))' }}>
        <Target size={30} color="var(--accent)" />
      </div>
      <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800 }}>No habits yet — let's change that</h3>
      <p style={{ margin: '2px 0 14px', color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: 420 }}>
        Create a habit from scratch, pick one of 40 templates, or start with five classic ones and customize later.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={15} /> Create your first habit</button>
        <button className="btn" onClick={() => setUI({ showTemplates: true })}>Browse templates</button>
        <button className="btn" onClick={quickStart} disabled={seedBusy}>{seedBusy ? 'Adding…' : 'Quick start with 5 classics'}</button>
      </div>
    </div>
  );
}
