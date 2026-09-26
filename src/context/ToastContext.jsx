import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';

import Icon from '../components/ui/Icon.jsx';
import { getErrorMessage } from '../services/api/errors.js';

const ToastContext = createContext(null);

const STYLES = {
  success: { alert: 'alert-success', icon: 'check-circle' },
  error: { alert: 'alert-error', icon: 'x-circle' },
  info: { alert: 'alert-info', icon: 'info' },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(0);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type, message, duration) => {
      const id = ++nextId.current;
      setToasts((list) => [...list.slice(-2), { id, type, message }]);
      setTimeout(() => dismiss(id), duration);
    },
    [dismiss]
  );

  const api = useMemo(
    () => ({
      success: (message) => push('success', message, 4000),
      info: (message) => push('info', message, 4500),
      error: (errorOrMessage) =>
        push('error', typeof errorOrMessage === 'string' ? errorOrMessage : getErrorMessage(errorOrMessage), 7000),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast toast-end toast-bottom z-[100] max-w-[calc(100vw-1.5rem)] sm:max-w-sm" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} role="status" className={`alert ${STYLES[t.type].alert} items-start gap-2 py-3 text-sm shadow-lg`}>
            <Icon name={STYLES[t.type].icon} className="mt-0.5 h-5 w-5 flex-shrink-0" />
            <span className="min-w-0 flex-1 break-words">{t.message}</span>
            <button type="button" className="btn btn-ghost btn-xs btn-square" onClick={() => dismiss(t.id)} aria-label="Dismiss notification">
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
}
