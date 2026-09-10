import React, { useState, useMemo } from 'react';
import { View, Text, Button, Icon, Badge } from 'reshaped';
import { Plus, CheckCircle2, Circle, Clock, Flag, Tag, Trash2, ChevronDown, ChevronRight, GripVertical, Search } from 'lucide-react';
import { useStore } from '../../lib/store';
import { createTask, updateTask, deleteTask } from '../../lib/db';
import DynIcon from '../Shared/DynIcon';

const PRIORITIES = [
  { value: 'low', label: 'Low', color: '#94a3b8', icon: 'ArrowDown' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: 'Minus' },
  { value: 'high', label: 'High', color: '#f97316', icon: 'ArrowUp' },
  { value: 'urgent', label: 'Urgent', color: '#ef4444', icon: 'AlertCircle' },
];
const STATUSES = [
  { value: 'todo', label: 'To Do', color: '#94a3b8' },
  { value: 'in_progress', label: 'In Progress', color: '#3b82f6' },
  { value: 'done', label: 'Done', color: '#22c55e' },
];

export default function TaskBoard({ refreshData }) {
  const { tasks, addToast, addXp } = useStore();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', priority: 'medium', due_date: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [expandedTasks, setExpandedTasks] = useState(new Set());

  const rootTasks = useMemo(() => {
    return tasks.filter(t => !t.parent_id)
      .filter(t => filter === 'all' || t.status === filter)
      .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
      .sort((a, b) => {
        if (a.status === 'done' && b.status !== 'done') return 1;
        if (a.status !== 'done' && b.status === 'done') return -1;
        const pOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
        return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
      });
  }, [tasks, filter, search]);

  function getSubtasks(parentId) {
    return tasks.filter(t => t.parent_id === parentId);
  }

  async function handleCreate() {
    if (!newTask.title.trim()) return;
    await createTask(newTask);
    await refreshData();
    setNewTask({ title: '', priority: 'medium', due_date: '', tags: [] });
    setShowNew(false);
    addToast({ type: 'success', message: 'Task created' });
  }

  async function handleToggleStatus(task) {
    const newStatus = task.status === 'done' ? 'todo' : 'done';
    await updateTask(task.id, { status: newStatus, completed_at: newStatus === 'done' ? new Date().toISOString() : null });
    await refreshData();
    if (newStatus === 'done') { addXp(5); addToast({ type: 'success', message: `${task.title} completed! +5 XP` }); }
  }

  async function handleDelete(id) {
    await deleteTask(id);
    await refreshData();
    addToast({ type: 'info', message: 'Task deleted' });
  }

  async function handleAddSubtask(parentId) {
    const title = prompt('Subtask title:');
    if (!title) return;
    await createTask({ title, parent_id: parentId, priority: 'medium' });
    await refreshData();
    setExpandedTasks(prev => new Set([...prev, parentId]));
  }

  function addTag() {
    if (!tagInput.trim()) return;
    setNewTask(t => ({ ...t, tags: [...t.tags, tagInput.trim()] }));
    setTagInput('');
  }

  const counts = useMemo(() => ({
    all: tasks.filter(t => !t.parent_id).length,
    todo: tasks.filter(t => !t.parent_id && t.status === 'todo').length,
    in_progress: tasks.filter(t => !t.parent_id && t.status === 'in_progress').length,
    done: tasks.filter(t => !t.parent_id && t.status === 'done').length,
  }), [tasks]);

  function TaskItem({ task, depth = 0 }) {
    const subtasks = getSubtasks(task.id);
    const isExpanded = expandedTasks.has(task.id);
    const prio = PRIORITIES.find(p => p.value === task.priority) || PRIORITIES[1];
    const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'done';

    return (
      <div style={{ marginLeft: depth * 24 }}>
        <div className="animate-fade-in" style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
          borderRadius: 14, marginBottom: 4,
          background: task.status === 'done' ? 'var(--rs-color-background-neutral-faded)' : 'var(--rs-color-background-neutral-default)',
          border: '1px solid var(--rs-color-border-neutral-faded)',
          opacity: task.status === 'done' ? 0.6 : 1,
          transition: 'all 0.2s',
        }}>
          <button onClick={() => handleToggleStatus(task)} style={{ background: 'none', border: 'none', cursor: 'pointer', flexShrink: 0 }}>
            {task.status === 'done'
              ? <CheckCircle2 size={20} color="#22c55e" />
              : <Circle size={20} color={prio.color} />}
          </button>
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text variant="body-2" weight="medium" style={{
              textDecoration: task.status === 'done' ? 'line-through' : 'none',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{task.title}</Text>
            <View direction="row" gap={1} align="center" marginTop={1} style={{ flexWrap: 'wrap' }}>
              <Badge size="small" variant="faded" rounded style={{ background: `${prio.color}15`, color: prio.color }}>
                {prio.label}
              </Badge>
              {task.due_date && (
                <Badge size="small" variant="faded" rounded color={isOverdue ? 'critical' : 'neutral'}>
                  <View direction="row" gap={1} align="center">
                    <Clock size={10} />
                    {new Date(task.due_date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </View>
                </Badge>
              )}
              {task.tags?.map(tag => (
                <Badge key={tag} size="small" variant="faded" rounded color="neutral">
                  <View direction="row" gap={1} align="center"><Tag size={8} />{tag}</View>
                </Badge>
              ))}
              {subtasks.length > 0 && (
                <Badge size="small" variant="faded" rounded color="neutral">
                  {subtasks.filter(s => s.status === 'done').length}/{subtasks.length} sub
                </Badge>
              )}
            </View>
          </View>
          {subtasks.length > 0 && (
            <button onClick={() => setExpandedTasks(prev => { const n = new Set(prev); isExpanded ? n.delete(task.id) : n.add(task.id); return n; })}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)' }}>
              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>
          )}
          <button onClick={() => handleAddSubtask(task.id)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--rs-color-foreground-neutral-faded)', fontSize: '0.7rem', fontWeight: 600,
          }}>+sub</button>
          <button onClick={() => handleDelete(task.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)' }}>
            <Trash2 size={14} />
          </button>
        </div>
        {isExpanded && subtasks.map(sub => <TaskItem key={sub.id} task={sub} depth={depth + 1} />)}
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <View direction="row" align="center" gap={3} marginBottom={5} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View>
          <Text variant="title-1" weight="bold">Tasks</Text>
          <Text variant="body-2" color="neutral-faded">Manage your tasks, subtasks, and projects</Text>
        </View>
        <Button color="primary" onClick={() => setShowNew(!showNew)} startIcon={<Icon svg={<Plus size={16} />} />}>
          New Task
        </Button>
      </View>

      {/* New task form */}
      {showNew && (
        <View padding={4} marginBottom={4} className="animate-slide-up" style={{
          background: 'var(--rs-color-background-neutral-default)',
          border: '1px solid var(--rs-color-border-primary-faded)', borderRadius: 16,
        }}>
          <View gap={3}>
            <input value={newTask.title} onChange={e => setNewTask(t => ({ ...t, title: e.target.value }))}
              placeholder="Task title..." autoFocus
              onKeyDown={e => e.key === 'Enter' && handleCreate()}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.9375rem' }} />
            <View direction="row" gap={2} style={{ flexWrap: 'wrap' }}>
              <select value={newTask.priority} onChange={e => setNewTask(t => ({ ...t, priority: e.target.value }))}
                style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem' }}>
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
              <input type="date" value={newTask.due_date} onChange={e => setNewTask(t => ({ ...t, due_date: e.target.value }))}
                style={{ padding: '6px 12px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem' }} />
              <View direction="row" gap={1} align="center">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem', width: 100 }} />
                <button onClick={addTag} style={{ padding: '6px 10px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600 }}>Add</button>
              </View>
            </View>
            {newTask.tags.length > 0 && (
              <View direction="row" gap={1} style={{ flexWrap: 'wrap' }}>
                {newTask.tags.map(tag => (
                  <Badge key={tag} size="small" variant="faded" rounded color="primary"
                    onClick={() => setNewTask(t => ({ ...t, tags: t.tags.filter(tg => tg !== tag) }))}>
                    {tag} x
                  </Badge>
                ))}
              </View>
            )}
            <View direction="row" gap={2} style={{ justifyContent: 'flex-end' }}>
              <Button variant="faded" color="neutral" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button color="primary" onClick={handleCreate} disabled={!newTask.title.trim()}>Create Task</Button>
            </View>
          </View>
        </View>
      )}

      {/* Filters */}
      <View direction="row" gap={2} marginBottom={4} align="center" style={{ flexWrap: 'wrap' }}>
        <View direction="row" gap={1}>
          {STATUSES.map(s => (
            <button key={s.value} onClick={() => setFilter(s.value)} style={{
              padding: '6px 14px', borderRadius: 10, border: `1px solid ${filter === s.value ? s.color : 'var(--rs-color-border-neutral-faded)'}`,
              background: filter === s.value ? `${s.color}12` : 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
              color: filter === s.value ? s.color : 'var(--rs-color-foreground-neutral-faded)',
            }}>{s.label} ({counts[s.value]})</button>
          ))}
          <button onClick={() => setFilter('all')} style={{
            padding: '6px 14px', borderRadius: 10, border: `1px solid ${filter === 'all' ? '#6366f1' : 'var(--rs-color-border-neutral-faded)'}`,
            background: filter === 'all' ? 'rgba(99,102,241,0.08)' : 'transparent', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
            color: filter === 'all' ? '#6366f1' : 'var(--rs-color-foreground-neutral-faded)',
          }}>All ({counts.all})</button>
        </View>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks or tags..."
            style={{ padding: '6px 12px 6px 30px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem', width: 200 }} />
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rs-color-foreground-neutral-faded)' }} />
        </div>
      </View>

      {/* Task list */}
      {rootTasks.length === 0 ? (
        <View padding={8} align="center" style={{ background: 'var(--rs-color-background-neutral-faded)', borderRadius: 20, border: '2px dashed var(--rs-color-border-neutral-faded)' }}>
          <DynIcon name="ListChecks" size={48} color="#6366f1" style={{ marginBottom: 12 }} />
          <Text variant="title-3" weight="bold" marginBottom={2}>
            {search ? 'No matching tasks' : 'No tasks yet'}
          </Text>
          <Text variant="body-2" color="neutral-faded">Create your first task to get started</Text>
        </View>
      ) : (
        <View gap={1}>
          {rootTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </View>
      )}
    </div>
  );
}
