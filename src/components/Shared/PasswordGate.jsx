import React, { useState } from 'react';
import { View, Text, Button, Icon, TextField } from 'reshaped';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../lib/store';
import { getSetting, verifyPassword } from '../../lib/db';

export default function PasswordGate() {
  const { setAuthenticated } = useStore();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError('');
    try {
      const hash = await getSetting('password_hash');
      if (!hash) { setAuthenticated(true); return; }
      const valid = await verifyPassword(password, hash);
      if (valid) setAuthenticated(true);
      else { setError('Incorrect password'); setPassword(''); }
    } catch { setError('An error occurred'); }
    setLoading(false);
  }

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--rs-color-background-neutral-default), var(--rs-color-background-neutral-faded))',
    }}>
      <div className="animate-scale-in" style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)',
        borderRadius: 20, padding: '3rem 2.5rem', width: '100%',
        maxWidth: 380, textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: 16, margin: '0 auto 1rem',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem',
        }}>🔒</div>
        <Text variant="display-2" weight="bold" style={{ color: 'var(--rs-color-foreground-primary-default)' }}>
          Habitt.
        </Text>
        <Text variant="body-2" color="neutral-faded" marginTop={1} marginBottom={6}>
          Enter your password to continue
        </Text>

        <form onSubmit={handleSubmit}>
          <div style={{ position: 'relative', marginBottom: 12 }}>
            <input
              type={showPwd ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
              disabled={loading}
              style={{
                width: '100%', padding: '12px 40px 12px 16px', borderRadius: 10,
                border: '2px solid var(--rs-color-border-neutral-faded)',
                background: 'var(--rs-color-background-neutral-faded)',
                color: 'var(--rs-color-foreground-neutral-default)',
                fontSize: '1rem', textAlign: 'center', letterSpacing: '0.25rem',
              }}
            />
            <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
              position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--rs-color-foreground-neutral-faded)',
            }}>
              {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <Button type="submit" color="primary" fullWidth size="large" disabled={!password || loading}>
            {loading ? 'Checking...' : 'Unlock'}
          </Button>
        </form>

        {error && (
          <View marginTop={3} padding={2} style={{
            background: 'rgba(239,68,68,0.08)', borderRadius: 8,
          }}>
            <Text variant="caption-1" color="critical">{error}</Text>
          </View>
        )}
      </div>
    </div>
  );
}
