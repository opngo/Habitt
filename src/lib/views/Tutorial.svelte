<script>
  import { currentView, tutorialCompleted } from '../stores.js';
  import { saveSetting } from '../db.js';

  let currentStep = 0;

  const steps = [
    {
      title: 'Welcome to Habitt. 🌱',
      description: 'Your personal habit tracker designed to help you build lasting habits with visual feedback and daily journaling.',
      icon: '🎉',
      details: [
        'Track daily habits with one click',
        'Visualize your progress with heatmaps',
        'Journal your thoughts and mood',
        'Build streaks and stay motivated'
      ]
    },
    {
      title: 'Create Your First Habit',
      description: 'Start by adding habits you want to build. Give each one a name, icon, color, and category.',
      icon: '➕',
      details: [
        'Click "+ New Habit" on the Dashboard',
        'Choose an icon and color that represents your habit',
        'Set a category like Health, Learning, or Fitness',
        'Optionally add a description and daily target'
      ]
    },
    {
      title: 'Check In Daily',
      description: 'Each day, mark your habits as done. Watch the heatmap fill up and your streak grow!',
      icon: '✅',
      details: [
        'Click "Mark Done" on any habit card',
        'The heatmap shows your activity over the year',
        'Darker green = more habits completed that day',
        'Your streak counter tracks consecutive days'
      ]
    },
    {
      title: 'Explore Habit Pages',
      description: 'Click any habit card to see its dedicated page with detailed stats, history, and heatmap.',
      icon: '📊',
      details: [
        'View current and longest streaks',
        'See your 30-day completion rate',
        'Quick-toggle the last 7 days',
        'Browse your full completion history'
      ]
    },
    {
      title: 'Journal Your Journey',
      description: 'Reflect on your day with the built-in journal. Track your mood and write about your progress.',
      icon: '📝',
      details: [
        'Rate your daily mood with emoji',
        'Write about your thoughts and progress',
        'List things you\'re grateful for',
        'Browse past entries anytime'
      ]
    },
    {
      title: 'Stay Secure',
      description: 'Optionally protect your app with a password. Your data stays on your device — always private.',
      icon: '🔒',
      details: [
        'Enable password in Settings',
        'All data stored locally — no cloud',
        'Export your data as JSON backup',
        'No ads, no tracking, fully private'
      ]
    }
  ];

  function nextStep() {
    if (currentStep < steps.length - 1) {
      currentStep++;
    } else {
      completeTutorial();
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      currentStep--;
    }
  }

  function skipTutorial() {
    completeTutorial();
  }

  async function completeTutorial() {
    await saveSetting('tutorial_completed', 'true');
    tutorialCompleted.set(true);
    currentView.set('dashboard');
  }
</script>

<div class="tutorial">
  <div class="tutorial-card">
    <div class="progress-bar">
      {#each steps as _, i}
        <div class="progress-dot" class:active={i === currentStep} class:done={i < currentStep}></div>
      {/each}
    </div>

    <div class="step-content">
      <div class="step-icon">{steps[currentStep].icon}</div>
      <h1 class="step-title">{steps[currentStep].title}</h1>
      <p class="step-description">{steps[currentStep].description}</p>

      <ul class="step-details">
        {#each steps[currentStep].details as detail}
          <li>
            <span class="detail-check">✓</span>
            {detail}
          </li>
        {/each}
      </ul>
    </div>

    <div class="tutorial-actions">
      <button class="btn-skip" on:click={skipTutorial}>
        Skip Tutorial
      </button>
      <div class="nav-buttons">
        {#if currentStep > 0}
          <button class="btn-prev" on:click={prevStep}>← Back</button>
        {/if}
        <button class="btn-next" on:click={nextStep}>
          {currentStep === steps.length - 1 ? 'Get Started! 🚀' : 'Next →'}
        </button>
      </div>
    </div>

    <div class="step-counter">
      Step {currentStep + 1} of {steps.length}
    </div>
  </div>
</div>

<style>
  .tutorial {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--bg), var(--bg-secondary));
    padding: 2rem;
  }

  .tutorial-card {
    background: var(--bg);
    border-radius: 1.5rem;
    padding: 2.5rem;
    max-width: 600px;
    width: 100%;
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .progress-bar {
    display: flex;
    gap: 0.5rem;
    justify-content: center;
  }

  .progress-dot {
    width: 2.5rem;
    height: 4px;
    border-radius: 2px;
    background: var(--border);
    transition: all 0.3s;
  }

  .progress-dot.active {
    background: var(--primary);
  }

  .progress-dot.done {
    background: var(--primary-light);
  }

  .step-content {
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .step-icon {
    font-size: 3.5rem;
    margin-bottom: 0.5rem;
  }

  .step-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text);
  }

  .step-description {
    color: var(--text-secondary);
    font-size: 1rem;
    line-height: 1.6;
    max-width: 450px;
  }

  .step-details {
    list-style: none;
    text-align: left;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0.625rem;
    margin-top: 0.5rem;
  }

  .step-details li {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    font-size: 0.9375rem;
    color: var(--text);
    padding: 0.5rem 0.75rem;
    background: var(--bg-secondary);
    border-radius: 0.5rem;
  }

  .detail-check {
    color: var(--primary);
    font-weight: 700;
    font-size: 1rem;
  }

  .tutorial-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .nav-buttons {
    display: flex;
    gap: 0.75rem;
  }

  .btn-skip {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
    padding: 0.5rem;
  }

  .btn-skip:hover {
    color: var(--text);
  }

  .btn-prev {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text);
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    transition: all 0.15s;
  }

  .btn-prev:hover {
    background: var(--bg-tertiary);
  }

  .btn-next {
    padding: 0.625rem 1.5rem;
    background: var(--primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.15s;
  }

  .btn-next:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  .step-counter {
    text-align: center;
    font-size: 0.75rem;
    color: var(--text-secondary);
  }
</style>
