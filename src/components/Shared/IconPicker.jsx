import React, { useState } from 'react';
import DynIcon from './DynIcon';
import { HABIT_ICON_NAMES } from '../../lib/constants';

export default function IconPicker({ selected, onSelect, color = 'var(--accent)' }) {
  const [q, setQ] = useState('');
  const names = HABIT_ICON_NAMES.filter((n) => n.toLowerCase().includes(q.toLowerCase()));
  return (
    <div>
      <input className="input" style={{ marginBottom: 8 }} placeholder="Search icons…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(42px, 1fr))', gap: 5, maxHeight: 170, overflowY: 'auto', padding: 4 }}>
        {names.map((n) => (
          <button
            key={n}
            type="button"
            title={n}
            onClick={() => onSelect(n)}
            className="btn btn-icon"
            style={{
              width: 42, height: 42, borderRadius: 11,
              border: selected === n ? `2px solid ${color}` : '1px solid var(--border)',
              background: selected === n ? `color-mix(in srgb, ${color} 14%, transparent)` : 'var(--surface-2)',
              color: selected === n ? color : 'var(--text-muted)',
            }}
          >
            <DynIcon name={n} size={19} />
          </button>
        ))}
      </div>
    </div>
  );
}
