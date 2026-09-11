import React, { useRef, useState } from 'react';
import {
  Settings as SettingsIcon, Sun, Moon, Upload, DatabaseZap, Trash2, Cpu,
  RefreshCw, CheckCircle2, XCircle, FileJson, HardDriveDownload, Info,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { isOllamaAvailable, getOllamaModels } from '../../lib/ollama';
import { buildVault, vaultToMarkdown, download } from '../../lib/obsidian';

export default function SettingsPage({ theme, onToggleTheme }) {
  const s = useStore();
  const fileRef = useRef(null);
  const [aiState, setAiState] = useState(null); // null | 'checking' | {ok, models}

  const exportJson = () => {
    const snap = s.exportSnapshot();
    download(`habitt-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(snap, null, 2), 'application/json');
    s.setSetting('exported', true);
    s.addToast({ type: 'success', message: 'Backup exported' });
    s.checkAchievements();
  };

  const exportVault = () => {
    const files = buildVault(s);
    download(`habitt-vault-${new Date().toISOString().slice(0, 10)}.md`, vaultToMarkdown(files));
    s.setSetting('exported', true);
    s.addToast({ type: 'success', message: `Obsidian vault exported — ${files.length} notes` });
    s.checkAchievements();
  };

  const importJson = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        if (!data || typeof data !== 'object' || !('habits' in data)) throw new Error('bad format');
        s.importData(data);
        setTimeout(() => s.checkAchievements(), 100);
      } catch {
        s.addToast({ type: 'error', message: 'That file is not a valid Habitt backup' });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const checkAI = async () => {
    setAiState('checking');
    const ok = await isOllamaAvailable();
    const models = ok ? await getOllamaModels() : [];
    setAiState({ ok, models });
  };

  const counts = [
    { l: 'Habits', v: s.habits.length }, { l: 'Check-ins', v: s.completions.length },
    { l: 'Journal', v: s.journalEntries.length }, { l: 'Tasks', v: s.tasks.length },
    { l: 'Homework', v: s.homework.length }, { l: 'Notes', v: s.notes.length },
    { l: 'Day notes', v: s.dayNotes.length }, { l: 'Focus (min)', v: s.focusSessions.reduce((a, f) => a + (f.duration_minutes || 0), 0) },
  ];
  const bytes = (() => { try { return new Blob([JSON.stringify(useStore.getState(), (k, v) => (typeof v === 'function' ? undefined : v))]).size; } catch { return 0; } })();

  return (
    <div style={{ maxWidth: 780 }}>
      <div className="page-head">
        <h2 className="page-title"><SettingsIcon size={22} color="var(--text-muted)" /> Settings</h2>
        <p className="page-sub">Everything lives on this device. No accounts, no cloud, no tracking.</p>
      </div>

      <Section icon={<span style={{ fontSize: 16 }}>🎨</span>} title="Appearance">
        <Row title="Theme" desc="Light or dark — follows your system by default until you choose.">
          <button className="btn" onClick={onToggleTheme}>{theme === 'dark' ? <Moon size={15} /> : <Sun size={15} />} {theme === 'dark' ? 'Dark' : 'Light'}</button>
        </Row>
      </Section>

      <Section icon={<Cpu size={16} color="var(--violet)" />} title="Local AI (Ollama)">
        <Row title="Use Ollama for journal reflections" desc="If Ollama is running on this machine (localhost:11434), your daily reflection is generated locally by a model. Without it, a built-in on-device engine writes the reflection instead — the app never phones home.">
          <label className="switch">
            <input type="checkbox" checked={!!s.settings.ollamaEnabled} onChange={(e) => s.setSetting('ollamaEnabled', e.target.checked)} />
            <span className="track" /><span className="thumb" />
          </label>
        </Row>
        <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn btn-sm" onClick={checkAI} disabled={aiState === 'checking'}>
            {aiState === 'checking' ? <span className="spinner" /> : <RefreshCw size={13} />} Test connection
          </button>
          {aiState && aiState !== 'checking' && (aiState.ok ? (
            <>
              <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--accent)', fontWeight: 700, fontSize: '0.8rem' }}><CheckCircle2 size={14} /> Online · {aiState.models.length} models</span>
              <select className="select" style={{ width: 220, padding: '6px 10px', fontSize: '0.8rem' }} value={s.settings.ollamaModel || ''} onChange={(e) => s.setSetting('ollamaModel', e.target.value)}>
                <option value="">Auto (llama3.2)</option>
                {aiState.models.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
              </select>
            </>
          ) : (
            <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: 'var(--text-faint)', fontWeight: 650, fontSize: '0.8rem' }}><XCircle size={14} /> Not running — falling back to built-in reflections</span>
          ))}
        </div>
      </Section>

      <Section icon={<DatabaseZap size={16} color="var(--blue)" />} title="Data">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 10, margin: '4px 0 14px' }}>
          {counts.map((c) => (
            <div key={c.l} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', textAlign: 'center' }}>
              <div style={{ fontWeight: 850, fontSize: '1.15rem' }}>{c.v}</div>
              <div style={{ fontSize: '0.64rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-faint)', fontWeight: 750 }}>{c.l}</div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn" onClick={exportJson}><FileJson size={14} /> Export JSON backup</button>
          <button className="btn" onClick={exportVault}><HardDriveDownload size={14} /> Export Obsidian vault (.md)</button>
          <button className="btn" onClick={() => fileRef.current?.click()}><Upload size={14} /> Import backup</button>
          <input ref={fileRef} type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={importJson} />
        </div>
        <p style={{ fontSize: '0.72rem', color: 'var(--text-faint)', margin: '10px 0 0', fontWeight: 600 }}>
          {bytes > 0 ? `Local database: ${(bytes / 1024).toFixed(1)} KB in your browser/app storage.` : ''} The vault export uses `%% ── FILE: path ── %%` separators so you can split it into Obsidian notes.
        </p>
        <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
          <Row title="Danger zone" desc="Deletes habits, history, journal, tasks, notes, XP — everything. Export first.">
            <button className="btn btn-danger" onClick={() => { if (confirm('Really delete ALL Habitt data? This cannot be undone.') && confirm('Are you absolutely sure?')) { s.clearAllData(); } }}>
              <Trash2 size={14} /> Clear all data
            </button>
          </Row>
        </div>
      </Section>

      <Section icon={<Info size={16} color="var(--amber)" />} title="About">
        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <b style={{ color: 'var(--text)' }}>Habitt.</b> v2.0.0 — a privacy-first habit tracker with heatmaps, streaks, journaling, tasks, homework, notes, a focus timer, XP and achievements.
          Built with React, Vite and Tauri. Your data is stored locally (SQLite in the desktop app, browser storage on the web).
        </p>
      </Section>
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <section className="card card-pad" style={{ marginBottom: 16 }}>
      <h3 style={{ margin: '0 0 10px', fontSize: '0.92rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8 }}>{icon} {title}</h3>
      {children}
    </section>
  );
}

function Row({ title, desc, children }) {
  return (
    <div className="settings-row">
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 750, fontSize: '0.88rem' }}>{title}</div>
        {desc && <div style={{ fontSize: '0.76rem', color: 'var(--text-faint)', marginTop: 2, lineHeight: 1.45, maxWidth: 480 }}>{desc}</div>}
      </div>
      {children}
    </div>
  );
}
