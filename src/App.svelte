<script>
  import { onMount } from 'svelte';
  import { 
    currentView, theme, isAuthenticated, passwordEnabled,
    tutorialCompleted, habits, completions, journalEntries, settings
  } from './lib/stores.js';
  import { getHabits, getCompletions, getJournalEntries, getAllSettings, getSetting, saveSetting } from './lib/db.js';
  import Sidebar from './lib/components/Sidebar.svelte';
  import Dashboard from './lib/views/Dashboard.svelte';
  import HabitPage from './lib/views/HabitPage.svelte';
  import Journal from './lib/views/Journal.svelte';
  import SettingsView from './lib/views/SettingsView.svelte';
  import Tutorial from './lib/views/Tutorial.svelte';
  import PasswordGate from './lib/components/PasswordGate.svelte';
  import CreateHabitModal from './lib/components/CreateHabitModal.svelte';
  import { showCreateHabit } from './lib/stores.js';

  let isLoading = true;

  onMount(async () => {
    try {
      // Load theme
      const savedTheme = await getSetting('theme');
      if (savedTheme) {
        theme.set(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
      }

      // Check password protection
      const pwdHash = await getSetting('password_hash');
      if (pwdHash) {
        passwordEnabled.set(true);
        isAuthenticated.set(false);
      } else {
        isAuthenticated.set(true);
      }

      // Check tutorial
      const tutorialDone = await getSetting('tutorial_completed');
      if (!tutorialDone) {
        tutorialCompleted.set(false);
        currentView.set('tutorial');
      } else {
        tutorialCompleted.set(true);
      }

      // Load all data
      await refreshData();
    } catch (e) {
      console.error('Init error:', e);
    } finally {
      isLoading = false;
    }
  });

  async function refreshData() {
    const [h, c, j, s] = await Promise.all([
      getHabits(),
      getCompletions(),
      getJournalEntries(),
      getAllSettings()
    ]);
    habits.set(h);
    completions.set(c);
    journalEntries.set(j);
    settings.set(s);
  }

  // Make refreshData available to child components
  import { setContext } from 'svelte';
  setContext('refreshData', refreshData);

  theme.subscribe(value => {
    document.documentElement.setAttribute('data-theme', value);
  });
</script>

{#if isLoading}
  <div class="loading">
    <div class="loading-spinner"></div>
    <p>Loading Habitt...</p>
  </div>
{:else if !isAuthenticated}
  <PasswordGate />
{:else if $currentView === 'tutorial'}
  <Tutorial />
{:else}
  <div class="app-layout">
    <Sidebar />
    <main class="main-content">
      {#if $currentView === 'dashboard'}
        <Dashboard {refreshData} />
      {:else if $currentView === 'habit'}
        <HabitPage {refreshData} />
      {:else if $currentView === 'journal'}
        <Journal {refreshData} />
      {:else if $currentView === 'settings'}
        <SettingsView {refreshData} />
      {/if}
    </main>
  </div>
{/if}

{#if $showCreateHabit}
  <CreateHabitModal {refreshData} />
{/if}

<style>
  .loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100vw;
    height: 100vh;
    gap: 1rem;
    color: var(--text-secondary);
  }

  .loading-spinner {
    width: 40px;
    height: 40px;
    border: 3px solid var(--border);
    border-top-color: var(--primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  .app-layout {
    display: flex;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .main-content {
    flex: 1;
    overflow-y: auto;
    padding: 2rem;
    background: var(--bg);
  }
</style>
