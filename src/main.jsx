import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { initTheme } from './lib/store';
import './styles.css';

initTheme();

// One-time achievement sweep on boot (streaks may have changed while app was closed)
setTimeout(() => {
  try { import('./lib/store').then((m) => m.useStore.getState().checkAchievements()); } catch { /* noop */ }
}, 400);

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
