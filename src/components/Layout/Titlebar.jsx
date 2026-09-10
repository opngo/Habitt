import React, { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { Minus, Square, X, Maximize2 } from 'lucide-react';
import { useStore } from '../../lib/store';

export default function Titlebar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const appWindow = getCurrentWindow();
    appWindow.isMaximized().then(setIsMaximized);

    const unlisten = appWindow.onResized(() => {
      appWindow.isMaximized().then(setIsMaximized);
    });

    return () => {
      unlisten.then(fn => fn());
    };
  }, []);

  async function handleMinimize() {
    await getCurrentWindow().minimize();
  }

  async function handleMaximize() {
    await getCurrentWindow().toggleMaximize();
  }

  async function handleClose() {
    await getCurrentWindow().close();
  }

  return (
    <div className="titlebar">
      <div data-tauri-drag-region className="titlebar-drag">
        <div className="titlebar-logo">
          <div className="titlebar-logo-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span className="titlebar-title">Habitt</span>
        </div>
      </div>

      <div className="titlebar-controls">
        <button onClick={handleMinimize} className="titlebar-btn" title="Minimize">
          <Minus size={14} />
        </button>
        <button onClick={handleMaximize} className="titlebar-btn" title="Maximize">
          {isMaximized ? <Square size={12} /> : <Maximize2 size={14} />}
        </button>
        <button onClick={handleClose} className="titlebar-btn titlebar-btn-close" title="Close">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
