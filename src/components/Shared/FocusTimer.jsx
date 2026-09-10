import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, Button, Icon } from 'reshaped';
import { X, Play, Pause, RotateCcw, Timer, Coffee, Zap, VolumeX, Volume2, Check, SkipForward } from 'lucide-react';
import { useStore } from '../../lib/store';
import { saveFocusSession } from '../../lib/db';
import { FOCUS_PRESETS, FOCUS_SOUNDS } from '../../lib/constants';
import DynIcon from '../Shared/DynIcon';

export default function FocusTimer({ refreshData }) {
  const { habits, setShowFocusTimer, focusTimerHabitId, addToast, addXp, unlockAchievement, focusSessions } = useStore();

  const [preset, setPreset] = useState(FOCUS_PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState(preset.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const [currentRound, setCurrentRound] = useState(1);
  const [totalFocused, setTotalFocused] = useState(0);
  const [sound, setSound] = useState(FOCUS_SOUNDS[0]);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const habit = habits.find(h => h.id === focusTimerHabitId);

  // Timer tick
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handlePhaseComplete();
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning, timeLeft]);

  function handlePhaseComplete() {
    setIsRunning(false);
    clearInterval(intervalRef.current);

    if (phase === 'work') {
      const durationMin = preset.work;
      setTotalFocused(t => t + durationMin);

      // Save session
      saveFocusSession({
        habit_id: focusTimerHabitId,
        started_at: startTimeRef.current || new Date().toISOString(),
        duration_minutes: durationMin,
        completed: true,
        notes: `Round ${currentRound}/${preset.rounds}`,
      });

      addXp(15);
      addToast({ type: 'success', message: `Focus session complete! +15 XP` });

      if (focusSessions.length === 0) unlockAchievement('focus_session');
      if (focusSessions.length >= 9) unlockAchievement('focus_10');

      // Move to break
      if (currentRound >= preset.rounds) {
        setPhase('longBreak');
        setTimeLeft(preset.longBreak * 60);
      } else {
        setPhase('shortBreak');
        setTimeLeft(preset.shortBreak * 60);
      }
    } else {
      // Break is over, back to work
      if (phase === 'longBreak') {
        setCurrentRound(1);
      } else {
        setCurrentRound(r => r + 1);
      }
      setPhase('work');
      setTimeLeft(preset.work * 60);
    }
  }

  function toggleTimer() {
    if (!isRunning) {
      startTimeRef.current = new Date().toISOString();
    }
    setIsRunning(!isRunning);
  }

  function resetTimer() {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setTimeLeft(preset.work * 60);
    setPhase('work');
    setCurrentRound(1);
    setTotalFocused(0);
  }

  function skipPhase() {
    handlePhaseComplete();
  }

  function changePreset(p) {
    setPreset(p);
    setTimeLeft(p.work * 60);
    setPhase('work');
    setCurrentRound(1);
    setIsRunning(false);
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalTime = phase === 'work' ? preset.work * 60 : phase === 'shortBreak' ? preset.shortBreak * 60 : preset.longBreak * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const phaseColors = {
    work: '#22c55e',
    shortBreak: '#3b82f6',
    longBreak: '#8b5cf6',
  };

  const phaseLabels = {
    work: 'Focus Time',
    shortBreak: 'Short Break',
    longBreak: 'Long Break',
  };

  const phaseIcons = {
    work: 'Focus',
    shortBreak: 'Coffee',
    longBreak: 'Sparkles',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
      backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 10000,
    }} onClick={(e) => e.target === e.currentTarget && setShowFocusTimer(false)}>
      <div className="animate-scale-in" style={{
        background: 'var(--rs-color-background-neutral-default)',
        borderRadius: 24, width: '100%', maxWidth: 440,
        boxShadow: '0 32px 80px rgba(0,0,0,0.2)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <View direction="row" align="center" padding={4} style={{
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--rs-color-border-neutral-faded)',
        }}>
          <View direction="row" gap={2} align="center">
            <Timer size={18} color={phaseColors[phase]} />
            <Text variant="title-3" weight="bold">Focus Timer</Text>
          </View>
          <button onClick={() => setShowFocusTimer(false)} style={{
            width: 32, height: 32, borderRadius: 10, border: 'none', cursor: 'pointer',
            background: 'var(--rs-color-background-neutral-faded)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><X size={16} /></button>
        </View>

        {/* Timer Circle */}
        <View align="center" padding={6} style={{ position: 'relative' }}>
          {/* Habit name */}
          {habit && (
            <View direction="row" gap={2} align="center" marginBottom={4}>
              <DynIcon name={habit.icon} size={16} color={habit.color} />
              <Text variant="body-2" weight="bold">{habit.name}</Text>
            </View>
          )}

          {/* Circle progress */}
          <div style={{ position: 'relative', width: 200, height: 200 }}>
            <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="100" cy="100" r="88" fill="none" stroke="var(--rs-color-background-neutral-faded)" strokeWidth="8" />
              <circle cx="100" cy="100" r="88" fill="none" stroke={phaseColors[phase]} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
            }}>
              <Text variant="display-1" weight="bold" style={{ fontVariantNumeric: 'tabular-nums' }}>
                {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
              </Text>
              <View direction="row" gap={1} align="center" marginTop={1}>
                <DynIcon name={phaseIcons[phase]} size={14} color={phaseColors[phase]} />
                <Text variant="caption-1" color="neutral-faded" weight="bold">{phaseLabels[phase]}</Text>
              </View>
            </div>
          </div>

          {/* Round indicator */}
          <View direction="row" gap={2} align="center" marginTop={4}>
            {Array.from({ length: preset.rounds }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: 99,
                background: i < currentRound - (phase === 'work' ? 1 : 0) ? phaseColors[phase] : 'var(--rs-color-background-neutral-faded)',
                transition: 'background 0.3s',
              }} />
            ))}
          </View>
        </View>

        {/* Controls */}
        <View direction="row" gap={3} align="center" style={{ justifyContent: 'center', paddingBottom: '1rem' }}>
          <button onClick={resetTimer} style={{
            width: 44, height: 44, borderRadius: 14, border: '1px solid var(--rs-color-border-neutral-faded)',
            background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><RotateCcw size={18} /></button>

          <button onClick={toggleTimer} style={{
            width: 64, height: 64, borderRadius: 20,
            background: phaseColors[phase], border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', boxShadow: `0 4px 16px ${phaseColors[phase]}40`,
            transition: 'all 0.2s',
          }}>
            {isRunning ? <Pause size={24} /> : <Play size={24} style={{ marginLeft: 2 }} />}
          </button>

          <button onClick={skipPhase} style={{
            width: 44, height: 44, borderRadius: 14, border: '1px solid var(--rs-color-border-neutral-faded)',
            background: 'var(--rs-color-background-neutral-faded)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><SkipForward size={18} /></button>
        </View>

        {/* Presets */}
        <View padding={4} style={{ borderTop: '1px solid var(--rs-color-border-neutral-faded)' }}>
          <Text variant="caption-1" weight="bold" color="neutral-faded" marginBottom={2}>Presets</Text>
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto' }}>
            {FOCUS_PRESETS.map(p => (
              <button key={p.name} onClick={() => changePreset(p)} style={{
                padding: '6px 14px', borderRadius: 10, border: `2px solid ${preset.name === p.name ? phaseColors[phase] : 'var(--rs-color-border-neutral-faded)'}`,
                background: preset.name === p.name ? `${phaseColors[phase]}10` : 'transparent',
                cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600, whiteSpace: 'nowrap',
                color: preset.name === p.name ? phaseColors[phase] : 'var(--rs-color-foreground-neutral-default)',
                transition: 'all 0.15s',
              }}>
                {p.name} ({p.work}m)
              </button>
            ))}
          </div>
        </View>

        {/* Stats */}
        <View padding={4} direction="row" gap={4} style={{
          borderTop: '1px solid var(--rs-color-border-neutral-faded)', justifyContent: 'center',
        }}>
          <View align="center">
            <Text variant="body-1" weight="bold">{totalFocused}m</Text>
            <Text variant="caption-2" color="neutral-faded">Focused</Text>
          </View>
          <View align="center">
            <Text variant="body-1" weight="bold">{currentRound}/{preset.rounds}</Text>
            <Text variant="caption-2" color="neutral-faded">Round</Text>
          </View>
          <View align="center">
            <Text variant="body-1" weight="bold">{Math.round(totalFocused * 0.5)}</Text>
            <Text variant="caption-2" color="neutral-faded">XP earned</Text>
          </View>
        </View>
      </div>
    </div>
  );
}
