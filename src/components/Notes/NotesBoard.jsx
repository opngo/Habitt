import React, { useState, useMemo } from 'react';
import { View, Text, Button, Icon, Badge } from 'reshaped';
import { Plus, Pin, PinOff, Trash2, Search, FileText, Tag, Edit3, Save, X } from 'lucide-react';
import { useStore } from '../../lib/store';
import { createNote, updateNote, deleteNote } from '../../lib/db';
import DynIcon from '../Shared/DynIcon';

export default function NotesBoard({ refreshData }) {
  const { notes, addToast } = useStore();
  const [search, setSearch] = useState('');
  const [filterTag, setFilterTag] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', content: '', tags: [] });
  const [showNew, setShowNew] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '', tags: [], color: '#6366f1', icon: 'FileText' });
  const [tagInput, setTagInput] = useState('');

  const allTags = useMemo(() => {
    const tags = new Set();
    notes.forEach(n => n.tags?.forEach(t => tags.add(t)));
    return ['all', ...Array.from(tags).sort()];
  }, [notes]);

  const filtered = useMemo(() => {
    return notes
      .filter(n => filterTag === 'all' || n.tags?.includes(filterTag))
      .filter(n => !search || n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase()));
  }, [notes, filterTag, search]);

  async function handleCreate() {
    if (!newNote.title.trim()) return;
    await createNote(newNote);
    await refreshData();
    setNewNote({ title: '', content: '', tags: [], color: '#6366f1', icon: 'FileText' });
    setShowNew(false);
    addToast({ type: 'success', message: 'Note created' });
  }

  async function handleSaveEdit(id) {
    await updateNote(id, editForm);
    await refreshData();
    setEditingId(null);
    addToast({ type: 'success', message: 'Note saved' });
  }

  async function handlePin(note) {
    await updateNote(note.id, { pinned: note.pinned ? 0 : 1 });
    await refreshData();
  }

  async function handleDelete(id) {
    await deleteNote(id); await refreshData();
    addToast({ type: 'info', message: 'Note deleted' });
  }

  function startEdit(note) {
    setEditingId(note.id);
    setEditForm({ title: note.title, content: note.content, tags: note.tags || [] });
  }

  return (
    <div className="animate-fade-in">
      <View direction="row" align="center" gap={3} marginBottom={5} style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <View>
          <Text variant="title-1" weight="bold">Notes</Text>
          <Text variant="body-2" color="neutral-faded">Quick notes with tags and colors</Text>
        </View>
        <Button color="primary" onClick={() => setShowNew(!showNew)} startIcon={<Icon svg={<Plus size={16} />} />}>
          New Note
        </Button>
      </View>

      {showNew && (
        <View padding={4} marginBottom={4} className="animate-slide-up" style={{
          background: 'var(--rs-color-background-neutral-default)', border: '1px solid var(--rs-color-border-primary-faded)', borderRadius: 16,
        }}>
          <View gap={3}>
            <input value={newNote.title} onChange={e => setNewNote(n => ({ ...n, title: e.target.value }))}
              placeholder="Note title..." autoFocus
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', fontSize: '0.9375rem' }} />
            <textarea value={newNote.content} onChange={e => setNewNote(n => ({ ...n, content: e.target.value }))}
              placeholder="Write your note..." rows={5}
              style={{ width: '100%', padding: '10px 14px', borderRadius: 12, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', fontSize: '0.875rem', resize: 'vertical' }} />
            <View direction="row" gap={2} align="center" style={{ flexWrap: 'wrap' }}>
              <input type="color" value={newNote.color} onChange={e => setNewNote(n => ({ ...n, color: e.target.value }))}
                style={{ width: 32, height: 28, borderRadius: 8, border: 'none', cursor: 'pointer' }} />
              <View direction="row" gap={1} align="center">
                <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tag..."
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), tagInput.trim() && (setNewNote(n => ({ ...n, tags: [...n.tags, tagInput.trim()] })), setTagInput('')))}
                  style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', fontSize: '0.8125rem', width: 80 }} />
              </View>
              {newNote.tags.map(t => <Badge key={t} size="small" variant="faded" rounded color="primary" onClick={() => setNewNote(n => ({ ...n, tags: n.tags.filter(tg => tg !== t) }))}>{t} x</Badge>)}
            </View>
            <View direction="row" gap={2} style={{ justifyContent: 'flex-end' }}>
              <Button variant="faded" color="neutral" onClick={() => setShowNew(false)}>Cancel</Button>
              <Button color="primary" onClick={handleCreate}>Create Note</Button>
            </View>
          </View>
        </View>
      )}

      {/* Filters */}
      <View direction="row" gap={2} marginBottom={4} align="center" style={{ flexWrap: 'wrap' }}>
        <View direction="row" gap={1} style={{ flexWrap: 'wrap' }}>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilterTag(tag)} style={{
              padding: '4px 12px', borderRadius: 10,
              border: `1px solid ${filterTag === tag ? '#6366f1' : 'var(--rs-color-border-neutral-faded)'}`,
              background: filterTag === tag ? 'rgba(99,102,241,0.08)' : 'transparent',
              cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
              color: filterTag === tag ? '#6366f1' : 'var(--rs-color-foreground-neutral-faded)',
            }}>{tag}</button>
          ))}
        </View>
        <div style={{ position: 'relative', marginLeft: 'auto' }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
            style={{ padding: '6px 12px 6px 30px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', fontSize: '0.8125rem', width: 180 }} />
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rs-color-foreground-neutral-faded)' }} />
        </div>
      </View>

      {/* Notes grid */}
      {filtered.length === 0 ? (
        <View padding={8} align="center" style={{ background: 'var(--rs-color-background-neutral-faded)', borderRadius: 20, border: '2px dashed var(--rs-color-border-neutral-faded)' }}>
          <FileText size={48} color="#6366f1" style={{ marginBottom: 12 }} />
          <Text variant="title-3" weight="bold" marginBottom={2}>No notes yet</Text>
        </View>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {filtered.map((note, i) => (
            <div key={note.id} className={`animate-slide-up stagger-${(i % 6) + 1}`} style={{
              background: 'var(--rs-color-background-neutral-default)',
              border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 16,
              borderTop: `4px solid ${note.color}`, padding: '1.25rem',
              transition: 'all 0.2s', cursor: 'default',
            }}>
              {editingId === note.id ? (
                <View gap={2}>
                  <input value={editForm.title} onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)', fontSize: '0.9375rem', fontWeight: 700 }} />
                  <textarea value={editForm.content} onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
                    rows={4} style={{ width: '100%', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)', fontSize: '0.8125rem', resize: 'vertical' }} />
                  <View direction="row" gap={1}>
                    <Button size="small" color="primary" onClick={() => handleSaveEdit(note.id)} startIcon={<Icon svg={<Save size={12} />} />}>Save</Button>
                    <Button size="small" variant="faded" color="neutral" onClick={() => setEditingId(null)} startIcon={<Icon svg={<X size={12} />} />}>Cancel</Button>
                  </View>
                </View>
              ) : (
                <>
                  <View direction="row" align="start" gap={2} marginBottom={2}>
                    <DynIcon name={note.icon || 'FileText'} size={18} color={note.color} />
                    <Text variant="body-1" weight="bold" style={{ flex: 1 }}>{note.title}</Text>
                    <View direction="row" gap={1}>
                      <button onClick={() => handlePin(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: note.pinned ? '#f59e0b' : 'var(--rs-color-foreground-neutral-faded)' }}>
                        {note.pinned ? <Pin size={14} /> : <PinOff size={14} />}
                      </button>
                      <button onClick={() => startEdit(note)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)' }}>
                        <Edit3 size={14} />
                      </button>
                      <button onClick={() => handleDelete(note.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)' }}>
                        <Trash2 size={14} />
                      </button>
                    </View>
                  </View>
                  <Text variant="body-3" color="neutral-faded" style={{
                    display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                    whiteSpace: 'pre-wrap', lineHeight: 1.5,
                  }}>{note.content || 'Empty note'}</Text>
                  {note.tags?.length > 0 && (
                    <View direction="row" gap={1} marginTop={2} style={{ flexWrap: 'wrap' }}>
                      {note.tags.map(t => <Badge key={t} size="small" variant="faded" rounded color="neutral"><Tag size={8} /> {t}</Badge>)}
                    </View>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
