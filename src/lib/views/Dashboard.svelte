<script>
  import { habits, completions, showCreateHabit, searchQuery, selectedCategory, categories, filteredHabits } from '../stores.js';
  import Heatmap from '../components/Heatmap.svelte';
  import HabitCard from '../components/HabitCard.svelte';
  import { getToday } from '../utils.js';

  export let refreshData;

  let today = getToday();
  let completedToday = new Set();

  $: {
    const set = new Set();
    $completions.filter(c => c.date === today).forEach(c => set.add(c.habit_id));
    completedToday = set;
  }

  function openCreateHabit() {
    showCreateHabit.set(true);
  }
</script>

<div class="dashboard">
  <div class="dashboard-header">
    <div>
      <h1 class="page-title">Dashboard</h1>
      <p class="page-subtitle">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
    <button class="btn-primary" on:click={openCreateHabit}>
      <span>+</span> New Habit
    </button>
  </div>

  <!-- Overview Heatmap -->
  <div class="overview-section">
    <h2 class="section-title">Your Year at a Glance</h2>
    <Heatmap 
      completions={$completions}
      habits={$habits.filter(h => !h.archived)}
      type="overview"
    />
  </div>

  <!-- Today's Habits -->
  <div class="today-section">
    <h2 class="section-title">Today's Habits</h2>
    
    <!-- Filters -->
    <div class="filters">
      <input 
        type="text" 
        class="search-input"
        placeholder="Search habits..."
        bind:value={$searchQuery}
      />
      <select class="category-select" bind:value={$selectedCategory}>
        {#each $categories as cat}
          <option value={cat}>{cat}</option>
        {/each}
      </select>
    </div>

    {#if $filteredHabits.length === 0}
      <div class="empty-state">
        <div class="empty-icon">🌱</div>
        <h3>No habits yet</h3>
        <p>Start building better habits by creating your first one!</p>
        <button class="btn-primary" on:click={openCreateHabit}>
          Create Your First Habit
        </button>
      </div>
    {:else}
      <div class="habits-grid">
        {#each $filteredHabits as habit (habit.id)}
          <HabitCard 
            {habit}
            isCompleted={completedToday.has(habit.id)}
            {refreshData}
          />
        {/each}
      </div>
    {/if}
  </div>
</div>

<style>
  .dashboard {
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--text);
  }

  .page-subtitle {
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .btn-primary {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: var(--primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.15s;
  }

  .btn-primary:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }

  .overview-section, .today-section {
    margin-bottom: 2.5rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text);
  }

  .filters {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .search-input {
    flex: 1;
    max-width: 300px;
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--bg);
    color: var(--text);
    font-size: 0.875rem;
  }

  .search-input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }

  .category-select {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    background: var(--bg);
    color: var(--text);
    font-size: 0.875rem;
  }

  .habits-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1rem;
  }

  .empty-state {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--bg-secondary);
    border-radius: 1rem;
    border: 2px dashed var(--border);
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .empty-state h3 {
    font-size: 1.25rem;
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
  }
</style>
