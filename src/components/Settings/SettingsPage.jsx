import React, { useState } from 'react';
import { View, Text, Button, Icon, Switch, Divider } from 'reshaped';
import { Sun, Moon, Lock, Unlock, Download, Upload, Database, Shield, Trash2, Eye, EyeOff } from 'lucide-react';
import { useStore } from '../../lib/store';
import { saveSetting, getSetting, hashPassword, verifyPassword } from '../../lib/db';

export default function SettingsPage({ refreshData }) {
  const { colorMode, setColorMode, passwordEnabled, setPasswordEnabled,
    habits, completions, journalEntries, addToast } = useStore();

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  async function toggleTheme() {
    const newMode = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(newMode);
    await saveSetting('theme', newMode);
    addToast({ type: 'info', message: `${newMode === 'dark' ? '🌙' : '☀️'} Theme changed to ${newMode}` });
  }

  async function setPassword() {
    if (newPwd.length < 4) { setPwdMsg('Password must be at least 4 characters'); return; }
    if (newPwd !== confirmPwd) { setPwdMsg('Passwords do not match'); return; }
    const hash = await hashPassword(newPwd);
    await saveSetting('password_hash', hash);
    setPasswordEnabled(true);
    setPwdMsg('✅ Password set successfully!');
    setNewPwd(''); setConfirmPwd('');
    addToast({ type: 'success', message: '🔒 Password protection enabled' });
  }

  async function removePassword() {
    if (!currentPwd) { setPwdMsg('Enter your current password'); return; }
    const savedHash = await getSetting('password_hash');
    const valid = await verifyPassword(currentPwd, savedHash);
    if (!valid) { setPwdMsg('Incorrect password'); return; }
    await saveSetting('password_hash', '');
    setPasswordEnabled(false);
    setPwdMsg('Password removed');
    setCurrentPwd('');
    addToast({ type: 'info', message: '🔓 Password protection removed' });
  }

  function exportData() {
    const data = {
      habits, completions, journalEntries,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitt-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    addToast({ type: 'success', message: '📤 Data exported successfully!' });
  }

  const inputStyle = {
    padding: '8px 12px', borderRadius: 8, width: '100%',
    border: '1px solid var(--rs-color-border-neutral-faded)',
    background: 'var(--rs-color-background-neutral-default)',
    color: 'var(--rs-color-foreground-neutral-default)',
    fontSize: '0.875rem',
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 700 }}>
      <View marginBottom={6}>
        <Text variant="title-1" weight="bold">Settings</Text>
        <Text variant="body-2" color="neutral-faded">Customize your Habitt. experience</Text>
      </View>

      {/* Appearance */}
      <View padding={5} marginBottom={4} style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 12,
      }}>
        <Text variant="title-3" weight="bold" marginBottom={4}>🎨 Appearance</Text>
        <View direction="row" align="center" style={{ justifyContent: 'space-between' }}>
          <View>
            <Text variant="body-2" weight="bold">Theme</Text>
            <Text variant="caption-1" color="neutral-faded">Switch between light and dark mode</Text>
          </View>
          <Button
            variant="faded"
            color="neutral"
            startIcon={<Icon svg={colorMode === 'light' ? <Sun size={16} /> : <Moon size={16} />} />}
            onClick={toggleTheme}
          >
            {colorMode === 'light' ? 'Light' : 'Dark'}
          </Button>
        </View>
      </View>

      {/* Password */}
      <View padding={5} marginBottom={4} style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 12,
      }}>
        <Text variant="title-3" weight="bold" marginBottom={2}>🔒 Password Protection</Text>
        <Text variant="caption-1" color="neutral-faded" marginBottom={4}>
          Optionally protect your habits and journal with a password
        </Text>

        {passwordEnabled ? (
          <View gap={3}>
            <View padding={3} style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 8, border: '1px solid rgba(34,197,94,0.2)' }}>
              <Text variant="body-3" color="success">✓ Password protection is enabled</Text>
            </View>
            <div style={{ position: 'relative' }}>
              <input type={showPwd ? 'text' : 'password'} value={currentPwd} onChange={e => setCurrentPwd(e.target.value)}
                placeholder="Current password" style={inputStyle} />
              <button onClick={() => setShowPwd(!showPwd)} style={{
                position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)',
              }}>{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
            <Button variant="faded" color="critical" startIcon={<Icon svg={<Unlock size={14} />} />} onClick={removePassword}>
              Remove Password
            </Button>
          </View>
        ) : (
          <View gap={3}>
            <View padding={3} style={{ background: 'var(--rs-color-background-neutral-faded)', borderRadius: 8 }}>
              <Text variant="body-3" color="neutral-faded">Password protection is disabled</Text>
            </View>
            <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)}
              placeholder="New password (min 4 chars)" style={inputStyle} />
            <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
              placeholder="Confirm password" style={inputStyle} />
            <Button color="primary" startIcon={<Icon svg={<Lock size={14} />} />} onClick={setPassword}>
              Set Password
            </Button>
          </View>
        )}
        {pwdMsg && (
          <View marginTop={2} padding={2} style={{
            background: pwdMsg.includes('✅') || pwdMsg.includes('removed') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            borderRadius: 6,
          }}>
            <Text variant="caption-1" color={pwdMsg.includes('✅') || pwdMsg.includes('removed') ? 'success' : 'critical'}>
              {pwdMsg}
            </Text>
          </View>
        )}
      </View>

      {/* Data Management */}
      <View padding={5} marginBottom={4} style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 12,
      }}>
        <Text variant="title-3" weight="bold" marginBottom={4}>💾 Data Management</Text>
        <View direction="row" gap={3} marginBottom={4}>
          <Button variant="faded" color="neutral" startIcon={<Icon svg={<Download size={14} />} />} onClick={exportData}>
            Export Data
          </Button>
          <Button variant="faded" color="neutral" startIcon={<Icon svg={<Upload size={14} />} />} onClick={() => {
            const input = document.createElement('input');
            input.type = 'file'; input.accept = '.json';
            input.onchange = async (e) => {
              addToast({ type: 'info', message: '📥 Import feature coming soon!' });
            };
            input.click();
          }}>
            Import Data
          </Button>
        </View>
        <View direction="row" gap={6}>
          {[
            { value: habits.length, label: 'Habits' },
            { value: completions.length, label: 'Completions' },
            { value: journalEntries.length, label: 'Journal Entries' },
          ].map((s, i) => (
            <View key={i} align="center">
              <Text variant="display-2" weight="bold" color="primary">{s.value}</Text>
              <Text variant="caption-1" color="neutral-faded">{s.label}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* About */}
      <View padding={5} style={{
        background: 'var(--rs-color-background-neutral-default)',
        border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 12,
      }}>
        <Text variant="title-3" weight="bold" marginBottom={3}>About</Text>
        <View gap={2}>
          <Text variant="body-2"><strong>Habitt.</strong> v1.0.0</Text>
          <Text variant="body-3" color="neutral-faded">
            A beautiful, privacy-first habit tracker for your desktop.
          </Text>
          <Text variant="body-3" color="neutral-faded">
            All data is stored locally on your device. No cloud, no tracking, no ads.
          </Text>
          <Text variant="caption-1" color="neutral-faded" marginTop={2}>
            Built with React, Reshaped UI, Lucide Icons, Tauri, and SQLite.
          </Text>
        </View>
      </View>
    </div>
  );
}
