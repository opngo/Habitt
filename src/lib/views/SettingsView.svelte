<script>
  import { theme, passwordEnabled, habits, completions, journalEntries } from '../stores.js';
  import { saveSetting, getSetting, hashPassword, verifyPassword } from '../db.js';

  export let refreshData;

  let currentPassword = '';
  let newPassword = '';
  let confirmPassword = '';
  let passwordMessage = '';
  let passwordMessageType = 'success';
  let showExportImport = false;

  async function toggleTheme() {
    const newTheme = $theme === 'light' ? 'dark' : 'light';
    theme.set(newTheme);
    await saveSetting('theme', newTheme);
  }

  async function setPassword() {
    if (newPassword.length < 4) {
      passwordMessage = 'Password must be at least 4 characters';
      passwordMessageType = 'error';
      return;
    }
    if (newPassword !== confirmPassword) {
      passwordMessage = 'Passwords do not match';
      passwordMessageType = 'error';
      return;
    }

    const hash = await hashPassword(newPassword);
    await saveSetting('password_hash', hash);
    passwordEnabled.set(true);
    passwordMessage = 'Password set successfully!';
    passwordMessageType = 'success';
    newPassword = '';
    confirmPassword = '';
  }

  async function removePassword() {
    if (!currentPassword) {
      passwordMessage = 'Enter your current password';
      passwordMessageType = 'error';
      return;
    }

    const savedHash = await getSetting('password_hash');
    const valid = await verifyPassword(currentPassword, savedHash);
    if (!valid) {
      passwordMessage = 'Incorrect password';
      passwordMessageType = 'error';
      return;
    }

    await saveSetting('password_hash', '');
    passwordEnabled.set(false);
    passwordMessage = 'Password removed';
    passwordMessageType = 'success';
    currentPassword = '';
  }

  async function exportData() {
    const data = {
      habits: $habits,
      completions: $completions,
      journalEntries: $journalEntries,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `habitt-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const text = await file.text();
      try {
        const data = JSON.parse(text);
        alert(`Import file contains:\n- ${data.habits?.length || 0} habits\n- ${data.completions?.length || 0} completions\n- ${data.journalEntries?.length || 0} journal entries\n\nNote: Full import will be available in a future update.`);
      } catch (e) {
        alert('Invalid export file');
      }
    };
    input.click();
  }
</script>

<div class="settings">
  <div class="settings-header">
    <h1 class="page-title">Settings</h1>
    <p class="page-subtitle">Customize your Habitt. experience</p>
  </div>

  <!-- Appearance -->
  <section class="settings-section">
    <h2 class="section-title">Appearance</h2>
    <div class="setting-item">
      <div class="setting-info">
        <span class="setting-label">Theme</span>
        <span class="setting-desc">Choose between light and dark mode</span>
      </div>
      <button class="theme-toggle" on:click={toggleTheme}>
        <span class="theme-icon">{$theme === 'light' ? '☀️' : '🌙'}</span>
        <span>{$theme === 'light' ? 'Light' : 'Dark'}</span>
      </button>
    </div>
  </section>

  <!-- Password Protection -->
  <section class="settings-section">
    <h2 class="section-title">🔒 Password Protection</h2>
    <p class="section-desc">Optionally protect your habits and journal with a password</p>

    {#if $passwordEnabled}
      <div class="password-status enabled">
        <span>✓ Password protection is enabled</span>
      </div>
      <div class="password-form">
        <div class="form-group">
          <label>Current Password (to remove)</label>
          <input type="password" bind:value={currentPassword} placeholder="Enter current password" />
        </div>
        <button class="btn-danger" on:click={removePassword}>Remove Password</button>
      </div>
    {:else}
      <div class="password-status disabled">
        <span>Password protection is disabled</span>
      </div>
      <div class="password-form">
        <div class="form-group">
          <label>New Password</label>
          <input type="password" bind:value={newPassword} placeholder="At least 4 characters" />
        </div>
        <div class="form-group">
          <label>Confirm Password</label>
          <input type="password" bind:value={confirmPassword} placeholder="Repeat password" />
        </div>
        <button class="btn-primary" on:click={setPassword}>Set Password</button>
      </div>
    {/if}

    {#if passwordMessage}
      <div class="password-message" class:error={passwordMessageType === 'error'} class:success={passwordMessageType === 'success'}>
        {passwordMessage}
      </div>
    {/if}
  </section>

  <!-- Data Management -->
  <section class="settings-section">
    <h2 class="section-title">Data Management</h2>
    <p class="section-desc">Export or import your habit data</p>
    
    <div class="data-actions">
      <button class="btn-export" on:click={exportData}>
        📤 Export Data
      </button>
      <button class="btn-import" on:click={importData}>
        📥 Import Data
      </button>
    </div>

    <div class="data-stats">
      <div class="data-stat">
        <span class="data-stat-value">{$habits.length}</span>
        <span class="data-stat-label">Habits</span>
      </div>
      <div class="data-stat">
        <span class="data-stat-value">{$completions.length}</span>
        <span class="data-stat-label">Completions</span>
      </div>
      <div class="data-stat">
        <span class="data-stat-value">{$journalEntries.length}</span>
        <span class="data-stat-label">Journal Entries</span>
      </div>
    </div>
  </section>

  <!-- About -->
  <section class="settings-section">
    <h2 class="section-title">About</h2>
    <div class="about-info">
      <p><strong>Habitt.</strong> v1.0.0</p>
      <p>A beautiful, privacy-first habit tracker for your desktop.</p>
      <p>All data is stored locally on your device. No cloud, no tracking, no ads.</p>
    </div>
  </section>
</div>

<style>
  .settings {
    max-width: 700px;
    margin: 0 auto;
  }

  .settings-header {
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

  .settings-section {
    background: var(--bg-secondary);
    border: 1px solid var(--border);
    border-radius: 0.75rem;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  .section-desc {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  .setting-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.75rem 0;
  }

  .setting-info {
    display: flex;
    flex-direction: column;
    gap: 0.125rem;
  }

  .setting-label {
    font-weight: 600;
    font-size: 0.9375rem;
  }

  .setting-desc {
    font-size: 0.8125rem;
    color: var(--text-secondary);
  }

  .theme-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: var(--bg-tertiary);
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--text);
    transition: all 0.15s;
  }

  .theme-toggle:hover {
    background: var(--primary);
    color: white;
  }

  .password-status {
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .password-status.enabled {
    background: rgba(16, 185, 129, 0.1);
    color: var(--primary);
  }

  .password-status.disabled {
    background: var(--bg-tertiary);
    color: var(--text-secondary);
  }

  .password-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .form-group label {
    font-size: 0.8125rem;
    font-weight: 600;
    color: var(--text-secondary);
  }

  .form-group input {
    padding: 0.625rem 0.75rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    background: var(--bg);
    color: var(--text);
    font-size: 0.875rem;
  }

  .form-group input:focus {
    outline: none;
    border-color: var(--primary);
  }

  .btn-primary, .btn-danger {
    padding: 0.5rem 1.25rem;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    align-self: flex-start;
    transition: all 0.15s;
  }

  .btn-primary {
    background: var(--primary);
    color: white;
  }

  .btn-primary:hover {
    background: var(--primary-dark);
  }

  .btn-danger {
    background: var(--danger);
    color: white;
  }

  .btn-danger:hover {
    opacity: 0.9;
  }

  .password-message {
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    font-size: 0.8125rem;
    font-weight: 500;
  }

  .password-message.success {
    background: rgba(16, 185, 129, 0.1);
    color: var(--primary);
  }

  .password-message.error {
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
  }

  .data-actions {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1.25rem;
  }

  .btn-export, .btn-import {
    padding: 0.625rem 1.25rem;
    border: 1px solid var(--border);
    border-radius: 0.5rem;
    font-weight: 500;
    font-size: 0.875rem;
    color: var(--text);
    transition: all 0.15s;
  }

  .btn-export:hover, .btn-import:hover {
    background: var(--bg-tertiary);
    border-color: var(--primary);
  }

  .data-stats {
    display: flex;
    gap: 2rem;
  }

  .data-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.125rem;
  }

  .data-stat-value {
    font-size: 1.5rem;
    font-weight: 800;
    color: var(--primary);
  }

  .data-stat-label {
    font-size: 0.75rem;
    color: var(--text-secondary);
  }

  .about-info {
    color: var(--text-secondary);
    font-size: 0.875rem;
    line-height: 1.7;
  }

  .about-info strong {
    color: var(--text);
  }
</style>
