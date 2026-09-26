import { Link } from 'react-router-dom';

import Icon from './Icon.jsx';
import Tilt from './Tilt.jsx';
import { Skeleton } from './Skeleton.jsx';

/** Dashboard summary tile with the pointer-tilt hover effect. */
export default function StatCard({ to, icon, label, value, hint, loading = false, accessory }) {
  const Wrapper = to ? Link : 'div';
  const linkProps = to ? { to } : {};

  return (
    <Tilt as={Wrapper} {...linkProps} className="surface block p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="eyebrow flex items-center gap-1.5">
            {icon && <Icon name={icon} className="h-4 w-4" />}
            {label}
          </p>
          {loading ? (
            <div className="mt-3 space-y-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-3 w-32" />
            </div>
          ) : (
            <>
              <p className="stat-figure mt-2 truncate text-2xl">{value}</p>
              {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
            </>
          )}
        </div>
        {!loading && accessory}
      </div>
    </Tilt>
  );
}
