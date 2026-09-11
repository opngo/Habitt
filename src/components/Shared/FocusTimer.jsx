import React, { useEffect, useMemo, useState } from 'react';
import { Play, Pause, Square, SkipForward, Timer, Volume2, VolumeX, Coffee, Brain } from 'lucide-react';
import { useStore } from '../../lib/store';
import { FOCUS_PRESETS, FOCUS_SOUNDS } from '../../lib/constants';
import Modal from './Modal';
import DynIcon from './DynIcon';

export default function FocusTimer() {
  const { timer, setUI, startTimer, pauseResumeTimer, timerSkip, stopTimer, setTimerSound, habits, focusSessions } = useStore();
  const [preset, setPreset] = useState(FOCUS_PRESETS[0]);
  const [custom, setCustom] = useState({ work: 25, shortBreak: 5, longBreak: 15, rounds: 4 });
  const [habitId, setHabitId] = useState(useStore.getState().focusTimerHabitId || '');
  const [now, setNow] = useState(Date.now());
  const [volume, setVolume] = useState(0.5);

  // 250ms clock for display
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, []);

  // ambient sound sync
  useEffect(() => {
    const kind = timer?.running ? (FOCUS_SOUNDS.find((s) => s.name === timer.sound)?.type || null) : null;
    if (kind) {
      import('../../lib/sound').then((m) => { m.ambient.start(kind, volume); });
    } else {
      import('../../lib/sound').then((m) => m.ambient.stop());
    }
    return () => { import('../../lib/sound').then((m) => m.ambient.stop()); };
  }, [timer?.sound, timer?.running, volume]);

  const secs = useMemo(() => {
    if (!timer) return { left: preset.work * 60, total: preset.work * 60 };
    const msLeft = timer.running ? Math.max(0, timer.endsAt - now) : (timer.remainingMs || 0);
    const totalMin = timer.phase === 'work' ? timer.preset.work : (timer.breakKind === 'long' ? timer.preset.longBreak : timer.preset.shortBreak);
    return { left: Math.ceil(msLeft / 1000), total: totalMin * 60 };
  }, [timer, now, preset]);

  const mm = String(Math.floor(secs.left / 60)).padStart(2, '0');
  const ss = String(secs.left % 60).padStart(2, '0');
  const frac = timer ? 1 - secs.left / Math.max(1, secs.total) : 0;
  const R = 105, C = 2 * Math.PI * R;
  const ringColor = !timer ? 'var(--accent)' : timer.phase === 'work' ? 'var(--accent)' : 'var(--cyan)';
  const todayMin = focusSessions.filter((f) => (f.started_at || '').slice(0, 10) === new Date().toISOString().slice(0, 10)).reduce((a, f) => a + (f.duration_minutes || 0), 0);

  const start = () => {
    const p = preset.name === 'Custom' ? { name: 'Custom', ...custom } : preset;
    startTimer(p, habitId || null);
  };

  return (
    <Modal
      title="Focus timer"
      icon={<Timer size={18} color="var(--accent)" />}
      onClose={() => setUI({ showFocusTimer: false })}
      footer={timer ? (
        <>
          <span style={{ marginRight: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 650 }}>
            Round {timer.round}/{timer.preset.rounds} · {timer.phase === 'work' ? 'focus' : 'break'} · {todayMin} min focused today
          </span>
          <button className="btn" onClick={timerSkip} title="Skip this phase"><SkipForward size={14} /></button>
          <button className="btn btn-danger" onClick={() => stopTimer()}><Square size={13} /> Stop</button>
          <button className="btn btn-primary" onClick={pauseResumeTimer}>{timer.running ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}</button>
        </>
      ) : (
        <>
          <span style={{ marginRight: 'auto', fontSize: '0.78rem', color: 'var(--text-faint)', fontWeight: 650 }}>{todayMin} min focused today</span>
          <button className="btn" onClick={() => setUI({ showFocusTimer: false })}>Close</button>
          <button className="btn btn-primary" onClick={start}><Play size={14} /> Start</button>
        </>
      )}
    >
      {/* ring */}
      <div className="focus-ring-wrap">
        <svg width="240" height="240" viewBox="0 0 240 240">
          <circle cx="120" cy="120" r={R} stroke="var(--surface-3)" strokeWidth="11" fill="none" />
          <circle cx="120" cy="120" r={R} stroke={ringColor} strokeWidth="11" fill="none" strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - Math.max(0, Math.min(1, frac)))} style={{ transition: 'stroke-dashoffset 0.25s linear' }} />
        </svg>
        <div className="focus-center">
          <div style={{ display: 'flex', gap: 5, alignItems: 'center', color: 'var(--text-faint)', fontWeight: 750, fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {timer?.phase === 'break' ? <Coffee size={13} color="var(--cyan)" /> : <Brain size={13} color="var(--accent)" />}
            {timer ? (timer.phase === 'work' ? 'Deep focus' : 'Break') : 'Ready'}
          </div>
          <div className="focus-time">{mm}:{ss}</div>
          {(() => {
            const hb = timer ? habits.find((h) => h.id === timer.habitId) : habits.find((h) => h.id === habitId);
            return hb ? <span className="chip" style={{ color: hb.color }}><DynIcon name={hb.icon} size={11} /> {hb.name}</span> : null;
          })()}
        </div>
      </div>

      {!timer && (
        <>
          <div className="field">
            <label className="field-label">Preset</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: 7 }}>
              {FOCUS_PRESETS.map((p) => (
                <button key={p.name} className={`mood-btn ${preset.name === p.name ? 'on' : ''}`} style={preset.name === p.name ? { borderColor: 'var(--accent)', background: 'var(--accent-soft)' } : {}} onClick={() => setPreset(p)}>
                  <DynIcon name={p.icon} size={16} color={preset.name === p.name ? 'var(--accent)' : undefined} />
                  <span style={{ fontWeight: 800 }}>{p.name}</span>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-faint)' }}>{p.work}m / {p.shortBreak}m · ×{p.rounds}</span>
                </button>
              ))}
            </div>
          </div>

          {preset.name === 'Custom' && (
            <div className="form-row-3" style={{ gridTemplateColumns: 'repeat(4,1fr)' }}>
              {[['work', 'Focus min'], ['shortBreak', 'Break'], ['longBreak', 'Long break'], ['rounds', 'Rounds']].map(([k, l]) => (
                <div className="field" key={k}>
                  <label className="field-label">{l}</label>
                  <input className="input" type="number" min="1" max="180" value={custom[k]} onChange={(e) => setCustom((c) => ({ ...c, [k]: Math.max(1, Number(e.target.value)) }))} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div className="form-row" style={{ alignItems: 'end' }}>
        {!timer && (
          <div className="field">
            <label className="field-label">Link a habit (optional)</label>
            <select className="select" value={habitId} onChange={(e) => setHabitId(e.target.value)}>
              <option value="">None</option>
              {habits.filter((h) => !h.archived).map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </div>
        )}
        <div className="field" style={{ flex: 1 }}>
          <label className="field-label">{timer ? 'Ambient sound' : 'Ambient sound'}</label>
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
            {FOCUS_SOUNDS.map((snd) => (
              <button key={snd.name} className={`chip chip-btn ${(!timer ? 'Silence' : timer.sound) === snd.name ? 'on' : ''}`}
                onClick={() => { if (timer) setTimerSound(snd.name); }}
                style={!timer ? { opacity: 0.5, cursor: 'default' } : {}}>
                {snd.name}
              </button>
            ))}
            {timer && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-faint)' }}>
                {timer.sound && timer.sound !== 'Silence' ? <Volume2 size={14} /> : <VolumeX size={14} />}
                <input type="range" min="0" max="1" step="0.05" value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ width: 70, accentColor: 'var(--accent)' }} />
              </span>
            )}
          </div>
          {!timer && <span style={{ fontSize: '0.68rem', color: 'var(--text-faint)', fontWeight: 600 }}>Sounds available while a session runs</span>}
        </div>
      </div>

      {focusSessions.length > 0 && !timer && (
        <div className="field">
          <label className="field-label">Recent sessions</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, maxHeight: 120, overflowY: 'auto' }}>
            {focusSessions.slice(0, 6).map((f) => {
              const hb = habits.find((h) => h.id === f.habit_id);
              return (
                <div key={f.id} className="chip" style={{ justifyContent: 'flex-start', padding: '6px 10px' }}>
                  <Timer size={10} color="var(--accent)" /> {f.duration_minutes} min{hb ? <> · <span style={{ color: hb.color }}>{hb.name}</span></> : null} · {new Date(f.started_at).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
