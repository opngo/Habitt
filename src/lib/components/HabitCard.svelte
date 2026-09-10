<script>
  import { toggleCompletion } from '../db.js';
  import { getToday, getCurrentStreak } from '../utils.js';
  import { completions, currentView, selectedHabitId, showEditHabit, editingHabit } from '../stores.js';

  export let habit;
  export let isCompleted;
  export let refreshData;

  let currentStreak = 0;

  $: {
    const habitCompletions = $completions.filter(c => c.habit_id === habit.id);
    currentStreak = getCurrentStreak(habitCompletions);
  }

  async function handleToggle() {
    const today = getToday();
    await toggleCompletion(habit.id, today);
    await refreshData();
  }

  function openHabitPage() {
    selectedHabitId.set(habit.id);
    currentView.set('habit');
  }

  function openEdit(e) {
    e.stopPropagation();
    editingHabit.set(habit);
    showEditHabit.set(true);
  }
</script>

<div class="habit-card" class:completed={isCompleted} on:click={openHabitPage} on:keydown={(e) => e.key === 'Enter' && openHabitPage()} tabindex="0" role="button">
  <div class="card-header">
    <div class="habit-icon" style="background: {habit.color}20; color: {habit.color}">
      {habit.icon || '✨'}
    </div>
    <div class="habit-info">
      <h3 class="habit-name">{habit.name}</h3>
      <span class="habit-category">{habit.category}</span>
    </div>
    <button class="edit-btn" on:click={openEdit} title="Edit habit">
      ✏️
    </button>
  </div>

  <div class="card-body">
    <div class="streak-info">
      <span class="streak-icon">🔥</span>
      <span class="streak-count">{currentStreak}</span>
      <span class="streak-label">day streak</span>
    </div>
  </div>

  <div class="card-footer">
    <button 
      class="check-btn"
      class:checked={isCompleted}
      on:click={(e) => { e.stopPropagation(); handleToggle(); }}
      title={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
    >
      {#if isCompleted}
        ✓ Done
      {:else}
        ○ Mark Done
      {/if}
    </button>
  </div>
</div>

<style>
  .habit-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1.25rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .habit-card:hover {
    border-color: var(--primary);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }

  .habit-card.completed {
    border-color: var(--primary);
    background: linear-gradient(135deg, var(--bg), rgba(16, 185, 129, 0.05));
  }

  .card-header {
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .habit-icon {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    flex-shrink: 0;
  }

  .habit-info {
    flex: 1;
    min-width: 0;
  }

  .habit-name {
    font-size: 1rem;
    font-weight: 600;
    color: var(--text);
    margin-bottom: 0.125rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .habit-category {
    font-size: 0.75rem;
    color: var(--text-secondary);
    background: var(--bg-tertiary);
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;
    display: inline-block;
  }

  .edit-btn {
    padding: 0.25rem;
    border-radius: 0.25rem;
    opacity: 0;
    transition: opacity 0.15s;
    font-size: 0.875rem;
  }

  .habit-card:hover .edit-btn {
    opacity: 1;
  }

  .edit-btn:hover {
    background: var(--bg-tertiary);
  }

  .card-body {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .streak-info {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    font-size: 0.875rem;
  }

  .streak-icon {
    font-size: 1rem;
  }

  .streak-count {
    font-weight: 700;
    color: var(--text);
    font-size: 1.125rem;
  }

  .streak-label {
    color: var(--text-secondary);
    font-size: 0.8125rem;
  }

  .card-footer {
    margin-top: auto;
  }

  .check-btn {
    width: 100%;
    padding: 0.5rem;
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    color: var(--text-secondary);
    transition: all 0.15s;
  }

  .check-btn:hover {
    border-color: var(--primary);
    color: var(--primary);
    background: rgba(16, 185, 129, 0.05);
  }

  .check-btn.checked {
    background: var(--primary);
    border-color: var(--primary);
    color: white;
  }
</style>
