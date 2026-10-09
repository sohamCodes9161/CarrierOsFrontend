import Icon from '../../components/ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { domainColor } from '../../utils/domainColor.js';
import { humanize } from '../../utils/format.js';

const PRIORITY_DOT = { critical: 'bg-error', high: 'bg-warning', medium: 'bg-info', low: 'bg-faint' };

export default function RoadmapGraphNode({ node, locked, onOpen, registerRef }) {
  const completed = node.status === 'completed';
  const inProgress = node.status === 'in_progress';
  const skipped = node.status === 'skipped';
  const color = domainColor(node.category);

  return (
    <button
      type="button"
      ref={(el) => registerRef?.(node.id, el)}
      onClick={() => onOpen(node.id)}
      className={cn(
        'group relative w-full flex-shrink-0 rounded-xl border bg-surface-2 p-5 text-left transition-all duration-300 ease-out overflow-hidden',
        'hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]',
        completed &&
          'border-success/30 bg-success/5 shadow-sm hover:border-success/60',
        inProgress && !completed && 
          'border-info/40 bg-info/5 shadow-sm hover:border-info/80',
        !completed && !inProgress && !locked && !skipped && 
          'border-base-300 hover:border-primary/50 hover:bg-base-200/80',
        skipped && !completed && 
          'border-base-300 opacity-40 grayscale hover:opacity-70',
        locked && !completed && 
          'border-dashed border-base-300 bg-surface/50 opacity-50 hover:opacity-100 hover:border-solid hover:border-warning/50'
      )}
      aria-label={`${node.title} — ${humanize(node.status || 'not_started')}${locked ? ', locked until prerequisites are done' : ''}`}
    >
      {/* Decorative left accent border based on status */}
      <div className={cn(
        "absolute left-0 top-0 bottom-0 w-1 transition-colors",
        completed ? "bg-success/80" : inProgress ? "bg-info/80" : locked ? "bg-warning/30" : "bg-base-300 group-hover:bg-primary/50"
      )} />

      <div className="flex items-start justify-between gap-3 mb-3 ml-1">
        <span
          className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface"
          style={{ color: color.text, borderColor: color.border }}
        >
          {node.category || 'General'}
        </span>
        {completed ? (
          <Icon name="check-circle" className="h-5 w-5 flex-shrink-0 text-success" />
        ) : locked ? (
          <Icon name="lock" className="h-4 w-4 flex-shrink-0 text-warning/70 mt-0.5" />
        ) : null}
      </div>

      <p
        className={cn(
          'text-base font-bold leading-tight ml-1',
          (completed || skipped) ? 'text-muted' : 'text-white group-hover:text-primary transition-colors',
          completed && 'line-through decoration-success/50'
        )}
      >
        {node.title}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2.5 text-[11px] font-medium text-muted ml-1">
        {node.priorityLabel && (
          <span className="flex items-center gap-1.5 bg-base-100/50 px-2 py-1 rounded-md border border-base-300">
            <span className={cn('h-1.5 w-1.5 rounded-full shadow-sm', PRIORITY_DOT[node.priorityLabel] || 'bg-faint')} aria-hidden="true" />
            <span className="capitalize">{node.priorityLabel}</span>
          </span>
        )}
        <span className="bg-base-100/50 px-2 py-1 rounded-md border border-base-300">
          {humanize(node.complexityTier || '')}
        </span>
        {node.estimatedDurationDays ? (
          <span className="bg-base-100/50 px-2 py-1 rounded-md border border-base-300 text-info/90">
            ~{node.estimatedDurationDays}d
          </span>
        ) : null}
      </div>

      {/* Ping animation for active node */}
      {inProgress && (
        <span className="absolute right-3 top-3 flex h-3 w-3" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-info" />
        </span>
      )}
    </button>
  );
}