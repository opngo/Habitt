import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Play, Pause, SkipForward, Square, X, Coffee, Brain, ListTodo, Timer, Minus, Plus, Volume2, CloudRain, Waves, AudioLines } from 'lucide-react';
import { ambient } from '../../lib/sound';
import { useStore } from '../../lib/store';
import { FOCUS_PRESETS } from '../../lib/constants';
import DynIcon from './DynIcon';

/**
 * Full-screen focus timer — no modal, no popup.
 * Effects: drifting aurora blobs, glowing SVG progress ring with an orbiting
 * comet, floating blurred particles, shimmering gradient numerals, a ring
 * pulse whenever a round completes.
 */
export default function FocusView() {
  const { timer, startTimer, pauseResumeTimer, timerSkip, stopTimer, setUI, setView, habits, focusTimerHabitId, setTimerSound } = useStore();
  const soundOn = timer?.sound || null;
  const pickSound = (k) => {
    const next = soundOn === k ? null : k;
    setTimerSound(next);
    if (next) ambient.start(next, 0.45); else ambient.stop();
  };
  useEffect(() => {
    if (!timer) ambient.stop();
  }, [timer]);
  const [presetIdx, setPresetIdx] = useState(0);
  const [custom, setCustom] = useState(null); // {work, shortBreak, rounds}
  const [, force] = useState(0);
  const [flash, setFlash] = useState(false);
  const prevRound = useRef(0);

  const preset = (custom && presetIdx === FOCUS_PRESETS.length - 1 ? custom : FOCUS_PRESETS[presetIdx]) || FOCUS_PRESETS[0];
  const phase = timer?.phase || 'work';
  const isBreak = phase === 'break';
  const running = !!timer?.running;

  const phaseLen = timer ? (isBreak ? timer.preset.shortBreak : timer.preset.work) * 60000 : preset.work * 60000;
  const remainingMs = timer ? (running ? Math.max(0, timer.endsAt - Date.now()) : (timer.remainingMs ?? phaseLen)) : preset.work * 60000;
  const progress = timer ? Math.min(1, 1 - remainingMs / (timer._phaseLen || phaseLen)) : 0;

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => force((n) => n + 1), 250);
    return () => clearInterval(id);
  }, [running, timer?.endsAt]);

  // pulse when the round counter moves (a phase just completed)
  useEffect(() => {
    if (timer && timer.round !== prevRound.current) {
      prevRound.current = timer.round;
      setFlash(true);
      const t = setTimeout(() => setFlash(false), 900);
      return () => clearTimeout(t);
    }
    if (!timer) prevRound.current = 0;
    return undefined;
  }, [timer?.round, timer]);

  const mm = String(Math.floor(remainingMs / 60000)).padStart(2, '0');
  const ss = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');

  const R = 132;
  const CIRC = 2 * Math.PI * R;
  const habit = habits.find((h) => h.id === (timer?.habitId || focusTimerHabitId));

  const start = () => {
    const p = presetIdx === FOCUS_PRESETS.length - 1 && custom ? custom : FOCUS_PRESETS[presetIdx];
    startTimer({ name: p.name, work: p.work, shortBreak: p.shortBreak, longBreak: p.longBreak, rounds: p.rounds }, focusTimerHabitId);
  };

  const bump = (d) => {
    const base = { work: preset.work, shortBreak: preset.shortBreak, rounds: preset.rounds || 4 };
    setCustom({ ...base, work: Math.max(1, Math.min(180, base.work + d)) });
    setPresetIdx(FOCUS_PRESETS.length - 1);
  };

  const particles = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    left: (i * 37) % 100,
    top: (i * 53 + 11) % 100,
    dur: 9 + (i % 6) * 2.5,
    delay: -(i * 1.7),
    size: 3 + (i % 4) * 2,
    hue: i % 3,
  })), []);

  return (
    <div className={`focus-stage ${isBreak ? 'break' : ''}`}>
      <div className="aurora a1" /><div className="aurora a2" /><div className="aurora a3" /><div className="aurora a4" />
      <div className="focus-grain" />
      {particles.map((p, i) => (
        <span key={i} className="focus-particle" style={{ left: `${p.left}%`, top: `${p.top}%`, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s`, background: ['#6ee7b7', '#7dd3fc', '#c4b5fd'][p.hue] }} />
      ))}

      <button className="focus-exit" onClick={() => { stopTimer(); setView('dashboard'); }} title="Exit timer (Esc)"><X size={17} /></button>

      <div className="focus-inner">
        <div className="focus-head">
          <Timer size={14} /> <span>Habitt Focus</span>
          {timer && <span className="focus-round">round {Math.min(timer.round, timer.preset.rounds)}/{timer.preset.rounds} · {timer.preset.name}</span>}
        </div>

        <div className={`ring-wrap ${flash ? 'ringflash' : ''}`}>
          <div className="ring-halo" style={{ opacity: 0.2 + progress * 0.55 }} />
          <svg width="300" height="300" viewBox="0 0 300 300" className="ring-svg">
            <circle cx="150" cy="150" r={R} fill="none" stroke="rgba(255,255,255,0.09)" strokeWidth="11" />
            <circle
              cx="150" cy="150" r={R} fill="none" stroke="url(#ringgrad)" strokeWidth="11" strokeLinecap="round"
              strokeDasharray={CIRC} strokeDashoffset={CIRC * (1 - (timer ? progress : 0))}
              transform="rotate(-90 150 150)" className="ring-progress"
            />
            <defs>
              <linearGradient id="ringgrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#34d399" />
                <stop offset="50%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#a78bfa" />
              </linearGradient>
            </defs>
          </svg>
          {running && (
            <div className="ring-orbit" style={{ animationDuration: `${Math.max(8, phaseLen / 1000)}s` }}>
              <span className="comet" />
            </div>
          )}
          <div className="ring-center">
            <div className="focus-phase">
              {isBreak ? <Coffee size={13} /> : <Brain size={13} />} {isBreak ? 'Break' : 'Focus'}
            </div>
            <div className="focus-time grad-text">{mm}:{ss}</div>
            {!timer && (
              <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center', marginTop: 4 }}>
                <button className="step-btn" onClick={() => bump(-5)}><Minus size={12} /></button>
                <span style={{ fontSize: '0.74rem', fontWeight: 750, color: 'rgba(255,255,255,0.7)', minWidth: 56, textAlign: 'center' }}>{preset.work} min</span>
                <button className="step-btn" onClick={() => bump(5)}><Plus size={12} /></button>
              </div>
            )}
            {running && <div className="focus-elapsed">{Math.round(progress * 100)}% complete</div>}
            {!running && timer && <div className="focus-elapsed">paused</div>}
          </div>
        </div>

        {timer && (
          <div className="pips">
            {Array.from({ length: timer.preset.rounds }, (_, i) => (
              <span key={i} className={`pip ${i < timer.round - 1 || (!isBreak && i < timer.round - 1) ? 'on' : ''} ${i === timer.round - 1 && !isBreak ? 'now' : ''}`} />
            ))}
          </div>
        )}

        <div className="focus-controls">
          {!timer ? (
            <button className="btn-primary-glow" onClick={start}>
              <Play size={18} fill="currentColor" /> Start focusing
            </button>
          ) : (
            <>
              <button className="ctl ghost" onClick={() => timerSkip()} title="Skip this phase"><SkipForward size={16} /></button>
              <button className="btn-primary-glow" onClick={pauseResumeTimer}>
                {running ? <><Pause size={17} fill="currentColor" /> Pause</> : <><Play size={17} fill="currentColor" /> Resume</>}
              </button>
              <button className="ctl ghost" onClick={() => stopTimer()} title="Stop timer"><Square size={14} fill="currentColor" /></button>
            </>
          )}
        </div>

        {!timer && (
          <div className="preset-row">
            {FOCUS_PRESETS.map((p, i) => (
              <button key={p.name} className={`preset ${i === presetIdx ? 'on' : ''}`} onClick={() => { setPresetIdx(i); if (i !== FOCUS_PRESETS.length - 1) setCustom(null); }}>
                <DynIcon name={p.icon} size={12} /> {p.name}
                <span>{p.work}/{p.shortBreak} × {p.rounds}</span>
              </button>
            ))}
          </div>
        )}

        {timer && (
          <div className="sound-row">
            <Volume2 size={12} />
            {[['rain', 'Rain', CloudRain], ['ocean', 'Ocean', Waves], ['brown', 'Brown noise', AudioLines]].map(([k, label, Ic]) => (
              <button key={k} className={`chip chip-btn dark ${soundOn === k ? 'on' : ''}`} onClick={() => pickSound(k)}><Ic size={10} /> {label}</button>
            ))}
            {soundOn && <button className="chip chip-btn dark" onClick={() => pickSound(soundOn)}>stop sound</button>}
          </div>
        )}

        <div className="focus-link">
          {habit ? (
            <span className="chip linked">
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: habit.color }} />
              linked to <b>{habit.name}</b> — logging it at the end of each round
              <button onClick={() => setUI({ focusTimerHabitId: null })} title="Unlink"><X size={10} /></button>
            </span>
          ) : (
            habits.filter((h) => !h.archived).length > 0 && (
              <span style={{ display: 'inline-flex', gap: 7, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
                <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.45)', fontWeight: 700 }}><ListTodo size={11} style={{ verticalAlign: -2 }} /> link a habit</span>
                {habits.filter((h) => !h.archived).slice(0, 4).map((h) => (
                  <button key={h.id} className="chip chip-btn dark" onClick={() => setUI({ focusTimerHabitId: h.id })}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: h.color }} /> {h.name}
                  </button>
                ))}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}
