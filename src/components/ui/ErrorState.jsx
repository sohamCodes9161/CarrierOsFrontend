import { Link } from 'react-router-dom';

import Button from './Button.jsx';
import Icon from './Icon.jsx';
import { ApiError } from '../../services/api/errors.js';
import { cn } from '../../utils/cn.js';

export default function ErrorState({ error, title, onRetry, backTo, backLabel = 'Go back', className = '' }) {
  const isApi = error instanceof ApiError;
  const message = typeof error === 'string' ? error : isApi ? error.message : 'Something went wrong. Please try again.';
  const heading = title || 'Something went wrong';

  return (
    <div className={cn('surface flex flex-col items-center px-6 py-12 text-center', className)} role="alert">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-error/10 text-error">
        <Icon name="warning" className="h-6 w-6" />
      </div>
      <h2 className="text-base font-semibold text-white">{heading}</h2>
      <p className="mt-1 max-w-md text-sm text-muted">{message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            <Icon name="refresh" className="h-4 w-4" />
            Try again
          </Button>
        )}
        {backTo && (
          <Button as={Link} to={backTo} variant="ghost" size="sm">
            {backLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
