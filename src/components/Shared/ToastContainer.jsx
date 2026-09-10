import React from 'react';
import { useStore } from '../../lib/store';
import { Check, X, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts } = useStore();

  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <div key={toast.id} className={`toast ${toast.type || 'info'}`}>
          {toast.type === 'success' && <Check size={16} color="#22c55e" />}
          {toast.type === 'error' && <X size={16} color="#ef4444" />}
          {toast.type === 'info' && <Info size={16} color="#3b82f6" />}
          <span>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
