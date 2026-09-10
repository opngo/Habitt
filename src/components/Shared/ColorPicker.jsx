import React, { useState } from 'react';
import { View, Text } from 'reshaped';
import { COLORS } from '../../lib/constants';

const CUSTOM_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e', '#78716c', '#64748b', '#0f172a', '#1e293b',
];

export default function ColorPicker({ selected, onSelect, showCustom = true }) {
  const [customColor, setCustomColor] = useState(selected || '#22c55e');

  return (
    <View gap={2}>
      {/* Preset colors */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {(showCustom ? CUSTOM_COLORS : COLORS).map(c => (
          <button key={c} type="button" onClick={() => onSelect(c)}
            style={{
              width: 28, height: 28, borderRadius: 10, background: c,
              border: selected === c ? '3px solid var(--rs-color-foreground-neutral-default)' : '2px solid transparent',
              cursor: 'pointer', transition: 'all 0.15s',
              boxShadow: selected === c ? `0 0 0 2px var(--rs-color-background-neutral-default), 0 0 0 4px ${c}` : 'none',
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.15)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
          />
        ))}
      </div>
      {/* Custom color input */}
      {showCustom && (
        <View direction="row" gap={2} align="center">
          <input type="color" value={customColor} onChange={e => { setCustomColor(e.target.value); onSelect(e.target.value); }}
            style={{ width: 36, height: 28, borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)', cursor: 'pointer', padding: 0 }} />
          <input type="text" value={customColor} onChange={e => { setCustomColor(e.target.value); if (/^#[0-9a-f]{6}$/i.test(e.target.value)) onSelect(e.target.value); }}
            placeholder="#000000"
            style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', fontSize: '0.75rem', width: 90, fontFamily: 'monospace' }} />
          <div style={{ width: 24, height: 24, borderRadius: 8, background: customColor, border: '1px solid var(--rs-color-border-neutral-faded)' }} />
        </View>
      )}
    </View>
  );
}
