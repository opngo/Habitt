<script>
  import { createHabit, updateHabit } from '../db.js';
  import { showCreateHabit, showEditHabit, editingHabit } from '../stores.js';
  import { HABIT_ICONS, HABIT_COLORS, CATEGORIES } from '../utils.js';

  export let refreshData;

  let mode = 'create'; // 'create' or 'edit'
  let form = {
    name: '',
    description: '',
    icon: '✨',
    color: '#10b981',
    category: 'General',
    frequency: 'daily',
    target_count: 1,
    reminder_enabled: false,
    reminder_time: '09:00'
  };

  let showIconPicker = false;
  let showColorPicker = false;

  // Check if editing
  $: if ($showEditHabit && $editingHabit) {
    mode = 'edit';
    form = { ...$editingHabit };
  } else if ($showCreateHabit) {
    mode = 'create';
    form = {
      name: '',
      description: '',
      icon: '✨',
      color: '#10b981',
      category: 'General',
      frequency: 'daily',
      target_count: 1,
      reminder_enabled: false,
      reminder_time: '09:00'
    };
  }

  async function handleSubmit() {
    if (!form.name.trim()) return;

    if (mode === 'edit') {
      await updateHabit(form.id, form);
    } else {
      await createHabit(form);
    }

    await refreshData();
    close();
  }

  function close() {
    showCreateHabit.set(false);
    showEditHabit.set(false);
    editingHabit.set(null);
    showIconPicker = false;
    showColorPicker = false;
  }

  function backdropClick(e) {
    if (e.target === e.currentTarget) close();
  }
</script>

{#if $showCreateHabit || $showEditHabit}
  <div class="modal-backdrop" on:click={backdropClick} on:keydown={(e) => e.key === 'Escape' && close()} role="dialog" aria-modal="true">
    <div class="modal">
      <div class="modal-header">
        <h2>{mode === 'edit' ? 'Edit Habit' : 'Create New Habit'}</h2>
        <button class="close-btn" on:click={close}>✕</button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="modal-body">
        <!-- Icon & Color Selection -->
        <div class="icon-color-row">
          <div class="icon-selector">
            <button 
              type="button" 
              class="icon-display" 
              style="background: {form.color}20"
              on:click={() => showIconPicker = !showIconPicker}
            >
              {form.icon}
            </button>
            {#if showIconPicker}
              <div class="icon-picker">
                {#each HABIT_ICONS as icon}
                  <button
                    type="button"
                    class="icon-option"
                    class:selected={form.icon === icon}
                    on:click={() => { form.icon = icon; showIconPicker = false; }}
                  >
                    {icon}
                  </button>
                {/each}
              </div>
            {/if}
          </div>

          <div class="color-selector">
            {#each HABIT_COLORS as color}
              <button
                type="button"
                class="color-option"
                class:selected={form.color === color}
                style="background: {color}"
                on:click={() => form.color = color}
              ></button>
            {/each}
          </div>
        </div>

        <!-- Name -->
        <div class="form-group">
          <label for="name">Habit Name *</label>
          <input 
            id="name"
            type="text" 
            bind:value={form.name}
            placeholder="e.g., Read for 30 minutes"
            required
          />
        </div>

        <!-- Description -->
        <div class="form-group">
          <label for="description">Description</label>
          <textarea 
            id="description"
            bind:value={form.description}
            placeholder="Why is this habit important to you?"
            rows="2"
          ></textarea>
        </div>

        <!-- Category -->
        <div class="form-group">
          <label for="category">Category</label>
          <select id="category" bind:value={form.category}>
            {#each CATEGORIES as cat}
              <option value={cat}>{cat}</option>
            {/each}
          </select>
        </div>

        <!-- Frequency & Target -->
        <div class="form-row">
          <div class="form-group">
            <label for="frequency">Frequency</label>
            <select id="frequency" bind:value={form.frequency}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>

          <div class="form-group">
            <label for="target">Target per day</label>
            <input 
              id="target"
              type="number" 
              min="1" 
              max="99"
              bind:value={form.target_count}
            />
          </div>
        </div>

        <!-- Reminder -->
        <div class="form-group reminder-group">
          <label class="checkbox-label">
            <input type="checkbox" bind:checked={form.reminder_enabled} />
            <span>Enable daily reminder</span>
          </label>
          {#if form.reminder_enabled}
            <input 
              type="time" 
              bind:value={form.reminder_time}
              class="reminder-time"
            />
          {/if}
        </div>

        <!-- Actions -->
        <div class="modal-actions">
          <button type="button" class="btn-cancel" on:click={close}>Cancel</button>
          <button type="submit" class="btn-submit" disabled={!form.name.trim()}>
            {mode === 'edit' ? 'Save Changes' : 'Create Habit'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal {
    background: var(--bg);
    border-radius: 1rem;
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: var(--shadow-lg);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
  }

  .modal-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
  }

  .close-btn {
    width: 2rem;
    height: 2rem;
    border-radius: 0.375rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-secondary);
    font-size: 1.125rem;
  }

  .close-btn:hover {
    background: var(--bg-tertiary);
  }

  .modal-body {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
  }

  .icon-color-row {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .icon-selector {
    position: relative;
  }

  .icon-display {
    width: 3.5rem;
    height: 3.5rem;
    border-radius: 0.75rem;
    font-size: 1.75rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--border);
    transition: all 0.15s;
  }

  .icon-display:hover {
    border-color: var(--primary);
  }

  .icon-picker {
    position: absolute;
    top: 4rem;
    left: 0;
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    padding: 0.5rem;
    display: grid;
    grid-template-columns: repeat(8, 1fr);
    gap: 0.25rem;
    box-shadow: var(--shadow-lg);
    z-index: 10;
    width: 280px;
  }

  .icon-option {
    width: 2rem;
    height: 2rem;
    border-radius: 0.25rem;
    font-size: 1.125rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .icon-option:hover {
    background: var(--bg-tertiary);
  }

  .icon-option.selected {
    background: var(--primary);
  }

  .color-selector {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
  }

  .color-option {
    width: 1.75rem;
    height: 1.75rem;
    border-radius: 50%;
    border: 2px solid transparent;
    transition: all 0.15s;
  }

  .color-option:hover {
    transform: scale(1.15);
  }

  .color-option.selected {
    border-color: var(--text);
    box-shadow: 0 0 0 2px var(--bg), 0 0 0 4px var(--text);
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  .form-group label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .form-group input, .form-group textarea, .form-group select {
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--bg);
    color: var(--text);
    font-size: 0.875rem;
  }

  .form-group input:focus, .form-group textarea:focus, .form-group select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.1);
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .reminder-group {
    flex-direction: row;
    align-items: center;
    gap: 1rem;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    font-size: 0.875rem;
    color: var(--text);
  }

  .reminder-time {
    padding: 0.375rem 0.5rem;
    border: 1px solid var(--border);
    border-radius: 0.375rem;
    font-size: 0.875rem;
  }

  .modal-actions {
    display: flex;
    gap: 0.75rem;
    justify-content: flex-end;
    padding-top: 0.5rem;
  }

  .btn-cancel {
    padding: 0.625rem 1.25rem;
    border-radius: 0.5rem;
    color: var(--text-secondary);
    font-weight: 600;
    font-size: 0.875rem;
  }

  .btn-cancel:hover {
    background: var(--bg-tertiary);
  }

  .btn-submit {
    padding: 0.625rem 1.5rem;
    background: var(--primary);
    color: white;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    transition: all 0.15s;
  }

  .btn-submit:hover:not(:disabled) {
    background: var(--primary-dark);
  }

  .btn-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
</style>
