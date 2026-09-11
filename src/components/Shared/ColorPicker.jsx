import React from 'react';
import { COLORS } from '../../lib/constants';

export default function ColorPicker({ selected, onSelect }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {COLORS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onSelect(c)}
          style={{
            width: 28, height: 28, borderRadius: 10, cursor: 'pointer', background: c,
            border: selected === c ? '3px solid var(--text)' : '1px solid var(--border)',
            transform: selected === c ? 'scale(1.12)' : 'none', transition: 'all 0.14s',
            boxShadow: selected === c ? `0 4px 12px -3px ${c}` : 'none',
          }}
        />
      ))}
      <label
        title="Custom color"
        style={{
          width: 28, height: 28, borderRadius: 10, cursor: 'pointer', position: 'relative',
          border: '1px dashed var(--border-strong)', background: 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-faint)', fontSize: 15, overflow: 'hidden',
        }}
      >
        +
        <input
          type="color"
          value={selected}
          onChange={(e) => onSelect(e.target.value)}
          style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
        />
      </label>
    </div>
  );
}
