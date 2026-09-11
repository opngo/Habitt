import React, { useState } from 'react';
import { Plus, X, Grip } from 'lucide-react';
import { useStore } from '../../lib/store';
import { CATEGORIES, COLORS, HABIT_TYPES, SCHEDULE_TYPES, DIFFICULTIES, DAY_NAMES_SHORT } from '../../lib/constants';
import IconPicker from '../Shared/IconPicker';
import ColorPicker from '../Shared/ColorPicker';
import Modal from '../Shared/Modal';
import DynIcon from '../Shared/DynIcon';

export default function CreateHabitModal() {
  const { editingHabit, addHabit, updateHabit, setUI, addToast } = useStore();
  const editing = !!editingHabit;
  const h = editingHabit || {};

  const [f, setF] = useState({
    name: h.name || '',
    description: h.description || '',
    icon: h.icon || 'Zap',
    color: h.color || COLORS[0],
    category: h.category || 'General',
    habit_type: h.habit_type || 'normal',
    schedule_type: h.schedule_type || h.frequency || 'daily',
    schedule_value: h.schedule_value || (h.schedule_type === 'x_per_month' ? 10 : 3),
    custom_days: (h.custom_days || '').split(',').filter(Boolean).map(Number),
    target_count: h.target_count || 8,
    unit: h.unit || '',
    difficulty: h.difficulty || 'medium',
    checklist: h.checklist || [],
    tags: h.tags || [],
  });
  const [newStep, setNewStep] = useState('');
  const [newTag, setNewTag] = useState('');
  const [showIcon, setShowIcon] = useState(false);

  const set = (patch) => setF((x) => ({ ...x, ...patch }));

  const save = () => {
    if (!f.name.trim()) { addToast({ type: 'error', message: 'Give your habit a name first' }); return; }
    const payload = {
      ...f,
      name: f.name.trim(),
      custom_days: Array.isArray(f.custom_days) ? f.custom_days.join(',') : f.custom_days,
      schedule_value: f.schedule_type === 'x_per_week' || f.schedule_type === 'x_per_month' || f.schedule_type === 'every_n_days' ? Number(f.schedule_value) || 1 : 0,
    };
    if (editing) updateHabit(h.id, payload);
    else addHabit(payload);
    setUI({ showCreateModal: false, editingHabit: null });
  };

  const toggleDay = (d) => {
    const cur = new Set(f.custom_days);
    if (cur.has(d)) cur.delete(d); else cur.add(d);
    set({ custom_days: [...cur].sort() });
  };

  return (
    <Modal
      title={editing ? `Edit “${h.name}”` : 'New habit'}
      icon={<div className="habit-icon" style={{ '--hc': f.color }}><DynIcon name={f.icon} size={19} /></div>}
      onClose={() => setUI({ showCreateModal: false, editingHabit: null })}
      footer={<>
        <button className="btn" onClick={() => setUI({ showCreateModal: false, editingHabit: null })}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>{editing ? 'Save changes' : 'Create habit'}</button>
      </>}
    >
      <div className="field">
        <label className="field-label">Name</label>
        <input className="input" autoFocus placeholder="e.g. Read before bed" value={f.name} onChange={(e) => set({ name: e.target.value })} onKeyDown={(e) => e.key === 'Enter' && save()} />
      </div>

      <div className="field">
        <label className="field-label">Description (optional)</label>
        <input className="input" placeholder="Why does this habit matter?" value={f.description} onChange={(e) => set({ description: e.target.value })} />
      </div>

      <div className="field">
        <label className="field-label">Type</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
          {HABIT_TYPES.map((t) => (
            <button key={t.value} type="button" onClick={() => set({ habit_type: t.value })} className="mood-btn" style={f.habit_type === t.value ? { borderColor: f.color, background: `color-mix(in srgb, ${f.color} 11%, transparent)`, color: 'var(--text)' } : {}}>
              <DynIcon name={t.icon} size={17} color={f.habit_type === t.value ? f.color : undefined} />
              <span style={{ fontWeight: 800 }}>{t.label}</span>
              <span style={{ fontWeight: 500, fontSize: '0.62rem', color: 'var(--text-faint)' }}>{t.desc}</span>
            </button>
          ))}
        </div>
      </div>

      {f.habit_type === 'amount' && (
        <div className="form-row">
          <div className="field">
            <label className="field-label">Daily goal</label>
            <input className="input" type="number" min="1" value={f.target_count} onChange={(e) => set({ target_count: Math.max(1, Number(e.target.value)) })} />
          </div>
          <div className="field">
            <label className="field-label">Unit</label>
            <input className="input" placeholder="minutes, pages, glasses…" value={f.unit} onChange={(e) => set({ unit: e.target.value })} />
          </div>
        </div>
      )}

      <div className="field">
        <label className="field-label">Schedule</label>
        <div className="form-row" style={{ gridTemplateColumns: f.schedule_type === 'x_per_week' || f.schedule_type === 'x_per_month' || f.schedule_type === 'every_n_days' ? '2fr 1fr' : '1fr' }}>
          <select className="select" value={f.schedule_type} onChange={(e) => set({ schedule_type: e.target.value })}>
            {SCHEDULE_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {['x_per_week', 'x_per_month', 'every_n_days'].includes(f.schedule_type) && (
            <input className="input" type="number" min="1" title={f.schedule_type === 'every_n_days' ? 'Every N days' : 'Times'} value={f.schedule_value} onChange={(e) => set({ schedule_value: Math.max(1, Number(e.target.value)) })} />
          )}
        </div>
        {f.schedule_type === 'custom_days' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            {DAY_NAMES_SHORT.map((d, i) => (
              <button key={d} type="button" onClick={() => toggleDay(i)} className="chip chip-btn" style={f.custom_days.includes(i) ? { background: 'var(--accent-soft)', borderColor: 'var(--accent)', color: 'var(--accent)' } : {}}>
                {d.slice(0, 2)}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="form-row-3">
        <div className="field">
          <label className="field-label">Category</label>
          <select className="select" value={f.category} onChange={(e) => {
            const cat = CATEGORIES.find((c) => c.name === e.target.value);
            set({ category: e.target.value, icon: cat?.icon || f.icon, color: cat?.color || f.color });
          }}>
            {CATEGORIES.map((c) => <option key={c.name}>{c.name}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Difficulty</label>
          <select className="select" value={f.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label} · {d.xp} XP</option>)}
          </select>
        </div>
        <div className="field">
          <label className="field-label">Icon</label>
          <button type="button" className="btn" style={{ borderColor: f.color }} onClick={() => setShowIcon((s) => !s)}>
            <DynIcon name={f.icon} size={16} color={f.color} /> {f.icon}
          </button>
        </div>
      </div>

      {showIcon && (
        <div className="card card-pad animate-slide-up" style={{ background: 'var(--surface-2)' }}>
          <IconPicker selected={f.icon} onSelect={(n) => { set({ icon: n }); setShowIcon(false); }} color={f.color} />
        </div>
      )}

      <div className="field">
        <label className="field-label">Color</label>
        <ColorPicker selected={f.color} onSelect={(c) => set({ color: c })} />
      </div>

      <div className="field">
        <label className="field-label">Steps checklist (optional)</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
          {f.checklist.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 10, padding: '7px 10px' }}>
              <Grip size={13} color="var(--text-faint)" />
              <input style={{ all: 'unset', flex: 1, fontSize: '0.85rem', fontWeight: 600 }} value={step} onChange={(e) => set({ checklist: f.checklist.map((x, xi) => (xi === i ? e.target.value : x)) })} />
              <button className="btn btn-ghost btn-icon" style={{ width: 24, height: 24 }} onClick={() => set({ checklist: f.checklist.filter((_, xi) => xi !== i) })}><X size={13} /></button>
            </div>
          ))}
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="input" placeholder="Add a step (e.g. Floss)" value={newStep} onChange={(e) => setNewStep(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && newStep.trim()) { set({ checklist: [...f.checklist, newStep.trim()] }); setNewStep(''); } }} />
            <button className="btn" onClick={() => { if (newStep.trim()) { set({ checklist: [...f.checklist, newStep.trim()] }); setNewStep(''); } }}><Plus size={14} /></button>
          </div>
        </div>
      </div>

      <div className="field">
        <label className="field-label">Tags (optional)</label>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {f.tags.map((t) => (
            <button key={t} className="chip on" style={{ cursor: 'pointer' }} onClick={() => set({ tags: f.tags.filter((x) => x !== t) })}>{t} <X size={10} /></button>
          ))}
          <input className="input" style={{ width: 130, padding: '6px 10px', fontSize: '0.8rem' }} placeholder="tag + Enter" value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && newTag.trim()) { if (!f.tags.includes(newTag.trim())) set({ tags: [...f.tags, newTag.trim()] }); setNewTag(''); } }} />
        </div>
      </div>
    </Modal>
  );
}
