import React, { useState } from 'react';
import { View, Text, Button, Icon, Badge, Divider } from 'reshaped';
import { Sun, Moon, Lock, Unlock, Download, Upload, Shield, Eye, EyeOff, Plus, Trash2, Palette } from 'lucide-react';
import { useStore } from '../../lib/store';
import { saveSetting, getSetting, hashPassword, verifyPassword, createSubject, updateSubject, deleteSubject } from '../../lib/db';
import { downloadObsidianVault } from '../../lib/obsidian';
import DynIcon from '../Shared/DynIcon';
import IconPicker from '../Shared/IconPicker';
import ColorPicker from '../Shared/ColorPicker';
import { COLORS, HABIT_ICON_NAMES } from '../../lib/constants';

export default function SettingsPage({ refreshData }) {
  const { colorMode, setColorMode, passwordEnabled, setPasswordEnabled, habits, completions, journalEntries, tasks, subjects, addToast } = useStore();
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ name: '', color: '#3b82f6', icon: 'BookOpen' });
  const [showIconPicker, setShowIconPicker] = useState(false);

  async function toggleTheme() {
    const m = colorMode === 'light' ? 'dark' : 'light';
    setColorMode(m); await saveSetting('theme', m);
    addToast({ type: 'info', message: `Theme changed to ${m}` });
  }

  async function setPassword() {
    if (newPwd.length < 4) { setPwdMsg('Min 4 characters'); return; }
    if (newPwd !== confirmPwd) { setPwdMsg('Passwords do not match'); return; }
    await saveSetting('password_hash', await hashPassword(newPwd));
    setPasswordEnabled(true); setPwdMsg('Password set!'); setNewPwd(''); setConfirmPwd('');
    addToast({ type: 'success', message: 'Password enabled' });
  }

  async function removePassword() {
    if (!currentPwd) { setPwdMsg('Enter current password'); return; }
    const valid = await verifyPassword(currentPwd, await getSetting('password_hash'));
    if (!valid) { setPwdMsg('Incorrect'); return; }
    await saveSetting('password_hash', ''); setPasswordEnabled(false); setCurrentPwd('');
    addToast({ type: 'info', message: 'Password removed' });
  }

  function exportData() {
    const data = { habits, completions, journalEntries, tasks, subjects, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `habitt-export-${new Date().toISOString().split('T')[0]}.json`; a.click();
    addToast({ type: 'success', message: 'Data exported!' });
  }

  function exportObsidian() {
    downloadObsidianVault(journalEntries, habits, completions, tasks);
    addToast({ type: 'success', message: 'Obsidian vault exported!' });
  }

  async function handleSaveSubject() {
    if (!subjectForm.name.trim()) return;
    if (editingSubject) { await updateSubject(editingSubject.id, subjectForm); }
    else { await createSubject(subjectForm); }
    await refreshData();
    setShowSubjectForm(false); setEditingSubject(null);
    setSubjectForm({ name: '', color: '#3b82f6', icon: 'BookOpen' });
    addToast({ type: 'success', message: editingSubject ? 'Subject updated' : 'Subject created' });
  }

  async function handleDeleteSubject(id) {
    if (confirm('Delete this subject? Associated homework will also be removed.')) {
      await deleteSubject(id); await refreshData();
      addToast({ type: 'info', message: 'Subject deleted' });
    }
  }

  const inputStyle = { padding: '8px 12px', borderRadius: 12, width: '100%', border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', color: 'var(--rs-color-foreground-neutral-default)', fontSize: '0.875rem' };

  return (
    <div className="animate-fade-in" style={{ maxWidth: 750 }}>
      <Text variant="title-1" weight="bold" marginBottom={1}>Settings</Text>
      <Text variant="body-2" color="neutral-faded" marginBottom={6}>Customize your Habitt experience</Text>

      {/* Appearance */}
      <View padding={5} marginBottom={4} style={{ background: 'var(--rs-color-background-neutral-default)', border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 16 }}>
        <Text variant="title-3" weight="bold" marginBottom={4}>Appearance</Text>
        <View direction="row" align="center" style={{ justifyContent: 'space-between' }}>
          <View><Text variant="body-2" weight="bold">Theme</Text><Text variant="caption-1" color="neutral-faded">Light or dark mode</Text></View>
          <Button variant="faded" color="neutral" startIcon={<Icon svg={colorMode==='light'?<Sun size={16}/>:<Moon size={16}/>} />} onClick={toggleTheme}>
            {colorMode==='light'?'Light':'Dark'}
          </Button>
        </View>
      </View>

      {/* Subjects (for Homework) */}
      <View padding={5} marginBottom={4} style={{ background: 'var(--rs-color-background-neutral-default)', border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 16 }}>
        <View direction="row" align="center" gap={2} marginBottom={4} style={{ justifyContent: 'space-between' }}>
          <Text variant="title-3" weight="bold">Subjects</Text>
          <Button size="small" color="primary" onClick={() => { setShowSubjectForm(!showSubjectForm); setEditingSubject(null); setSubjectForm({ name: '', color: '#3b82f6', icon: 'BookOpen' }); }}
            startIcon={<Icon svg={<Plus size={14} />} />}>Add Subject</Button>
        </View>
        <Text variant="caption-1" color="neutral-faded" marginBottom={3}>Subjects are used to color-code homework assignments</Text>

        {showSubjectForm && (
          <View padding={4} marginBottom={3} className="animate-slide-up" style={{ background: 'var(--rs-color-background-neutral-faded)', borderRadius: 14 }}>
            <View gap={3}>
              <input value={subjectForm.name} onChange={e => setSubjectForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Subject name (e.g. Mathematics)" style={inputStyle} autoFocus />
              <View>
                <Text variant="caption-1" weight="bold" color="neutral-faded" marginBottom={2}>Color</Text>
                <ColorPicker selected={subjectForm.color} onSelect={c => setSubjectForm(f => ({ ...f, color: c }))} />
              </View>
              <View>
                <Text variant="caption-1" weight="bold" color="neutral-faded" marginBottom={2}>Icon</Text>
                <button onClick={() => setShowIconPicker(!showIconPicker)} style={{
                  display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', borderRadius: 12,
                  border: '1px solid var(--rs-color-border-neutral-faded)', background: 'var(--rs-color-background-neutral-default)', cursor: 'pointer',
                }}>
                  <DynIcon name={subjectForm.icon} size={20} color={subjectForm.color} />
                  <Text variant="body-3">{subjectForm.icon}</Text>
                </button>
                {showIconPicker && <div style={{ marginTop: 8 }}><IconPicker selected={subjectForm.icon} onSelect={n => { setSubjectForm(f => ({ ...f, icon: n })); setShowIconPicker(false); }} color={subjectForm.color} /></div>}
              </View>
              <View direction="row" gap={2} style={{ justifyContent: 'flex-end' }}>
                <Button variant="faded" color="neutral" onClick={() => setShowSubjectForm(false)}>Cancel</Button>
                <Button color="primary" onClick={handleSaveSubject}>Save Subject</Button>
              </View>
            </View>
          </View>
        )}

        <View gap={2}>
          {subjects.length === 0 ? (
            <Text variant="body-3" color="neutral-faded" style={{ fontStyle: 'italic' }}>No subjects yet. Add your school subjects above.</Text>
          ) : subjects.map(sub => (
            <View key={sub.id} direction="row" align="center" gap={3} padding={3} style={{
              borderRadius: 12, border: '1px solid var(--rs-color-border-neutral-faded)',
              borderLeft: `4px solid ${sub.color}`,
            }}>
              <DynIcon name={sub.icon || 'BookOpen'} size={20} color={sub.color} />
              <Text variant="body-2" weight="bold" style={{ flex: 1, color: sub.color }}>{sub.name}</Text>
              <button onClick={() => { setEditingSubject(sub); setSubjectForm({ name: sub.name, color: sub.color, icon: sub.icon || 'BookOpen' }); setShowSubjectForm(true); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-neutral-faded)', fontSize: '0.75rem', fontWeight: 600 }}>Edit</button>
              <button onClick={() => handleDeleteSubject(sub.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rs-color-foreground-critical-default)' }}>
                <Trash2 size={14} />
              </button>
            </View>
          ))}
        </View>
      </View>

      {/* Password */}
      <View padding={5} marginBottom={4} style={{ background: 'var(--rs-color-background-neutral-default)', border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 16 }}>
        <Text variant="title-3" weight="bold" marginBottom={2}>Password Protection</Text>
        <Text variant="caption-1" color="neutral-faded" marginBottom={4}>Optionally protect with a password</Text>
        {passwordEnabled ? (
          <View gap={3}>
            <View padding={3} style={{ background: 'rgba(34,197,94,0.08)', borderRadius: 10 }}><Text variant="body-3" color="success">Password enabled</Text></View>
            <input type={showPwd?'text':'password'} value={currentPwd} onChange={e=>setCurrentPwd(e.target.value)} placeholder="Current password" style={inputStyle} />
            <Button variant="faded" color="critical" onClick={removePassword} startIcon={<Icon svg={<Unlock size={14}/>} />}>Remove</Button>
          </View>
        ) : (
          <View gap={3}>
            <input type="password" value={newPwd} onChange={e=>setNewPwd(e.target.value)} placeholder="New password (min 4)" style={inputStyle} />
            <input type="password" value={confirmPwd} onChange={e=>setConfirmPwd(e.target.value)} placeholder="Confirm" style={inputStyle} />
            <Button color="primary" onClick={setPassword} startIcon={<Icon svg={<Lock size={14}/>} />}>Set Password</Button>
          </View>
        )}
        {pwdMsg && <Text variant="caption-1" color={pwdMsg.includes('set')||pwdMsg.includes('removed')?'success':'critical'} marginTop={2}>{pwdMsg}</Text>}
      </View>

      {/* Data */}
      <View padding={5} marginBottom={4} style={{ background: 'var(--rs-color-background-neutral-default)', border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 16 }}>
        <Text variant="title-3" weight="bold" marginBottom={4}>Data Management</Text>
        <View direction="row" gap={2} marginBottom={4} style={{ flexWrap: 'wrap' }}>
          <Button variant="faded" color="neutral" onClick={exportData} startIcon={<Icon svg={<Download size={14}/>} />}>Export JSON</Button>
          <Button variant="faded" color="neutral" onClick={exportObsidian} startIcon={<Icon svg={<Download size={14}/>} />}>Export Obsidian Vault</Button>
          <Button variant="faded" color="neutral" onClick={() => {
            const input = document.createElement('input'); input.type='file'; input.accept='.json';
            input.onchange = async (e) => { addToast({ type: 'info', message: 'Import coming soon!' }); };
            input.click();
          }} startIcon={<Icon svg={<Upload size={14}/>} />}>Import</Button>
        </View>
        <View direction="row" gap={6}>
          {[{v:habits.length,l:'Habits'},{v:completions.length,l:'Completions'},{v:journalEntries.length,l:'Journals'},{v:tasks.length,l:'Tasks'},{v:subjects.length,l:'Subjects'}].map((s,i)=>(
            <View key={i} align="center"><Text variant="display-2" weight="bold" color="primary">{s.v}</Text><Text variant="caption-1" color="neutral-faded">{s.l}</Text></View>
          ))}
        </View>
      </View>

      {/* About */}
      <View padding={5} style={{ background: 'var(--rs-color-background-neutral-default)', border: '1px solid var(--rs-color-border-neutral-faded)', borderRadius: 16 }}>
        <Text variant="title-3" weight="bold" marginBottom={3}>About</Text>
        <Text variant="body-2"><strong>Habitt</strong> v1.0.0</Text>
        <Text variant="body-3" color="neutral-faded" marginTop={1}>Privacy-first habit tracker. All data local. No cloud, no ads.</Text>
        <Text variant="caption-1" color="neutral-faded" marginTop={2}>React + Reshaped UI + Lucide Icons + Tauri + SQLite + Ollama AI</Text>
      </View>
    </div>
  );
}
