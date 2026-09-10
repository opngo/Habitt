<script>
  import { currentView, habits, todayCompletions, currentStreaks } from '../stores.js';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'journal', label: 'Journal', icon: '📝' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  function navigate(view) {
    currentView.set(view);
  }
</script>

<nav class="sidebar">
  <div class="sidebar-header">
    <h1 class="logo">Habitt.</h1>
    <p class="logo-subtitle">Build better habits</p>
  </div>

  <div class="nav-section">
    {#each navItems as item}
      <button
        class="nav-item"
        class:active={$currentView === item.id}
        on:click={() => navigate(item.id)}
      >
        <span class="nav-icon">{item.icon}</span>
        <span class="nav-label">{item.label}</span>
      </button>
    {/each}
  </div>

  <div class="nav-section">
    <div class="section-label">Quick Stats</div>
    <div class="stat-item">
      <span class="stat-icon">🔥</span>
      <span class="stat-label">Today</span>
      <span class="stat-value">{$todayCompletions.length}/{$habits.filter(h => !h.archived).length}</span>
    </div>
    <div class="stat-item">
      <span class="stat-icon">📈</span>
      <span class="stat-label">Habits</span>
      <span class="stat-value">{$habits.filter(h => !h.archived).length}</span>
    </div>
  </div>

  <div class="sidebar-footer">
    <button class="nav-item" on:click={() => navigate('tutorial')}>
      <span class="nav-icon">❓</span>
      <span class="nav-label">Help & Tutorial</span>
    </button>
  </div>
</nav>

<style>
  .sidebar {
    width: 240px;
    background: var(--bg-secondary);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 1.5rem 0;
    overflow-y: auto;
  }

  .sidebar-header {
    padding: 0 1.5rem 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .logo {
    font-size: 1.75rem;
    font-weight: 800;
    color: var(--primary);
    letter-spacing: -0.5px;
  }

  .logo-subtitle {
    font-size: 0.75rem;
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .nav-section {
    padding: 1rem 0.75rem;
  }

  .section-label {
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    padding: 0 0.75rem 0.5rem;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    color: var(--text);
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.15s;
  }

  .nav-item:hover {
    background: var(--bg-tertiary);
  }

  .nav-item.active {
    background: var(--primary);
    color: white;
  }

  .nav-icon {
    font-size: 1.125rem;
    width: 1.5rem;
    text-align: center;
  }

  .stat-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    font-size: 0.8125rem;
  }

  .stat-icon {
    font-size: 1rem;
  }

  .stat-label {
    flex: 1;
    color: var(--text-secondary);
  }

  .stat-value {
    font-weight: 600;
    color: var(--text);
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 1rem 0.75rem;
    border-top: 1px solid var(--border);
  }
</style>
