// Persistence adapter.
//
// Desktop (Tauri): state is saved to  ~/.habbitt/habits.json
// (the .habbitt folder is auto-created on first launch).
// Browser: falls back to window.localStorage. A localStorage mirror is also
// kept in the desktop app so the UI hydrates instantly and keeps working even
// if the file write is still in flight.
export const LS_KEY = 'habitt-v2';

export function isTauri() {
  return typeof window !== 'undefined' &&
    (window.__TAURI_INTERNALS__ != null || window.__TAURI__ != null);
}

let invokeRef = null;
async function invoke(cmd, args) {
  if (!invokeRef) {
    const mod = await import('@tauri-apps/api/core');
    invokeRef = mod.invoke;
  }
  return invokeRef(cmd, args);
}

let writeTimer = null;
let lastWritten = null;

function scheduleFileWrite(value) {
  clearTimeout(writeTimer);
  writeTimer = setTimeout(async () => {
    if (value === lastWritten) return;
    try {
      await invoke('write_data', { content: value });
      lastWritten = value;
    } catch {
      // file write failed — mirror stays in localStorage; retry on next change
    }
  }, 600);
}

export const hybridStorage = {
  async getItem() {
    if (isTauri()) {
      try {
        const raw = await invoke('read_data', {});
        if (raw && raw.trim() && raw.trim() !== '{}') {
          try { localStorage.setItem(LS_KEY, raw); } catch { /* noop */ }
          return raw;
        }
      } catch { /* fall through to mirror */ }
      try { return localStorage.getItem(LS_KEY); } catch { return null; }
    }
    try { return localStorage.getItem(LS_KEY); } catch { return null; }
  },
  setItem(_key, value) {
    try { localStorage.setItem(LS_KEY, value); } catch { /* quota */ }
    if (isTauri()) scheduleFileWrite(value);
    return Promise.resolve();
  },
  removeItem() {
    try { localStorage.removeItem(LS_KEY); } catch { /* noop */ }
    if (isTauri()) scheduleFileWrite('{}');
    return Promise.resolve();
  },
};

export async function getDataLocation() {
  if (!isTauri()) return null;
  try { return await invoke('data_path', {}); } catch { return null; }
}
