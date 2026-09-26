import { Link } from 'react-router-dom';

import Icon from '../ui/Icon.jsx';

export default function PageHeader({ title, description, actions, backTo, backLabel = 'Back' }) {
  return (
    <div className="mb-7 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        {backTo && (
          <Link to={backTo} className="mb-2 inline-flex items-center gap-1 text-sm text-muted transition-colors hover:text-white">
            <Icon name="arrow-right" className="h-4 w-4 rotate-180" />
            {backLabel}
          </Link>
        )}
        <h1 className="break-words text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
