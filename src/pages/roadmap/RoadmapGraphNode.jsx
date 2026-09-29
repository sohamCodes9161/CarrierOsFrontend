import Icon from '../../components/ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { domainColor } from '../../utils/domainColor.js';
import { humanize } from '../../utils/format.js';

const PRIORITY_DOT = { critical: 'bg-error', high: 'bg-warning', medium: 'bg-info', low: 'bg-faint' };

/** One topic card inside the interactive graph. Status and prerequisite-lock drive its styling. */
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
        'group relative w-64 flex-shrink-0 rounded-2xl border bg-surface-3 p-4 text-left transition-all duration-300',
        'hover:-translate-y-1 hover:shadow-lg',
        completed &&
          'border-success/40 bg-success/5 shadow-[0_4px_20px_-8px_rgba(76,203,140,0.2)] hover:border-success/80',
        inProgress && !completed && 
          'node-pulse border-info/50 bg-info/5 shadow-[0_0_15px_-3px_rgba(59,130,246,0.2)] hover:border-info',
        !completed && !inProgress && !locked && !skipped && 
          'border-base-300 hover:border-primary/40 hover:bg-base-200/50',
        skipped && !completed && 
          'border-base-300 opacity-50 grayscale',
        locked && !completed && 
          'border-dashed border-base-300 bg-transparent opacity-60 hover:opacity-100 hover:border-solid hover:border-warning/50'
      )}
      aria-label={`${node.title} — ${humanize(node.status || 'not_started')}${locked ? ', locked until prerequisites are done' : ''}`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider"
          style={{ color: color.text, backgroundColor: color.bg, borderColor: color.border }}
        >
          {node.category || 'General'}
        </span>
        {completed ? (
          <Icon name="check-circle" className="h-4 w-4 flex-shrink-0 text-success drop-shadow-[0_0_3px_rgba(76,203,140,0.8)]" />
        ) : locked ? (
          <Icon name="lock" className="h-3.5 w-3.5 flex-shrink-0 text-warning" />
        ) : null}
      </div>

      <p
        className={cn(
          'text-[15px] font-bold leading-snug',
          (completed || skipped) ? 'text-muted' : 'text-white group-hover:text-primary transition-colors',
          completed && 'line-through decoration-success/50'
        )}
      >
        {node.title}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium text-muted">
        {node.priorityLabel && (
          <span className="flex items-center gap-1.5">
            <span className={cn('h-1.5 w-1.5 rounded-full shadow-sm', PRIORITY_DOT[node.priorityLabel] || 'bg-faint')} aria-hidden="true" />
            <span className="capitalize">{node.priorityLabel}</span>
          </span>
        )}
        <span>· {humanize(node.complexityTier || '')}</span>
        {node.estimatedDurationDays ? <span>· ~{node.estimatedDurationDays}d</span> : null}
      </div>

      {inProgress && (
        <span className="absolute -right-1 -top-1 flex h-3 w-3" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-info opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-info" />
        </span>
      )}
    </button>
  );
}