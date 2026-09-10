<script>
  import { isAuthenticated } from '../stores.js';
  import { getSetting, verifyPassword } from '../db.js';

  let password = '';
  let error = '';
  let isLoading = false;

  async function handleSubmit() {
    if (!password) return;
    
    isLoading = true;
    error = '';
    
    try {
      const savedHash = await getSetting('password_hash');
      if (!savedHash) {
        isAuthenticated.set(true);
        return;
      }
      
      const valid = await verifyPassword(password, savedHash);
      if (valid) {
        isAuthenticated.set(true);
      } else {
        error = 'Incorrect password. Please try again.';
        password = '';
      }
    } catch (e) {
      error = 'An error occurred. Please try again.';
    } finally {
      isLoading = false;
    }
  }
</script>

<div class="password-gate">
  <div class="gate-card">
    <div class="gate-icon">🔒</div>
    <h1 class="gate-title">Habitt.</h1>
    <p class="gate-subtitle">Enter your password to continue</p>

    <form on:submit|preventDefault={handleSubmit} class="gate-form">
      <input
        type="password"
        bind:value={password}
        placeholder="Enter password"
        autofocus
        disabled={isLoading}
      />
      <button type="submit" disabled={!password || isLoading}>
        {#if isLoading}
          Checking...
        {:else}
          Unlock
        {/if}
      </button>
    </form>

    {#if error}
      <div class="error-message">{error}</div>
    {/if}
  </div>
</div>

<style>
  .password-gate {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--bg), var(--bg-secondary));
  }

  .gate-card {
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: 1.5rem;
    padding: 3rem 2.5rem;
    width: 100%;
    max-width: 380px;
    text-align: center;
    box-shadow: var(--shadow-lg);
  }

  .gate-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
  }

  .gate-title {
    font-size: 2rem;
    font-weight: 800;
    color: var(--primary);
    margin-bottom: 0.25rem;
  }

  .gate-subtitle {
    color: var(--text-secondary);
    font-size: 0.9375rem;
    margin-bottom: 2rem;
  }

  .gate-form {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .gate-form input {
    padding: 0.75rem 1rem;
    border: 2px solid var(--border);
    border-radius: 0.625rem;
    font-size: 1rem;
    background: var(--bg-secondary);
    color: var(--text);
    text-align: center;
    letter-spacing: 0.25rem;
  }

  .gate-form input:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
  }

  .gate-form button {
    padding: 0.75rem 1rem;
    background: var(--primary);
    color: white;
    border-radius: 0.625rem;
    font-weight: 700;
    font-size: 1rem;
    transition: all 0.15s;
  }

  .gate-form button:hover:not(:disabled) {
    background: var(--primary-dark);
    transform: translateY(-1px);
  }

  .gate-form button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .error-message {
    margin-top: 1rem;
    padding: 0.625rem;
    background: rgba(239, 68, 68, 0.1);
    color: var(--danger);
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 500;
  }
</style>
