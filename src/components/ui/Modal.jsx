import { useEffect, useId } from 'react';

import Icon from './Icon.jsx';
import { cn } from '../../utils/cn.js';

export default function Modal({ open, onClose, title, children, actions, size = 'md', dismissible = true, className = '' }) {
  const titleId = useId();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && dismissible && open) {
        onClose?.();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, dismissible, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 1. Dedicated Backdrop Overlay (ONLY this gets blurred) */}
      <div 
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={dismissible ? onClose : undefined} 
      />

      {/* 2. Modal Window (Stays crisp and sharp on top) */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={cn(
          'relative z-10 w-full rounded-xl border border-base-300 bg-surface-3 p-6 shadow-pop',
          size === 'lg' && 'sm:max-w-2xl',
          size === 'xl' && 'sm:max-w-3xl',
          className
        )}
      >
        <div className="flex items-start justify-between gap-4">
          <h3 id={titleId} className="text-lg font-semibold text-white">
            {title}
          </h3>
          <button
            type="button"
            className="btn btn-ghost btn-sm btn-square -mr-2 -mt-1"
            onClick={onClose}
            disabled={!dismissible}
            aria-label="Close dialog"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>
        <div className="pt-3">{children}</div>
        {actions && <div className="mt-6 flex justify-end gap-3">{actions}</div>}
      </div>
    </div>
  );
}