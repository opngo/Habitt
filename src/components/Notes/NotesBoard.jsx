import React, { useMemo, useState } from 'react';
import { StickyNote, Plus, Search, Pin, PinOff, Trash2, Tag } from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatShort, getToday } from '../../lib/utils';
import DynIcon from '../Shared/DynIcon';
import Modal from '../Shared/Modal';
import ColorPicker from '../Shared/ColorPicker';
import IconPicker from '../Shared/IconPicker';

export default function NotesBoard() {
  const { notes } = useStore();
  const [q, setQ] = useState('');
  const [tag, setTag] = useState('all');
  const [editing, setEditing] = useState(null); // note obj or 'new'
  const allTags = useMemo(() => {
    const t = new Set();
    notes.forEach((n) => n.tags?.forEach((x) => t.add(x)));
    return ['all', ...[...t].sort()];
  }, [notes]);
  const filtered = useMemo(() => notes
    .filter((n) => tag === 'all' || n.tags?.includes(tag))
    .filter((n) => !q || `${n.title} ${n.content} ${(n.tags || []).join(' ')}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updated_at || '').localeCompare(a.updated_at || '')),
  [notes, q, tag]);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <div>
          <h2 className="page-title"><StickyNote size={22} color="var(--amber)" /> Notes</h2>
          <p className="page-sub">Quick thoughts, long pages — pinned to the top, searchable anytime.</p>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
            <input className="input" style={{ width: 190, padding: '8px 10px 8px 30px', fontSize: '0.82rem' }} placeholder="Search notes…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={15} /> New note</button>
        </div>
      </div>

      {allTags.length > 1 && (
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {allTags.map((t) => (
            <button key={t} className={`chip chip-btn ${tag === t ? 'on' : ''}`} onClick={() => setTag(t)}>{t === 'all' ? 'All tags' : `# ${t}`}</button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="empty" style={{ padding: '44px 22px' }}>
          <div className="empty-icon" style={{ background: 'rgba(245,158,11,0.13)' }}><StickyNote size={28} color="var(--amber)" /></div>
          <h3 style={{ margin: 0 }}>{q ? 'No notes match your search' : 'No notes yet'}</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem' }}>Capture something — ideas, lecture summaries, recipes…</p>
          <button className="btn btn-primary" onClick={() => setEditing('new')}><Plus size={14} /> Write your first note</button>
        </div>
      ) : (
        <div className="grid stagger" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))' }}>
          {filtered.map((n, i) => (
            <article key={n.id} className="card card-hover" style={{ '--i': i, borderTop: `3px solid ${n.color}`, cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 8 }} onClick={() => setEditing(n)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                <DynIcon name={n.icon || 'FileText'} size={17} color={n.color} />
                <b style={{ flex: 1, fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.title}</b>
                {n.pinned && <Pin size={13} color={n.color} fill={n.color} />}
              </div>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: '7.5em', overflow: 'hidden' }}>
                {n.content ? (n.content.length > 220 ? n.content.slice(0, 220) + '…' : n.content) : <span style={{ fontStyle: 'italic', color: 'var(--text-faint)' }}>Empty note</span>}
              </p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginTop: 'auto' }}>
                {(n.tags || []).slice(0, 3).map((t) => <span key={t} className="chip"><Tag size={8} /> {t}</span>)}
                <span className="chip" style={{ marginLeft: 'auto', opacity: 0.7 }}>{n.updated_at ? formatShort(n.updated_at.slice(0, 10)) : getToday()}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      {editing && <NoteEditor note={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function NoteEditor({ note, onClose }) {
  const { addNote, updateNote, deleteNote, togglePinNote, addToast } = useStore();
  const [f, setF] = useState(note ? { ...note } : { title: '', content: '', tags: [], color: '#f59e0b', icon: 'StickyNote', pinned: false });
  const [tagInput, setTagInput] = useState('');
  const [tab, setTab] = useState('write');

  const save = () => {
    if (note) updateNote(note.id, { title: f.title.trim() || 'Untitled', content: f.content, tags: f.tags, color: f.color, icon: f.icon, pinned: f.pinned });
    else addNote({ ...f, title: f.title.trim() || 'Untitled' });
    addToast({ type: 'success', message: 'Note saved' });
    onClose();
  };

  return (
    <Modal title={note ? 'Edit note' : 'New note'} icon={<DynIcon name={f.icon} size={18} color={f.color} />} onClose={onClose} wide
      footer={<>
        {note && (
          <>
            <button className="btn btn-ghost" style={{ marginRight: 'auto', color: f.color }} onClick={() => { togglePinNote(note.id); setF((x) => ({ ...x, pinned: !x.pinned })); }}>
              {f.pinned ? <><PinOff size={14} /> Unpin</> : <><Pin size={14} /> Pin to top</>}
            </button>
            <button className="btn btn-danger" onClick={() => { deleteNote(note.id); onClose(); }}><Trash2 size={14} /> Delete</button>
          </>
        )}
        <button className="btn" onClick={onClose}>Cancel</button>
        <button className="btn btn-primary" onClick={save}>Save</button>
      </>}>
      <input className="input" autoFocus placeholder="Note title…" style={{ fontWeight: 750 }} value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />
      <div style={{ display: 'flex', gap: 7 }}>
        {['write', 'style'].map((t) => <button key={t} className={`chip chip-btn ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>{t === 'write' ? '✍️ Write' : '🎨 Look'}</button>)}
      </div>
      {tab === 'write' ? (
        <textarea className="textarea" style={{ minHeight: 240, fontFamily: 'var(--font)' }} placeholder="Start writing…" value={f.content} onChange={(e) => setF((x) => ({ ...x, content: e.target.value }))} />
      ) : (
        <>
          <div className="field"><span className="field-label">Color</span><ColorPicker selected={f.color} onSelect={(c) => setF((x) => ({ ...x, color: c }))} /></div>
          <div className="field"><span className="field-label">Icon</span><IconPicker selected={f.icon} onSelect={(icon) => setF((x) => ({ ...x, icon }))} color={f.color} /></div>
        </>
      )}
      <div className="field">
        <span className="field-label">Tags</span>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
          {f.tags.map((t) => <button key={t} className="chip on" style={{ cursor: 'pointer' }} onClick={() => setF((x) => ({ ...x, tags: x.tags.filter((y) => y !== t) }))}>{t} ✕</button>)}
          <input className="input" style={{ width: 140, padding: '6px 10px', fontSize: '0.8rem' }} placeholder="tag + Enter" value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { setF((x) => ({ ...x, tags: [...new Set([...x.tags, tagInput.trim()])] })); setTagInput(''); e.stopPropagation(); } }} />
        </div>
      </div>
    </Modal>
  );
}
