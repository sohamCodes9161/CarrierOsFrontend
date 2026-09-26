import Icon from './Icon.jsx';
import { ApiError } from '../../services/api/errors.js';
import { cn } from '../../utils/cn.js';

/** Inline alert for failed actions. Accepts an ApiError, an Error, or a plain string. */
export default function ErrorAlert({ error, title, className = '', children }) {
  if (!error) return null;
  const isApi = error instanceof ApiError;
  const message = typeof error === 'string' ? error : isApi ? error.message : 'Something went wrong. Please try again.';
  const details = isApi ? error.details : [];

  return (
    <div
      role="alert"
      className={cn('flex items-start gap-3 rounded-btn border border-error/30 bg-error/10 px-4 py-3 text-sm text-white', className)}
    >
      <Icon name="x-circle" className="mt-0.5 h-5 w-5 flex-shrink-0 text-error" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-semibold">{title}</p>}
        <p className={title ? '' : 'font-medium'}>{message}</p>
        {details.length > 0 && (
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-muted">
            {details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        )}
        {children}
      </div>
    </div>
  );
}
