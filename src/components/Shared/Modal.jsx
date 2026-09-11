import React, { useEffect } from 'react';
import { X } from 'lucide-react';

/**
 * Modal shell: closes on backdrop click + Escape, locks body scroll.
 * `onClose` is NOT auto-called on Escape when a parent needs custom handling
 * (palette handles its own).
 */
export default function Modal({ title, icon, onClose, children, footer, wide, className = '' }) {
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose?.(); } };
    window.addEventListener('keydown', h);
    document.body.style.overflow = 'hidden';
    return () => { window.removeEventListener('keydown', h); document.body.style.overflow = ''; };
  }, [onClose]);

  return (
    <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose?.(); }}>
      <div className={`modal ${wide ? 'modal-wide' : ''} ${className}`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-head">
          {icon}
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close">
            <X size={17} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-foot">{footer}</div>}
      </div>
    </div>
  );
}
