import React, { useEffect, useState } from 'react';
import {
  Settings, Sun, Moon, Database, Download, Upload, Trash2, HardDrive,
  FileJson, Check, AlertTriangle, Keyboard, Terminal, Save,
} from 'lucide-react';
import { useStore } from '../../lib/store';
import { getDataLocation } from '../../lib/storage';
import { isOllamaAvailable, getOllamaModels } from '../../lib/ollama';

export default function SettingsPage() {
  const { settings, setSetting, clearAllData, importData, addToast } = useStore();
  const [dataLoc, setDataLoc] = useState('…');
  const [savingState, setSavingState] = useState('checking');
  const [models, setModels] = useState([]);
  const [ollamaOk, setOllamaOk] = useState(null);

  useEffect(() => {
    (async () => {
      const loc = await getDataLocation();
      setDataLoc(loc || 'browser storage (localStorage)');
      setSavingState('ok');
      const ok = await isOllamaAvailable();
      setOllamaOk(ok);
      if (ok) getOllamaModels().then(setModels).catch(() => setModels([]));
    })();
  }, []);

  const exportJson = () => {
    const s = useStore.getState();
    const blob = new Blob([JSON.stringify(s.exportSnapshot(), null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `habitt-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    addToast({ type: 'success', message: 'Backup downloaded' });
  };

  const importJson = async (file) => {
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.app || !data.habits) throw new Error('Not a Habitt backup file');
      importData(data);
      addToast({ type: 'success', message: 'Backup restored' });
    } catch (e) {
      addToast({ type: 'error', message: `Import failed: ${e.message}` });
    }
  };

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ marginBottom: 18 }}>
        <h2 className="page-title"><Settings size={22} color="var(--text-muted)" /> Settings</h2>
        <p className="page-sub">Appearance, data and integrations.</p>
      </div>

      <section className="card card-pad set-sec">
        <h3 className="set-head"><Sun size={15} color="var(--amber)" /> Appearance</h3>
        <div className="set-row">
          <div>
            <b>Theme</b>
            <div className="set-sub">Light for daylight, dark for night-owl sessions.</div>
          </div>
          <button className="btn btn-sm" onClick={() => useStore.getState().toggleTheme()}>
            {settings.theme === 'dark' ? <><Moon size={13} /> Dark</> : <><Sun size={13} /> Light</>}
          </button>
        </div>
        <div className="set-row">
          <div>
            <b>Collapsible sidebar</b>
            <div className="set-sub">Collapse it any time with the button in the sidebar or Ctrl+B.</div>
          </div>
          <span className="chip"><Check size={10} /> always on</span>
        </div>
      </section>

      <section className="card card-pad set-sec">
        <h3 className="set-head"><Database size={15} color="var(--accent)" /> Your data</h3>
        <div className="set-row">
          <div style={{ minWidth: 0 }}>
            <b>Saved to</b>
            <div className="set-sub mono">
              {savingState === 'checking' ? 'checking…' : dataLoc}
            </div>
            <div className="set-sub">
              The Habitt desktop app keeps everything in <code>~/.habbitt/habits.json</code> — created automatically on first launch.
              In the browser version the same data lives in localStorage, mirrored for safety.
            </div>
          </div>
        </div>
        <div className="set-row">
          <div>
            <b>Export JSON backup</b>
            <div className="set-sub">Download habits, history, notes and journal as one file.</div>
          </div>
          <button className="btn btn-sm" onClick={exportJson}><Download size={13} /> Export</button>
        </div>
        <div className="set-row">
          <div>
            <b>Restore from backup</b>
            <div className="set-sub">Replaces everything with the backup file.</div>
          </div>
          <label className="btn btn-sm" style={{ cursor: 'pointer' }}>
            <Upload size={13} /> Import
            <input type="file" accept=".json,application/json" hidden onChange={(e) => e.target.files?.[0] && importJson(e.target.files[0])} />
          </label>
        </div>
        <div className="set-row">
          <div>
            <b style={{ color: 'var(--red, #ef4444)' }}>Delete everything</b>
            <div className="set-sub">Removes all local data. There is no undo.</div>
          </div>
          <button
            className="btn btn-sm danger-btn"
            onClick={() => {
              if (confirm('Delete ALL Habitt data on this device? This cannot be undone.')) {
                clearAllData();
                addToast({ type: 'info', message: 'All data cleared' });
              }
            }}
          >
            <Trash2 size={13} /> Clear
          </button>
        </div>
      </section>

      <section className="card card-pad set-sec">
        <h3 className="set-head"><Terminal size={15} color="var(--violet)" /> AI check-in (optional)</h3>
        <div className="set-row">
          <div>
            <b>Ollama nightly reflection</b>
            <div className="set-sub">
              {ollamaOk === null ? 'Checking local Ollama…' : ollamaOk
                ? `Ollama detected — ${models.length} model${models.length === 1 ? '' : 's'} available.`
                : 'Not running. Start `ollama serve` locally to enable this.'}
            </div>
          </div>
          <button
            className={`toggle ${settings.ollamaEnabled && ollamaOk ? 'on' : ''}`}
            disabled={!ollamaOk}
            onClick={() => setSetting('ollamaEnabled', !settings.ollamaEnabled)}
            aria-label="Toggle Ollama reflection"
          />
        </div>
        {settings.ollamaEnabled && ollamaOk && (
          <div className="field">
            <label className="field-label"><FileJson size={10} style={{ verticalAlign: -1 }} /> Model</label>
            <select className="select" value={settings.ollamaModel || 'llama3.2'} onChange={(e) => setSetting('ollamaModel', e.target.value)}>
              {(models.length ? models : ['llama3.2']).map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        )}
      </section>

      <section className="card card-pad set-sec">
        <h3 className="set-head"><Keyboard size={15} color="var(--blue)" /> Keyboard</h3>
        <div className="kbd-grid">
          {[
            ['Ctrl K', 'Command palette'], ['Ctrl N', 'New habit'], ['Ctrl J', 'Journal'],
            ['Ctrl F', 'Focus timer'], ['Ctrl Q', 'Quick check-in'], ['Ctrl B', 'Collapse sidebar'],
            ['Esc', 'Close / back to dashboard'], ['Enter', 'Save current note'],
          ].map(([k, v]) => (
            <div key={k} className="kbd-row"><kbd>{k}</kbd><span>{v}</span></div>
          ))}
        </div>
      </section>

      <p className="set-foot">
        <HardDrive size={11} style={{ verticalAlign: -1 }} /> Habitt stores everything on this device. No accounts, no cloud, no tracking.
      </p>
    </div>
  );
}
