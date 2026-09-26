import { Link } from 'react-router-dom';
import Icon from '../ui/Icon.jsx';

export default function SummaryCard({ icon, title, to, children, emptyText }) {
  return (
    <div className="surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="eyebrow flex items-center gap-1.5">
          <Icon name={icon} className="h-4 w-4" />
          {title}
        </p>
        {to && children && (
          <Link to={to} className="text-xs font-medium text-primary hover:underline">
            View
          </Link>
        )}
      </div>
      {children || <p className="text-sm text-muted">{emptyText}</p>}
    </div>
  );
}