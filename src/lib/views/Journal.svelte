<script>
  import { journalEntries } from '../stores.js';
  import { saveJournalEntry, getJournalEntry } from '../db.js';
  import { getToday, formatDate, formatShortDate } from '../utils.js';

  export let refreshData;

  let selectedDate = getToday();
  let entry = { mood: 3, content: '', gratitude: '' };
  let isSaved = false;
  let recentEntries = [];
  let showEntryList = false;

  const moods = [
    { value: 1, emoji: '😢', label: 'Terrible' },
    { value: 2, emoji: '😕', label: 'Bad' },
    { value: 3, emoji: '😐', label: 'Okay' },
    { value: 4, emoji: '😊', label: 'Good' },
    { value: 5, emoji: '🤩', label: 'Amazing' },
  ];

  $: recentEntries = $journalEntries.slice(0, 30);

  $: loadEntry(selectedDate);

  async function loadEntry(date) {
    const existing = $journalEntries.find(e => e.date === date);
    if (existing) {
      entry = { mood: existing.mood, content: existing.content, gratitude: existing.gratitude };
    } else {
      entry = { mood: 3, content: '', gratitude: '' };
    }
    isSaved = false;
  }

  async function handleSave() {
    await saveJournalEntry(selectedDate, entry);
    await refreshData();
    isSaved = true;
    setTimeout(() => isSaved = false, 2000);
  }

  function changeDate(delta) {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + delta);
    selectedDate = date.toISOString().split('T')[0];
  }

  function goToToday() {
    selectedDate = getToday();
  }

  function selectEntry(date) {
    selectedDate = date;
    showEntryList = false;
  }
</script>

<div class="journal">
  <div class="journal-header">
    <div>
      <h1 class="page-title">Journal</h1>
      <p class="page-subtitle">Reflect on your day and track your mood</p>
    </div>
    <button class="btn-history" on:click={() => showEntryList = !showEntryList}>
      {showEntryList ? '✕ Close' : '📖 Past Entries'}
    </button>
  </div>

  <div class="journal-layout">
    <div class="journal-main">
      <!-- Date Navigation -->
      <div class="date-nav">
        <button class="date-btn" on:click={() => changeDate(-1)}>←</button>
        <div class="date-display">
          <span class="date-text">{formatDate(selectedDate)}</span>
          {#if selectedDate !== getToday()}
            <button class="today-btn" on:click={goToToday}>Today</button>
          {/if}
        </div>
        <button class="date-btn" on:click={() => changeDate(1)}>→</button>
      </div>

      <!-- Mood Selector -->
      <div class="mood-section">
        <h3 class="section-label">How are you feeling?</h3>
        <div class="mood-grid">
          {#each moods as mood}
            <button
              class="mood-btn"
              class:selected={entry.mood === mood.value}
              on:click={() => entry.mood = mood.value}
            >
              <span class="mood-emoji">{mood.emoji}</span>
              <span class="mood-label">{mood.label}</span>
            </button>
          {/each}
        </div>
      </div>

      <!-- Journal Content -->
      <div class="content-section">
        <h3 class="section-label">What's on your mind?</h3>
        <textarea
          class="journal-textarea"
          bind:value={entry.content}
          placeholder="Write about your day, your thoughts, your progress..."
          rows="8"
        ></textarea>
      </div>

      <!-- Gratitude -->
      <div class="gratitude-section">
        <h3 class="section-label">🙏 What are you grateful for today?</h3>
        <textarea
          class="gratitude-textarea"
          bind:value={entry.gratitude}
          placeholder="List things you're thankful for..."
          rows="3"
        ></textarea>
      </div>

      <!-- Save Button -->
      <div class="save-section">
        <button class="btn-save" on:click={handleSave}>
          {#if isSaved}
            ✓ Saved!
          {:else}
            Save Entry
          {/if}
        </button>
      </div>
    </div>

    <!-- Past Entries Sidebar -->
    {#if showEntryList}
      <div class="entries-sidebar">
        <h3>Past Entries</h3>
        {#if recentEntries.length === 0}
          <p class="empty-text">No entries yet</p>
        {:else}
          <div class="entries-list">
            {#each recentEntries as pastEntry}
              <button 
                class="entry-item"
                class:selected={pastEntry.date === selectedDate}
                on:click={() => selectEntry(pastEntry.date)}
              >
                <div class="entry-date">{formatShortDate(pastEntry.date)}</div>
                <div class="entry-mood">{moods.find(m => m.value === pastEntry.mood)?.emoji || '😐'}</div>
                <div class="entry-preview">
                  {pastEntry.content.substring(0, 60)}{pastEntry.content.length > 60 ? '...' : ''}
                </div>
              </button>
            {/each}
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>

<style>
  .journal {
    max-width: 900px;
    margin: 0 auto;
  }

  .journal-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
  }

  .page-title {
    font-size: 1.75rem;
    font-weight: 700;
  }

  .page-subtitle {
    color: var(--text-secondary);
    margin-top: 0.25rem;
  }

  .btn-history {
    padding: 0.5rem 1rem;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text);
  }

  .btn-history:hover {
    background: var(--bg-tertiary);
  }

  .journal-layout {
    display: flex;
    gap: 1.5rem;
  }

  .journal-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .date-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
    justify-content: center;
  }

  .date-btn {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    font-size: 1rem;
    color: var(--text);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .date-btn:hover {
    background: var(--bg-tertiary);
  }

  .date-display {
    text-align: center;
  }

  .date-text {
    font-weight: 600;
    font-size: 1.125rem;
  }

  .today-btn {
    font-size: 0.75rem;
    color: var(--primary);
    font-weight: 600;
    margin-top: 0.25rem;
    display: block;
  }

  .today-btn:hover {
    text-decoration: underline;
  }

  .section-label {
    font-size: 0.9375rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
    color: var(--text);
  }

  .mood-grid {
    display: flex;
    gap: 0.75rem;
  }

  .mood-btn {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.375rem;
    padding: 1rem 0.5rem;
    background: var(--bg-secondary);
    border: 2px solid var(--border);
    border-radius: 0.75rem;
    transition: all 0.15s;
  }

  .mood-btn:hover {
    border-color: var(--primary);
  }

  .mood-btn.selected {
    border-color: var(--primary);
    background: rgba(16, 185, 129, 0.1);
  }

  .mood-emoji {
    font-size: 1.75rem;
  }

  .mood-label {
    font-size: 0.7rem;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .journal-textarea, .gratitude-textarea {
    width: 100%;
    padding: 1rem;
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    background: var(--bg);
    color: var(--text);
    resize: vertical;
    font-size: 0.9375rem;
    line-height: 1.6;
  }

  .journal-textarea:focus, .gratitude-textarea:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }

  .save-section {
    display: flex;
    justify-content: flex-end;
  }

  .btn-save {
    padding: 0.75rem 2rem;
    background: var(--primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.9375rem;
    transition: all 0.15s;
  }

  .btn-save:hover {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  .entries-sidebar {
    width: 280px;
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1rem;
    max-height: 70vh;
    overflow-y: auto;
  }

  .entries-sidebar h3 {
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
  }

  .entries-list {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .entry-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    text-align: left;
    transition: all 0.15s;
  }

  .entry-item:hover {
    background: var(--bg-tertiary);
  }

  .entry-item.selected {
    background: var(--primary);
    color: white;
  }

  .entry-date {
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 3.5rem;
  }

  .entry-mood {
    font-size: 1rem;
  }

  .entry-preview {
    font-size: 0.75rem;
    color: var(--text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
  }

  .entry-item.selected .entry-preview {
    color: rgba(255, 255, 255, 0.8);
  }

  .empty-text {
    color: var(--text-secondary);
    font-style: italic;
    font-size: 0.875rem;
  }
</style>
