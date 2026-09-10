<script>
  import { selectedHabitId, completions, habits, currentView } from '../stores.js';
  import Heatmap from '../components/Heatmap.svelte';
  import { getHabitCompletions, toggleCompletion, deleteHabit, archiveHabit } from '../db.js';
  import { getCurrentStreak, getLongestStreak, calculateCompletionRate, formatDate } from '../utils.js';

  export let refreshData;

  let habit = null;
  let habitCompletions = [];
  let currentStreak = 0;
  let longestStreak = 0;
  let completionRate = 0;
  let totalCompletions = 0;

  $: if ($selectedHabitId) {
    habit = $habits.find(h => h.id === $selectedHabitId);
    habitCompletions = $completions.filter(c => c.habit_id === $selectedHabitId);
    currentStreak = getCurrentStreak(habitCompletions);
    longestStreak = getLongestStreak(habitCompletions);
    totalCompletions = habitCompletions.length;
    
    // Calculate rate over last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    completionRate = calculateCompletionRate(
      habitCompletions,
      thirtyDaysAgo.toISOString().split('T')[0],
      new Date().toISOString().split('T')[0]
    );
  }

  function goBack() {
    currentView.set('dashboard');
    selectedHabitId.set(null);
  }

  async function handleDelete() {
    if (confirm(`Are you sure you want to delete "${habit.name}"? This cannot be undone.`)) {
      await deleteHabit(habit.id);
      await refreshData();
      goBack();
    }
  }

  async function handleArchive() {
    await archiveHabit(habit.id);
    await refreshData();
    goBack();
  }

  // Last 7 days for quick toggle
  $: last7Days = (() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  })();

  $: completedDates = new Set(habitCompletions.map(c => c.date));

  async function handleToggleDay(date) {
    await toggleCompletion(habit.id, date);
    await refreshData();
  }
</script>

{#if habit}
  <div class="habit-page">
    <div class="page-header">
      <button class="back-btn" on:click={goBack}>
        ← Back to Dashboard
      </button>
    </div>

    <div class="habit-hero" style="border-left: 4px solid {habit.color}">
      <div class="habit-icon-large" style="background: {habit.color}20">
        {habit.icon}
      </div>
      <div class="habit-details">
        <h1 class="habit-name">{habit.name}</h1>
        {#if habit.description}
          <p class="habit-desc">{habit.description}</p>
        {/if}
        <div class="habit-meta">
          <span class="meta-tag">{habit.category}</span>
          <span class="meta-tag">{habit.frequency}</span>
          {#if habit.target_count > 1}
            <span class="meta-tag">{habit.target_count}x per day</span>
          {/if}
        </div>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🔥</div>
        <div class="stat-number">{currentStreak}</div>
        <div class="stat-label">Current Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🏆</div>
        <div class="stat-number">{longestStreak}</div>
        <div class="stat-label">Longest Streak</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-number">{completionRate}%</div>
        <div class="stat-label">30-Day Rate</div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">✅</div>
        <div class="stat-number">{totalCompletions}</div>
        <div class="stat-label">Total Check-ins</div>
      </div>
    </div>

    <!-- Last 7 Days Quick View -->
    <div class="week-section">
      <h2 class="section-title">Last 7 Days</h2>
      <div class="week-grid">
        {#each last7Days as date}
          <button 
            class="day-cell"
            class:completed={completedDates.has(date)}
            on:click={() => handleToggleDay(date)}
          >
            <span class="day-name">{new Date(date).toLocaleDateString('en-US', { weekday: 'short' })}</span>
            <span class="day-number">{new Date(date).getDate()}</span>
            <span class="day-check">{completedDates.has(date) ? '✓' : '○'}</span>
          </button>
        {/each}
      </div>
    </div>

    <!-- Heatmap -->
    <div class="heatmap-section">
      <h2 class="section-title">Activity Heatmap</h2>
      <Heatmap 
        completions={$completions}
        habits={[]}
        type="habit"
        habitId={habit.id}
      />
    </div>

    <!-- Completion History -->
    <div class="history-section">
      <h2 class="section-title">Recent Completions</h2>
      {#if habitCompletions.length === 0}
        <p class="empty-text">No completions yet. Start checking in!</p>
      {:else}
        <div class="history-list">
          {#each habitCompletions.slice(0, 20) as completion}
            <div class="history-item">
              <span class="history-date">{formatDate(completion.date)}</span>
              {#if completion.note}
                <span class="history-note">"{completion.note}"</span>
              {/if}
            </div>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Danger Zone -->
    <div class="danger-zone">
      <h3>Manage Habit</h3>
      <div class="danger-actions">
        <button class="btn-archive" on:click={handleArchive}>Archive Habit</button>
        <button class="btn-delete" on:click={handleDelete}>Delete Habit</button>
      </div>
    </div>
  </div>
{/if}

<style>
  .habit-page {
    max-width: 900px;
    margin: 0 auto;
  }

  .page-header {
    margin-bottom: 1.5rem;
  }

  .back-btn {
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-secondary);
    transition: all 0.15s;
  }

  .back-btn:hover {
    background: var(--bg-secondary);
    color: var(--text);
  }

  .habit-hero {
    display: flex;
    align-items: flex-start;
    gap: 1.25rem;
    padding: 1.5rem;
    background: var(--bg-secondary);
    border-radius: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .habit-icon-large {
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 2rem;
    flex-shrink: 0;
  }

  .habit-name {
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 0.25rem;
  }

  .habit-desc {
    color: var(--text-secondary);
    margin-bottom: 0.75rem;
    font-size: 0.9375rem;
  }

  .habit-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .meta-tag {
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
    background: var(--bg-tertiary);
    border-radius: 9999px;
    color: var(--text-secondary);
    font-weight: 500;
    text-transform: capitalize;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1.25rem;
    text-align: center;
  }

  .stat-icon {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }

  .stat-number {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--text);
  }

  .stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .week-section, .heatmap-section, .history-section {
    margin-bottom: 2rem;
  }

  .week-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 0.5rem;
  }

  .day-cell {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    transition: all 0.15s;
    cursor: pointer;
  }

  .day-cell:hover {
    border-color: var(--primary);
  }

  .day-cell.completed {
    background: rgba(16, 185, 129, 0.1);
    border-color: var(--primary);
  }

  .day-name {
    font-size: 0.7rem;
    color: var(--text-secondary);
    text-transform: uppercase;
    font-weight: 600;
  }

  .day-number {
    font-size: 1.125rem;
    font-weight: 700;
  }

  .day-check {
    font-size: 0.875rem;
    color: var(--primary);
    font-weight: 700;
  }

  .history-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .history-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: var(--bg-secondary);
    border-radius: 0.5rem;
    border: 1px solid var(--border);
  }

  .history-date {
    font-weight: 500;
    font-size: 0.875rem;
  }

  .history-note {
    color: var(--text-secondary);
    font-style: italic;
    font-size: 0.8125rem;
  }

  .empty-text {
    color: var(--text-secondary);
    font-style: italic;
  }

  .danger-zone {
    margin-top: 3rem;
    padding: 1.5rem;
    border: 1px solid var(--danger);
    border-radius: 0.75rem;
  }

  .danger-zone h3 {
    color: var(--danger);
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .danger-actions {
    display: flex;
    gap: 0.75rem;
  }

  .btn-archive, .btn-delete {
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 600;
    transition: all 0.15s;
  }

  .btn-archive {
    background: var(--bg-tertiary);
    color: var(--text);
  }

  .btn-archive:hover {
    background: var(--accent);
    color: white;
  }

  .btn-delete {
    background: var(--danger);
    color: white;
  }

  .btn-delete:hover {
    opacity: 0.9;
  }
</style>
