import React from 'react';
import { CheckCircle2, Info, XCircle, Zap } from 'lucide-react';
import { useStore } from '../../lib/store';
import DynIcon from './DynIcon';

const KIND = {
  success: { icon: CheckCircle2, color: '#22c55e' },
  info: { icon: Info, color: '#3b82f6' },
  error: { icon: XCircle, color: '#ef4444' },
};

export default function ToastContainer() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  if (!toasts.length) return null;
  return (
    <div className="toast-stack">
      {toasts.map((t) => {
        const k = KIND[t.type] || KIND.info;
        return (
          <div key={t.id} className="toast" onClick={() => dismiss(t.id)} style={{ cursor: 'pointer' }}>
            {t.icon ? <DynIcon name={t.icon} size={17} color={t.color || k.color} /> : <k.icon size={17} color={k.color} />}
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.action && (
              <button
                className="btn btn-sm"
                onClick={(e) => { e.stopPropagation(); t.action.onClick(); dismiss(t.id); }}
              >
                {t.action.label}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
