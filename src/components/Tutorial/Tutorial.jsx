import React, { useState } from 'react';
import { View, Text, Button, Icon } from 'reshaped';
import { ChevronRight, ChevronLeft, Rocket, Sparkles } from 'lucide-react';
import { useStore } from '../../lib/store';
import { saveSetting } from '../../lib/db';

const STEPS = [
  {
    icon: '🌱', title: 'Welcome to Habitt.',
    desc: 'Your personal habit tracker designed to help you build lasting habits with visual feedback, streaks, and daily journaling.',
    items: ['Track habits with one click', 'GitHub-style heatmaps', 'Daily journaling & mood tracking', 'Gamification with XP & achievements']
  },
  {
    icon: '➕', title: 'Create Your First Habit',
    desc: 'Add habits you want to build. Give each one a name, icon, color, and category. Choose from 40+ templates or create your own.',
    items: ['Choose an icon and color', 'Set a category like Health or Learning', 'Pick difficulty: easy, medium, or hard', 'Set frequency and daily targets']
  },
  {
    icon: '✅', title: 'Check In Daily',
    desc: 'Each day, mark your habits as done. Watch the heatmap fill up and your streaks grow! Use Quick Check-in mode for fast logging.',
    items: ['Click "Mark Done" on any habit card', 'Heatmap shows your yearly activity', 'Streak counter tracks consecutive days', 'Earn XP for every completion']
  },
  {
    icon: '📊', title: 'Explore Your Stats',
    desc: 'Dive into detailed analytics: streak leaderboards, day-of-week patterns, monthly trends, and category breakdowns.',
    items: ['Current & longest streaks per habit', '30-day completion rate', 'Day-of-week patterns', 'Mood correlation with habits']
  },
  {
    icon: '📝', title: 'Journal Your Journey',
    desc: 'Reflect on your day with the built-in journal. Track mood, energy, sleep hours, and write about your progress.',
    items: ['Rate daily mood with 5 emoji levels', 'Track energy level and sleep', 'Write thoughts and gratitude', 'Browse past entries anytime']
  },
  {
    icon: '🏆', title: 'Earn Achievements',
    desc: 'Unlock badges as you build habits. Get XP for completions, level up, and celebrate milestones with confetti!',
    items: ['20+ achievements to unlock', 'XP system with levels', 'Confetti on streak milestones', 'Optional password protection']
  },
];

export default function Tutorial() {
  const [step, setStep] = useState(0);
  const { setTutorialDone, setView } = useStore();

  async function complete() {
    await saveSetting('tutorial_completed', 'true');
    setTutorialDone(true);
    setView('dashboard');
  }

  const isLast = step === STEPS.length - 1;

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, var(--rs-color-background-neutral-default), var(--rs-color-background-neutral-faded))',
      padding: '2rem',
    }}>
      <div className="tutorial-card animate-scale-in">
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: '2rem' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: 40, height: 4, borderRadius: 2,
              background: i === step ? 'var(--rs-color-background-primary-default)'
                : i < step ? 'var(--rs-color-background-primary-faded)'
                : 'var(--rs-color-background-neutral-faded)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Content */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>{STEPS[step].icon}</div>
          <Text variant="title-1" weight="bold">{STEPS[step].title}</Text>
          <Text variant="body-2" color="neutral-faded" marginTop={2} style={{ maxWidth: 440, margin: '0.5rem auto 0' }}>
            {STEPS[step].desc}
          </Text>

          <div style={{
            marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left',
          }}>
            {STEPS[step].items.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '8px 12px', borderRadius: 8,
                background: 'var(--rs-color-background-neutral-faded)',
              }}>
                <span style={{ color: 'var(--rs-color-foreground-primary-default)', fontWeight: 700 }}>✓</span>
                <Text variant="body-3">{item}</Text>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <View direction="row" align="center" style={{ justifyContent: 'space-between' }}>
          <button onClick={complete} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--rs-color-foreground-neutral-faded)', fontSize: '0.875rem', fontWeight: 500,
          }}>Skip Tutorial</button>
          <View direction="row" gap={2}>
            {step > 0 && (
              <Button variant="faded" color="neutral" onClick={() => setStep(step - 1)}
                startIcon={<Icon svg={<ChevronLeft size={14} />} />}>
                Back
              </Button>
            )}
            <Button color="primary" onClick={() => isLast ? complete() : setStep(step + 1)}
              startIcon={<Icon svg={isLast ? <Rocket size={14} /> : <ChevronRight size={14} />} />}>
              {isLast ? 'Get Started!' : 'Next'}
            </Button>
          </View>
        </View>

        <Text variant="caption-2" color="neutral-faded" align="center" marginTop={4}>
          Step {step + 1} of {STEPS.length}
        </Text>
      </div>
    </div>
  );
}
