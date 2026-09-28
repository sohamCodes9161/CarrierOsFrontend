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
        'group relative w-56 flex-shrink-0 rounded-box border bg-surface-3 p-3.5 text-left transition-all duration-200',
        'hover:-translate-y-0.5 hover:border-white/30 hover:shadow-pop',
        completed &&
          'border-success/60 shadow-[0_0_0_1px_rgba(76,203,140,0.35),0_0_22px_-8px_rgba(76,203,140,0.7)] hover:border-success',
        inProgress && !completed && 'node-pulse border-white/40',
        !completed && !inProgress && !locked && !skipped && 'border-base-300',
        skipped && !completed && 'border-base-300 opacity-60',
        locked && !completed && 'border-base-300 opacity-50 hover:opacity-80'
      )}
      aria-label={`${node.title} — ${humanize(node.status || 'not_started')}${locked ? ', locked until prerequisites are done' : ''}`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{ color: color.text, backgroundColor: color.bg, borderColor: color.border }}
        >
          {node.category || 'General'}
        </span>
        {completed ? (
          <Icon name="check-circle" className="h-4 w-4 flex-shrink-0 text-success" />
        ) : locked ? (
          <Icon name="lock" className="h-3.5 w-3.5 flex-shrink-0 text-faint" />
        ) : null}
      </div>

      <p
        className={cn(
          'mt-2 text-sm font-semibold leading-snug text-white',
          (completed || skipped) && 'text-muted',
          completed && 'line-through'
        )}
      >
        {node.title}
      </p>

      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-faint">
        {node.priorityLabel && <span className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_DOT[node.priorityLabel] || 'bg-faint')} aria-hidden="true" />}
        <span>{humanize(node.complexityTier || '')}</span>
        {node.estimatedDurationDays ? <span>· ~{node.estimatedDurationDays}d</span> : null}
      </div>

      {inProgress && (
        <span className="absolute right-3 top-3 flex h-2 w-2" aria-hidden="true">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
        </span>
      )}
    </button>
  );
}
