import React, { useMemo } from 'react';
import { Plus, Zap, BookOpen, LayoutGrid, Flame, CalendarDays, CheckCircle2, Quote, Target, LayoutList } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getToday, greeting, getQuoteOfDay, expectedOnDate, getCurrentStreak, amountOf, getLast7Days, getCompletionRate } from '../../lib/utils';
import { CATEGORIES } from '../../lib/constants';
import HabitCard from './HabitCard';
import Heatmap from '../Heatmap/YearHeatmap';
import DayPlanner from '../Shared/DayPlanner';
import DynIcon from '../Shared/DynIcon';

export default function Dashboard() {
  const { habits, completions, vacationPeriods, setUI, setView, searchQuery, selectedCategory } = useStore();
  const today = getToday();

  const sorted = useMemo(() => [...habits].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0)), [habits]);
  const visible = sorted.filter((h) => {
    if (h.archived) return false;
    if (selectedCategory !== 'All' && h.category !== selectedCategory) return false;
    if (searchQuery && !`${h.name} ${h.description}`.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });
  const scheduledToday = visible.filter((h) => expectedOnDate([h], vacationPeriods, today).length > 0 || h.habit_type === 'avoid');
  const restDayHabits = visible.filter((h) => !scheduledToday.includes(h));

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

  const rate7 = getCompletionRate(habits, completions, vacationPeriods, getLast7Days());
  const cats = ['All', ...new Set(habits.filter((h) => !h.archived).map((h) => h.category))];
  const { setSelectedCategory, setSearchQuery } = useStore.getState();

  if (!habits.length) return <EmptyDashboard />;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 18, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ flex: 1, minWidth: 260 }}>
          <h1 className="page-title" style={{ fontSize: '1.8rem' }}>{greeting()}</h1>
          <p className="page-sub">
            {expected.length === 0 ? 'No habits scheduled for today — enjoy the flexibility.' :
              doneToday === expected.length ? 'Every habit checked off. That is the whole game.' :
                `${doneToday} of ${expected.length} habits done today.`}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => setUI({ quickCheckinMode: true })} title="Quick check-in (Ctrl+Q)"><Zap size={15} color="var(--amber)" /> Quick check-in</button>
          <button className="btn" onClick={() => setView('journal')}><BookOpen size={15} color="var(--violet)" /> Journal</button>
          <button className="btn btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={15} /> New Habit</button>
        </div>
      </div>

      <div className="grid grid-stats stagger" style={{ marginBottom: 18 }}>
        <div className="card stat-card" style={{ '--i': 0 }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', background: `conic-gradient(#22c55e ${pct * 3.6}deg, var(--surface-3) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.78rem' }}>{pct}%</div>
          </div>
          <div><div className="stat-value">{doneToday}<span style={{ color: 'var(--text-faint)', fontSize: '1rem' }}>/{expected.length}</span></div><div className="stat-label">Today</div></div>
        </div>
        <div className="card stat-card" style={{ '--i': 1 }}>
          <div className="stat-icon" style={{ background: 'rgba(249,115,22,0.13)' }}><Flame size={21} color="#f97316" /></div>
          <div><div className="stat-value">{bestStreak}</div><div className="stat-label">Longest active streak</div></div>
        </div>
        <div className="card stat-card" style={{ '--i': 2 }}>
          <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.13)' }}><CheckCircle2 size={21} color="#22c55e" /></div>
          <div><div className="stat-value">{completions.length}</div><div className="stat-label">Total completions</div></div>
        </div>
        <div className="card stat-card" style={{ '--i': 3 }}>
          <div className="stat-icon" style={{ background: 'rgba(139,92,246,0.13)' }}><CalendarDays size={21} color="#8b5cf6" /></div>
          <div><div className="stat-value">{rate7}%</div><div className="stat-label">Consistency · 7 days</div></div>
        </div>
      </div>

      <div className="card quote-card" style={{ marginBottom: 18 }}>
        <Quote size={16} color="var(--violet)" style={{ flexShrink: 0 }} />
        <span>{getQuoteOfDay()}</span>
      </div>

      <div className="dash-split" style={{ marginBottom: 18 }}>
        <div className="card card-pad">
          <h3 className="card-title"><LayoutList size={14} color="var(--accent)" /> Your consistency</h3>
          <Heatmap />
        </div>
        <DayPlanner />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13, flexWrap: 'wrap' }}>
        <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 8 }}>
          <LayoutGrid size={16} color="var(--accent)" /> Today's habits
        </h2>
        <button className="btn btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setView('habits')}><LayoutList size={13} /> All habits <span className="chip">{habits.filter((h) => !h.archived).length}</span></button>
      </div>

      {cats.length > 2 && (
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {cats.map((c) => {
            const cat = CATEGORIES.find((x) => x.name === c);
            return (
              <button key={c} className={`chip chip-btn ${selectedCategory === c ? 'on' : ''}`} onClick={() => setSelectedCategory(selectedCategory === c ? 'All' : c)} style={selectedCategory === c && cat ? { color: cat.color, borderColor: cat.color, background: `color-mix(in srgb, ${cat.color} 10%, transparent)` } : {}}>
                {cat && <DynIcon name={cat.icon} size={11} />}{c}
                <span style={{ opacity: 0.6 }}>{c === 'All' ? habits.filter((h) => !h.archived).length : habits.filter((h) => h.category === c && !h.archived).length}</span>
              </button>
            );
          })}
        </div>
      )}

      {scheduledToday.length === 0 ? (
        <div className="empty">
          <div className="empty-icon" style={{ background: 'var(--accent-soft)' }}><Target size={26} color="var(--accent)" /></div>
          <h3 style={{ margin: 0 }}>Nothing scheduled today</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Your rest day — or add a habit to get rolling.</p>
          <button className="btn btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={14} /> New habit</button>
        </div>
      ) : (
        <div className="grid grid-habits stagger">
          {scheduledToday.map((h, i) => <HabitCard key={h.id} habit={h} />)}
        </div>
      )}

      {restDayHabits.length > 0 && (
        <details className="card card-pad" style={{ marginTop: 14 }}>
          <summary style={{ cursor: 'pointer', fontWeight: 750, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Rest-day habits ({restDayHabits.length}) — scheduled for other days
          </summary>
          <div className="grid grid-habits" style={{ marginTop: 12 }}>
            {restDayHabits.map((h) => <HabitCard key={h.id} habit={h} />)}
          </div>
        </details>
      )}
    </div>
  );
}

function EmptyDashboard() {
  const setUI = useStore((s) => s.setUI);
  const setView = useStore((s) => s.setView);
  const SEEDS = [
    { name: 'Drink Water', icon: 'Droplets', color: '#06b6d4', habit_type: 'amount', target_count: 8, unit: 'glasses', category: 'Health' },
    { name: 'Exercise', icon: 'Activity', color: '#f97316', category: 'Fitness' },
    { name: 'Read', icon: 'BookOpen', color: '#3b82f6', category: 'Learning' },
    { name: 'Meditate', icon: 'Brain', color: '#8b5cf6', category: 'Mindfulness' },
    { name: 'Journal', icon: 'PenLine', color: '#14b8a6', category: 'Self-Care' },
  ];

  const quickStart = () => {
    const s = useStore.getState();
    SEEDS.forEach(({ name, ...rest }) => {
      if (s.habits.some((h) => h.name === name)) return;
      s.addHabit({ name, description: 'Starter habit — edit or delete freely', habit_type: 'normal', category: 'General', icon: 'Sprout', color: '#22c55e', schedule_type: 'daily', ...rest });
    });
    s.addToast({ type: 'success', message: 'Five starter habits added' });
  };

  return (
    <div className="empty" style={{ padding: '56px 22px', minHeight: '60vh', justifyContent: 'center' }}>
      <div className="empty-icon" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.16), rgba(59,130,246,0.12))' }}>
        <Target size={30} color="var(--accent)" />
      </div>
      <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Small habits. Consistent days.</h2>
      <p style={{ margin: '4px 0 18px', color: 'var(--text-muted)', fontSize: '0.92rem', maxWidth: 430, lineHeight: 1.55 }}>
        Create your first habit from scratch, pick from 40 templates, or start with five classics and customize them later.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn btn-primary" onClick={() => setUI({ showCreateModal: true, editingHabit: null })}><Plus size={15} /> Create your first habit</button>
        <button className="btn" onClick={() => setUI({ showTemplates: true })}>Browse templates</button>
        <button className="btn" onClick={quickStart}>Quick start with 5 classics</button>
        <button className="btn" onClick={() => setView('focus')}><Zap size={14} /> Focus timer</button>
      </div>
    </div>
  );
}
