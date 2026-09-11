import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StickyNote, Plus, Search, Pin, Trash2, ChevronLeft, Tag, Palette } from 'lucide-react';
import { useStore } from '../../lib/store';
import { formatShort, getToday } from '../../lib/utils';
import { COLORS } from '../../lib/constants';
import DynIcon from '../Shared/DynIcon';

export default function NotesView() {
  const { notes, addNote, updateNote, deleteNote, togglePinNote } = useStore();
  const [q, setQ] = useState('');
  const [activeId, setActiveId] = useState(null);
  const [mobileEditor, setMobileEditor] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  const sorted = useMemo(() => [...notes]
    .filter((n) => !q || `${n.title} ${n.content}`.toLowerCase().includes(q.toLowerCase()))
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || (b.updated_at || '').localeCompare(a.updated_at || '')),
  [notes, q]);

  const active = notes.find((n) => n.id === activeId) || null;
  useEffect(() => { if (!active && sorted.length) setActiveId(sorted[0].id); }, [sorted, active]);

  const create = () => {
    const n = addNote({ title: '' });
    setActiveId(n.id);
    setMobileEditor(true);
  };

  return (
    <div className="notes-split" data-mobile={mobileEditor && active ? 'editor' : 'list'}>
      <aside className="notes-list">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 4px 10px' }}>
          <h2 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, letterSpacing: '-0.02em', display: 'flex', gap: 8, alignItems: 'center' }}>
            <StickyNote size={18} color="var(--amber)" /> Notes
          </h2>
          <button className="btn btn-icon btn-sm" style={{ marginLeft: 'auto' }} onClick={create} title="New note"><Plus size={15} /></button>
        </div>
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-faint)' }} />
          <input className="input" style={{ paddingLeft: 31, fontSize: '0.83rem', padding: '8px 10px 8px 31px' }} placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div className="notes-scroll">
          {sorted.length === 0 && <p style={{ color: 'var(--text-faint)', fontSize: '0.82rem', textAlign: 'center', padding: '26px 8px', margin: 0 }}>{q ? 'No matches' : 'No notes yet — create one.'}</p>}
          {sorted.map((n) => (
            <button key={n.id} className={`note-item ${n.id === activeId ? 'on' : ''}`} onClick={() => { setActiveId(n.id); setMobileEditor(true); }}
              style={{ borderLeftColor: n.color }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <DynIcon name={n.icon} size={13} color={n.color} />
                <b style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '0.86rem' }}>{n.title || 'Untitled'}</b>
                {n.pinned && <Pin size={11} color={n.color} fill={n.color} />}
              </span>
              <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--text-faint)', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {(n.content || 'Empty note').slice(0, 60)}
              </span>
              <span style={{ fontSize: '0.62rem', color: 'var(--text-faint)', opacity: 0.75 }}>{n.updated_at ? formatShort(n.updated_at.slice(0, 10)) : getToday()}</span>
            </button>
          ))}
        </div>
      </aside>

      <section className="notes-editor">
        {active ? (
          <NoteEditor key={active.id} note={active} savedFlash={savedFlash} setSavedFlash={setSavedFlash}
            onBack={() => setMobileEditor(false)}
            onChange={(patch) => { updateNote(active.id, patch); flash(setSavedFlash); }}
            onDelete={() => { deleteNote(active.id); setActiveId(null); setMobileEditor(false); }}
            onPin={() => togglePinNote(active.id)}
          />
        ) : (
          <div className="empty" style={{ border: 'none', background: 'transparent', justifyContent: 'center', height: '100%' }}>
            <div className="empty-icon" style={{ background: 'rgba(245,158,11,0.12)' }}><StickyNote size={26} color="var(--amber)" /></div>
            <p style={{ color: 'var(--text-muted)', fontWeight: 700 }}>Select or create a note</p>
            <button className="btn btn-primary" onClick={create}><Plus size={14} /> New note</button>
          </div>
        )}
      </section>
    </div>
  );
}

function flash(setter) {
  setter(true);
  clearTimeout(flash._t);
  flash._t = setTimeout(() => setter(false), 1200);
}

function NoteEditor({ note, onChange, onDelete, onPin, onBack, savedFlash }) {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content || '');
  const [tagInput, setTagInput] = useState('');
  const [showColors, setShowColors] = useState(false);
  const titleT = useRef(null);
  const bodyT = useRef(null);

  useEffect(() => () => { clearTimeout(titleT.current); clearTimeout(bodyT.current); }, []);
  const editTitle = (v) => { setTitle(v); clearTimeout(titleT.current); titleT.current = setTimeout(() => onChange({ title: v.trim() || 'Untitled' }), 500); };
  const editBody = (v) => { setContent(v); clearTimeout(bodyT.current); bodyT.current = setTimeout(() => onChange({ content: v }), 500); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 2px 10px' }}>
        <button className="btn btn-ghost btn-icon back-btn" onClick={onBack} title="Back to list"><ChevronLeft size={16} /></button>
        <span className="save-state" style={{ opacity: savedFlash ? 1 : 0 }}>{savedFlash ? 'Saved' : ' '}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, position: 'relative' }}>
          <button className={`btn btn-ghost btn-icon ${note.pinned ? 'on' : ''}`} onClick={onPin} title={note.pinned ? 'Unpin' : 'Pin'}><Pin size={14} color={note.pinned ? note.color : undefined} fill={note.pinned ? note.color : 'none'} /></button>
          <button className="btn btn-ghost btn-icon" onClick={() => setShowColors((s) => !s)} title="Note color"><Palette size={14} /></button>
          <button className="btn btn-ghost btn-icon" onClick={() => { if (confirm('Delete this note?')) onDelete(); }} title="Delete note"><Trash2 size={14} color="var(--text-faint)" /></button>
          {showColors && (
            <>
              <div style={{ position: 'fixed', inset: 0, zIndex: 25 }} onClick={() => setShowColors(false)} />
              <div className="card-menu" style={{ top: 32, right: 0, width: 190, display: 'flex', flexWrap: 'wrap', gap: 7, padding: 10 }} onClick={() => setShowColors(false)}>
                {COLORS.map((c) => (
                  <button key={c} onClick={() => onChange({ color: c })} style={{ width: 24, height: 24, borderRadius: 8, background: c, border: c === note.color ? '2.5px solid var(--text)' : '1px solid var(--border)', cursor: 'pointer' }} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <input
        className="note-title-input"
        placeholder="Untitled"
        value={title}
        onChange={(e) => editTitle(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bodyRefFocus(); } }}
      />

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', margin: '6px 0 8px' }}>
        {(note.tags || []).map((t) => (
          <button key={t} className="chip" style={{ cursor: 'pointer' }} onClick={() => onChange({ tags: note.tags.filter((x) => x !== t) })}><Tag size={8} /> {t} <X size={9} /></button>
        ))}
        <input style={{ all: 'unset', fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-faint)', width: 90, padding: '3px 2px' }}
          placeholder="+ tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && tagInput.trim()) { onChange({ tags: [...new Set([...(note.tags || []), tagInput.trim()])] }); setTagInput(''); } }} />
      </div>

      <textarea className="note-body-input" placeholder="Start writing…" value={content} onChange={(e) => editBody(e.target.value)} />

      <div style={{ fontSize: '0.66rem', color: 'var(--text-faint)', fontWeight: 650, padding: '8px 2px 2px', textAlign: 'right' }}>
        {content.length} characters · {((content || '').trim().match(/\S+/g) || []).length} words · autosaved
      </div>
    </div>
  );

  function bodyRefFocus() {
    document.querySelector('.note-body-input')?.focus();
  }
}
