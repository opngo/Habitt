import React, { useState, useEffect } from 'react';
import { View, Text, Button, Icon, Modal, TextField, TextArea, Select, Switch, Slider } from 'reshaped';
import { Plus, Sparkles, BookOpen } from 'lucide-react';
import { useStore } from '../../lib/store';
import { createHabit, updateHabit } from '../../lib/db';
import { COLORS, CATEGORIES, HABIT_TEMPLATES, SCHEDULE_TYPES, HABIT_TYPES, HABIT_ICON_NAMES } from '../../lib/constants';
import DynIcon from '../Shared/DynIcon';

export default function CreateHabitModal({ refreshData }) {
  const { showCreateModal, setShowCreateModal, editingHabit, setEditingHabit,
    setShowTemplateLibrary, addToast, addXp, unlockAchievement, habits } = useStore();

  const isEdit = !!editingHabit;
  const [form, setForm] = useState({
    name: '', description: '', icon: 'Zap', color: '#22c55e',
    category: 'General', frequency: 'daily', target_count: 1,
    reminder_enabled: false, reminder_time: '09:00', custom_days: '',
    difficulty: 'medium', notes_template: '',
  });

  useEffect(() => {
    if (editingHabit) setForm({ ...editingHabit });
    else setForm({
      name: '', description: '', icon: 'Zap', color: '#22c55e',
      category: 'General', frequency: 'daily', target_count: 1,
      reminder_enabled: false, reminder_time: '09:00', custom_days: '',
      difficulty: 'medium', notes_template: '',
    });
  }, [editingHabit]);

  function update(field, value) { setForm(f => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e?.preventDefault?.();
    if (!form.name.trim()) return;
    if (isEdit) {
      await updateHabit(form.id, form);
      addToast({ type: 'success', message: 'Habit updated!' });
    } else {
      await createHabit(form);
      addXp(20);
      addToast({ type: 'success', message: 'Habit created! +20 XP' });
      if (habits.length === 0) unlockAchievement('first_habit');
      if (habits.length === 4) unlockAchievement('five_habits');
      if (habits.length === 9) unlockAchievement('ten_habits');
    }
    await refreshData();
    close();
  }

  function close() {
    setShowCreateModal(false);
    setEditingHabit(null);
  }

  function useTemplate(t) {
    setForm(f => ({ ...f, name: t.name, icon: t.icon, category: t.category, description: t.description, target_count: t.target || 1 }));
  }

  const EMOJI_SET = ['','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','','',''];

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
      backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, padding: '1rem'
    }} onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="animate-scale-in" style={{
        background: 'var(--rs-color-background-neutral-default)',
        borderRadius: 16, width: '100%', maxWidth: 560, maxHeight: '90vh',
        overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
      }}>
        {/* Header */}
        <View direction="row" align="center" padding={5} style={{
          justifyContent: 'space-between', borderBottom: '1px solid var(--rs-color-border-neutral-faded)'
        }}>
          <Text variant="title-3" weight="bold">{isEdit ? 'Edit Habit' : 'Create New Habit'}</Text>
          <button onClick={close} style={{
            width: 32, height: 32, borderRadius: 8, border: 'none', cursor: 'pointer',
            background: 'var(--rs-color-background-neutral-faded)', fontSize: '1rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}></button>
        </View>

        <form onSubmit={handleSubmit}>
          <View padding={5} gap={4}>
            {/* Templates quick-add */}
            {!isEdit && (
              <View>
                <Text variant="caption-1" weight="bold" color="neutral-faded" marginBottom={2}>Quick Templates</Text>
                <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {HABIT_TEMPLATES.slice(0, 8).map((t, i) => (
                    <button key={i} type="button" onClick={() => useTemplate(t)} style={{
                      padding: '6px 12px', borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)',
                      background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer',
                      whiteSpace: 'nowrap', fontSize: '0.75rem', fontWeight: 500,
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      <DynIcon name={t.icon} size={14} /> {t.name}
                    </button>
                  ))}
                </div>
              </View>
            )}

            {/* Icon & Color */}
            <View>
              <Text variant="caption-1" weight="bold" color="neutral-faded" marginBottom={2}>Icon & Color</Text>
              <View direction="row" gap={3} align="center">
                <div style={{
                  width: 56, height: 56, borderRadius: 14,
                  background: `${form.color}18`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  border: `2px solid ${form.color}40`,
                }}>
                  <DynIcon name={form.icon || 'Zap'} size={24} color={form.color} />
                </div>
                <View style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                    {ICON_SET.slice(0, 16).map(e => (
                      <button key={e} type="button" onClick={() => update('icon', e)} style={{
                        width: 32, height: 32, borderRadius: 8, border: form.icon === e ? `2px solid ${form.color}` : '2px solid transparent',
                        background: form.icon === e ? `${form.color}15` : 'transparent',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}><DynIcon name={e} size={16} color={form.icon === e ? form.color : undefined} /></button>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => update('color', c)} style={{
                        width: 24, height: 24, borderRadius: '50%', background: c,
                        border: form.color === c ? '3px solid var(--rs-color-foreground-neutral-default)' : '2px solid transparent',
                        cursor: 'pointer', boxShadow: form.color === c ? `0 0 0 2px var(--rs-color-background-neutral-default), 0 0 0 4px ${c}` : 'none',
                        transition: 'all 0.15s',
                      }} />
                    ))}
                  </div>
                </View>
              </View>
            </View>

            {/* Name */}
            <TextField
              label="Habit Name"
              placeholder="e.g., Read for 30 minutes"
              value={form.name}
              onChange={({ value }) => update('name', value)}
              required
            />

            {/* Description */}
            <TextArea
              label="Description"
              placeholder="Why is this habit important to you?"
              value={form.description}
              onChange={({ value }) => update('description', value)}
              rows={2}
            />

            {/* Category & Frequency */}
            <View direction="row" gap={3}>
              <div style={{ flex: 1 }}>
                <Select
                  label="Category"
                  value={form.category}
                  onChange={({ value }) => update('category', value)}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.name} value={c.name}>{c.icon} {c.name}</option>
                  ))}
                </Select>
              </div>
              <div style={{ flex: 1 }}>
                <Select
                  label="Frequency"
                  value={form.frequency}
                  onChange={({ value }) => update('frequency', value)}
                >
                  {SCHEDULE_TYPES.map(f => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </Select>
              </div>
            </View>

            {/* Difficulty */}
            <View>
              <Text variant="caption-1" weight="bold" color="neutral-faded" marginBottom={2}>Difficulty</Text>
              <View direction="row" gap={2}>
                {['easy', 'medium', 'hard'].map(d => (
                  <button key={d} type="button" onClick={() => update('difficulty', d)} style={{
                    flex: 1, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
                    border: `2px solid ${form.difficulty === d ? (d === 'easy' ? '#22c55e' : d === 'medium' ? '#f59e0b' : '#ef4444') : 'var(--rs-color-border-neutral-faded)'}`,
                    background: form.difficulty === d ? (d === 'easy' ? 'rgba(34,197,94,0.08)' : d === 'medium' ? 'rgba(245,158,11,0.08)' : 'rgba(239,68,68,0.08)') : 'transparent',
                    fontWeight: 600, fontSize: '0.8125rem', textTransform: 'capitalize',
                    color: form.difficulty === d ? (d === 'easy' ? '#22c55e' : d === 'medium' ? '#f59e0b' : '#ef4444') : 'var(--rs-color-foreground-neutral-default)',
                  }}>
                    {d}
                  </button>
                ))}
              </View>
            </View>

            {/* Target count */}
            <View direction="row" gap={3} align="center">
              <Text variant="body-3">Daily target:</Text>
              <View direction="row" gap={1} align="center">
                <button type="button" onClick={() => update('target_count', Math.max(1, form.target_count - 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer', fontWeight: 700 }}>−</button>
                <Text variant="featured-2" weight="bold" style={{ minWidth: 32, textAlign: 'center' }}>{form.target_count}</Text>
                <button type="button" onClick={() => update('target_count', Math.min(99, form.target_count + 1))}
                  style={{ width: 28, height: 28, borderRadius: 6, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer', fontWeight: 700 }}>+</button>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View direction="row" gap={2} padding={5} style={{
            justifyContent: 'flex-end', borderTop: '1px solid var(--rs-color-border-neutral-faded)',
          }}>
            <Button variant="faded" color="neutral" onClick={close}>Cancel</Button>
            <Button type="submit" color="primary" disabled={!form.name.trim()}
              startIcon={<Icon svg={<Plus size={16} />} />}>
              {isEdit ? 'Save Changes' : 'Create Habit'}
            </Button>
          </View>
        </form>
      </div>
    </div>
  );
}
