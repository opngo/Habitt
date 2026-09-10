import React, { useState, useMemo } from 'react';
import { View, Text, Button, Icon, Badge } from 'reshaped';
import { Plus, CheckCircle2, Circle, Clock, Trash2, BookOpen, Search, Calendar } from 'lucide-react';
import { useStore } from '../../lib/store';
import { createHomework, updateHomework, deleteHomework } from '../../lib/db';
import DynIcon from '../Shared/DynIcon';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#94a3b8' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
];

export default function HomeworkBoard({ refreshData }) {
  const { homework, subjects, addToast, addXp } = useStore();
  const [showNew, setShowNew] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [form, setForm] = useState({ title: '', description: '', subject_id: '', due_date: '', priority: 'medium', tags: [] });
  const [tagInput, setTagInput] = useState('');

  const filtered = useMemo(() => {
    return homework
      .filter(h => filterSubject === 'all' || h.subject_id === filterSubject)
      .filter(h => filterStatus === 'all' || h.status === filterStatus)
      .filter(h => !search || h.title.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date));
  }, [homework, filterSubject, filterStatus, search]);

  async function handleCreate() {
    if (!form.title.trim() || !form.subject_id || !form.due_date) {
      addToast({ type: 'error', message: 'Title, subject, and due date are required' });
      return;
    }
    await createHomework(form);
    await refreshData();
    setForm({ title: '', description: '', subject_id: '', due_date: '', priority: 'medium', tags: [] });
    setShowNew(false);
    addToast({ type: 'success', message: 'Homework added' });
  }

  async function handleToggle(hw) {
    const newStatus = hw.status === 'completed' ? 'pending' : 'completed';
    await updateHomework(hw.id, { status: newStatus, completed_at: newStatus === 'completed' ? new Date().toISOString() : null });
    await refreshData();
    if (newStatus === 'completed') { addXp(10); addToast({ type: 'success', message: `${hw.title} completed! +10 XP` }); }
  }

  async function handleDelete(id) {
    await deleteHomework(id); await refreshData();
    addToast({ type: 'info', message: 'Homework deleted' });
  }

  function addTag() {
    if (!tagInput.trim()) return;
    setForm(f => ({ ...f, tags: [...f.tags, tagInput.trim()] }));
    setTagInput('');
  }

  function getSubject(id) { return subjects.find(s => s.id === id); }

  // Group by subject
  const grouped = useMemo(() => {
    const groups = {};
    filtered.forEach(h => {
      const sub = getSubject(h.subject_id);
      const key = sub?.name || 'Unknown';
      if (!groups[key]) groups[key] = { subject: sub, items: [] };
      groups[key].items.push(h);
    });
    return Object.values(groups);
  }, [filtered, subjects]);

  const overdueCount = homework.filter(h => h.status === 'pending' && new Date(h.due_date) < new Date()).length;

  return (
    <div className="animate-fade-in">
      <View direction="row" align="center" gap={3} marginBottom={5} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View>
          <Text variant="title-1" weight="bold">Homework</Text>
          <Text variant="body-2" color="neutral-faded">Track assignments by subject with color coding</Text>
        </View>
        <View direction="row" gap={2}>
          {overdueCount > 0 && <Badge color="critical" variant="faded" rounded size="small">{overdueCount} overdue</Badge>}
          <Button color="primary" onClick={() => setShowNew(!showNew)} startIcon={<Icon svg={<Plus size={16} />} />}>
            New Assignment
          </Button>
        </View>
      </View>

      {/* New form */}
      {showNew && (
        <View padding={4} marginBottom={4} className="animate-slide-up" style={{
          background: 'var(--rs-color-background-neutral-default)',
          border: '1px solid var(--rs-color-border-primary-faded)', borderRadius: 16,
        }}>
          <View gap={3}>
            <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Assignment title..." autoFocus
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.9375rem' }} />
            <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Description, instructions, notes..." rows={3}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.875rem', resize: 'vertical' }} />
            <View direction="row" gap={2} style={{ flexWrap: 'wrap' }}>
              <select value={form.subject_id} onChange={e => setForm(f => ({ ...f, subject_id: e.target.value }))}
                style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem' }}>
                <option value="">Select subject...</option>
                {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))}
                style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem' }} />
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}
                style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem' }}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <View direction="row" gap={1} align="center">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tag..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', fontSize: '0.8125rem', width: 80 }} />
                <button onClick={addTag} style={{ padding: '6px 8px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>+</button>
              </View>
            </View>
            {form.tags.length > 0 && (
              <View direction="row" gap={1} style={{ flexWrap: 'wrap' }}>
                {form.tags.map(tag => (
                  <Badge key={tag} size="small" variant="faded" rounded color="primary"
                    onClick={() => setForm(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }))}>{tag} x</Badge>
                ))}
              </View>
            )}
            <View direction="row" gap={2} style={{ justifyContent: 'flex-end' }}>
              <Button variant="faded" color="neutral" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button color="primary" onClick={handleCreate}>Add Assignment</Button>
            </View>
          </View>
        </View>
      )}

      {/* Filters */}
      <View direction="row" gap={2} marginBottom={4} align="center" style={{ flexWrap: 'wrap' }}>
        <select value={filterSubject} onChange={e => setFilterSubject(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', fontSize: '0.8125rem' }}>
          <option value="all">All Subjects</option>
          {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', fontSize: '0.8125rem' }}>
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ padding: '6px 12px 6px 30px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', fontSize: '0.8125rem', width: 180 }} />
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rs-color-foreground-neutral-faded)' }} />
        </div>
      </View>

      {/* Grouped by subject */}
      {grouped.length === 0 ? (
        <View padding={8} align="center" style={{ background: 'var(--rs-color-background-neutral-faded)', borderRadius: 20, border: '2px dashed var(--rs-color-border-neutral-faded)' }}>
          <BookOpen size={48} color="#6366f1" style={{ marginBottom: 12 }} />
          <Text variant="title-3" weight="bold" marginBottom={2}>
            {subjects.length === 0 ? 'Add subjects first in Settings' : 'No assignments yet'}
          </Text>
          <Text variant="body-2" color="neutral-faded">
            {subjects.length === 0 ? 'Go to Settings to add your school subjects and colors' : 'Add your first homework assignment'}
          </Text>
        </View>
      ) : (
        <View gap={5}>
          {grouped.map(group => (
            <View key={group.subject?.id || 'unknown'}>
              <View direction="row" align="center" gap={2} marginBottom={2}>
                <div style={{ width: 12, height: 12, borderRadius: 4, background: group.subject?.color || '#94a3b8' }} />
                <DynIcon name={group.subject?.icon || 'BookOpen'} size={16} color={group.subject?.color} />
                <Text variant="body-1" weight="bold" style={{ color: group.subject?.color }}>{group.subject?.name || 'Unknown'}</Text>
                <Badge size="small" variant="faded" rounded color="neutral">{group.items.length}</Badge>
              </View>
              <View gap={1}>
                {group.items.map(hw => {
                  const isOverdue = hw.status === 'pending' && new Date(hw.due_date) < new Date();
                  const prio = PRIORITIES.find(p => p.value === hw.priority);
                  return (
                    <div key={hw.id} className="animate-fade-in" style={{
                      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
                      borderRadius: 14, borderLeft: `4px solid ${group.subject?.color || '#94a3b8'}`,
                      background: hw.status === 'completed' ? 'var(--rs-color-background-neutral-faded)' : 'var(--rs-color-background-neutral-default)',
                      border: '1px solid var(--rs-color-border-neutral-faded)',
                      opacity: hw.status === 'completed' ? 0.6 : 1,
                    }}>
                      <button onClick={() => handleToggle(hw)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                        {hw.status === 'completed' ? <CheckCircle2 size={20} color="#22c55e" /> : <Circle size={20} color={group.subject?.color} />}
                      </button>
                      <View style={{ flex: 1, minWidth: 0 }}>
                        <Text variant="body-2" weight="medium" style={{ textDecoration: hw.status === 'completed' ? 'line-through' : 'none' }}>{hw.title}</Text>
                        {hw.description && <Text variant="caption-1" color="neutral-faded" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hw.description}</Text>}
                        <View direction="row" gap={1} align="center" marginTop={1} style={{ flexWrap: 'wrap' }}>
                          <Badge size="small" variant="faded" rounded color={isOverdue ? 'critical' : 'neutral'}>
                            <View direction="row" gap={1} align="center"><Calendar size={10} />Due {new Date(hw.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</View>
                          </Badge>
                          {prio && <Badge size="small" variant="faded" rounded style={{ background: `${prio.color}15`, color: prio.color }}>{prio.label}</Badge>}
                          {hw.tags?.map(t => <Badge key={t} size="small" variant="faded" rounded color="neutral">{t}</Badge>)}
                        </View>
                      </View>
                      <button onClick={() => handleDelete(hw.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}
              </View>
            </View>
          ))}
        </View>
      )}
    </div>
  );
}
