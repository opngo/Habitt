import React, { useState, useMemo } from 'react';
import { View, Text } from 'reshaped';
import { Search } from 'lucide-react';
import { HABIT_ICON_NAMES } from '../../lib/constants';
import DynIcon from './DynIcon';

export default function IconPicker({ selected, onSelect, color }) {
  const [search, setSearch] = useState('');
  const filtered = useMemo(() => {
    if (!search) return HABIT_ICON_NAMES;
    return HABIT_ICON_NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase()));
  }, [search]);

  return (
    <View>
      <div style={{ position: 'relative', marginBottom: 8 }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search icons..."
          style={{ width: '100%', padding: '8px 12px 8px 32px', borderRadius: 10, border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-faded)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.8125rem' }} />
        <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--rs-color-foreground-neutral-faded)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 4, maxHeight: 200, overflowY: 'auto', padding: 4 }}>
        {filtered.map(name => (
          <button key={name} type="button" onClick={() => onSelect(name)}
            title={name}
            style={{
              width: 36, height: 36, borderRadius: 10,
              border: selected === name ? `2px solid ${color || '#22c55e'}` : '2px solid transparent',
              background: selected === name ? `${color || '#22c55e'}12` : 'transparent',
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { if (selected !== name) e.currentTarget.style.background = 'var(--rs-color-background-neutral-faded)'; }}
            onMouseLeave={e => { if (selected !== name) e.currentTarget.style.background = 'transparent'; }}
          >
            <DynIcon name={name} size={18} color={selected === name ? (color || '#22c55e') : undefined} />
          </button>
        ))}
      </div>
      {filtered.length === 0 && <Text variant="caption-1" color="neutral-faded" align="center">No icons match "{search}"</Text>}
    </View>
  );
}
