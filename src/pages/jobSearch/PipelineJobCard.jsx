import { Calendar, Trash2, ExternalLink } from 'lucide-react';
import Card from '../../components/ui/Card.jsx';
import { APPLICATION_STATUSES } from '../../utils/constants.js';

export default function PipelineJobCard({ app, onStatusChange, onDelete }) {
  // Format the applied date safely
  const appliedDate = app.appliedDate || app.createdAt;
  const dateString = appliedDate 
    ? new Date(appliedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) 
    : 'Unknown date';

  return (
    <Card className="group relative p-4 flex flex-col gap-3 bg-surface-2 border border-base-300 hover:border-primary/50 hover:shadow-lg transition-all">
      {/* Absolute positioned delete button (visible on hover) */}
      <button 
        onClick={() => onDelete(app._id)}
        className="absolute top-3 right-3 p-1.5 rounded-md text-muted hover:bg-error/20 hover:text-error opacity-0 group-hover:opacity-100 transition-all focus:opacity-100"
        title="Delete application"
      >
        <Trash2 className="h-4 w-4" />
      </button>

      <div className="pr-6">
        <h4 className="font-bold text-white text-sm leading-tight line-clamp-2">
          {app.jobUrl ? (
            <a href={app.jobUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors inline-flex items-center gap-1">
              {app.jobTitle} <ExternalLink className="h-3 w-3 opacity-50" />
            </a>
          ) : (
            app.jobTitle
          )}
        </h4>
        <p className="text-xs text-muted font-medium mt-1">{app.company}</p>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-base-300/60">
        <span className="text-[10px] font-semibold text-muted flex items-center gap-1 tracking-wider uppercase">
          <Calendar className="h-3 w-3" /> {dateString}
        </span>
        
        <select
          value={app.status}
          onChange={(e) => onStatusChange(app._id, e.target.value)}
          className="select select-bordered select-xs h-7 min-h-0 text-[11px] font-semibold rounded-lg bg-surface-1 text-white border-base-300 cursor-pointer focus:border-primary"
        >
          {APPLICATION_STATUSES.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
      </div>
    </Card>
  );
}