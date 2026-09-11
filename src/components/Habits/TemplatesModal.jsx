import React, { useMemo, useState } from 'react';
import { Plus, Check, Search } from 'lucide-react';
import { useStore } from '../../lib/store';
import { HABIT_TEMPLATES, CATEGORIES } from '../../lib/constants';
import Modal from '../Shared/Modal';
import DynIcon from '../Shared/DynIcon';

export default function TemplatesModal() {
  const { habits, addHabit, setUI, addToast } = useStore();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = useMemo(() => HABIT_TEMPLATES.filter((t) => {
    if (cat !== 'All' && t.category !== cat) return false;
    if (q && !`${t.name} ${t.description}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  }), [q, cat]);

  const add = (t) => {
    if (habits.some((h) => h.name.toLowerCase() === t.name.toLowerCase())) {
      addToast({ type: 'error', message: `You already have “${t.name}”` });
      return;
    }
    if (t.type === 'checklist') {
      addHabit({ name: t.name, description: t.description, habit_type: 'normal', category: t.category, icon: t.icon, checklist: t.steps, schedule_type: 'daily', difficulty: 'medium', target_count: 1, unit: '' });
    } else {
      addHabit({
        name: t.name, description: t.description, habit_type: t.type, category: t.category, icon: t.icon,
        schedule_type: 'daily', difficulty: 'medium',
        target_count: t.target || 1, unit: t.unit || '', checklist: [],
      });
    }
  };

  const cats = ['All', ...new Set(HABIT_TEMPLATES.map((t) => t.category))];

  return (
    <Modal
      title="Habit templates" wide
      onClose={() => setUI({ showTemplates: false })}
      footer={<button className="btn" onClick={() => setUI({ showTemplates: false, showCreateModal: true, editingHabit: null })}>Or create from scratch →</button>}
    >
      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: -4 }}>
        {HABIT_TEMPLATES.length} ready-made habits. One click adds it to your dashboard — edit anything afterwards.
      </p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 180 }}>
          <Search size={14} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input className="input" style={{ paddingLeft: 32 }} placeholder="Search templates…" autoFocus value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {cats.map((c) => <button key={c} className={`chip chip-btn ${cat === c ? 'on' : ''}`} onClick={() => setCat(c)}>{c}</button>)}
        </div>
      </div>
      <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 10, maxHeight: '46vh', overflowY: 'auto', paddingRight: 4 }}>
        {filtered.map((t, i) => {
          const has = habits.some((h) => h.name.toLowerCase() === t.name.toLowerCase());
          const meta = CATEGORIES.find((c) => c.name === t.category);
          return (
            <div key={t.name} className="card tpl-card" style={{ '--tp': meta?.color, '--i': i, opacity: has ? 0.55 : 1 }} onClick={() => !has && add(t)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <DynIcon name={t.icon} size={19} color={meta?.color} />
                <span style={{ fontWeight: 750, fontSize: '0.88rem', flex: 1 }}>{t.name}</span>
                {has ? <Check size={15} color="var(--accent)" /> : <Plus size={15} color="var(--text-faint)" />}
              </div>
              <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.45 }}>{t.description}</p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                <span className="chip">{t.category}</span>
                {t.type !== 'normal' && <span className="chip" style={{ color: meta?.color }}>{t.type === 'avoid' ? 'avoid' : t.type === 'checklist' ? `${t.steps?.length} steps` : `${t.target} ${t.unit}`}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}
