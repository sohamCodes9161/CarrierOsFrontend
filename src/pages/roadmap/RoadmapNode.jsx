import Badge from '../../components/ui/Badge.jsx';
import { selectClass } from '../../components/forms/FormField.jsx';
import { cn } from '../../utils/cn.js';
import { ROADMAP_STATUSES } from '../../utils/constants.js';
import { formatDurationDays, humanize } from '../../utils/format.js';

const PRIORITY_TONES = { critical: 'error', high: 'warning', medium: 'info', low: 'neutral' };
const IMPORTANCE_TONES = { core: 'primary', important: 'secondary', 'nice-to-have': 'neutral' };
const RESOURCE_TONES = { article: 'neutral', video: 'neutral', course: 'neutral', 'official-docs': 'neutral', book: 'neutral' };

/** A single roadmap topic with its status control and expandable resources. */
export default function RoadmapNode({ node, prerequisites = [], onStatusChange, onOpenDetail, saving = false }) {
  const done = node.status === 'completed';
  const skipped = node.status === 'skipped';
  const blocking = prerequisites.filter((p) => p.status !== 'completed' && p.status !== 'skipped');
  const hasDetails = node.resources?.length > 0 || node.suggestedProjects?.length > 0;

  return (
    <div className={cn('surface p-4', (done || skipped) && 'bg-base-200/60')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenDetail ? (
              <button
                type="button"
                onClick={() => onOpenDetail(node.id)}
                className={cn(
                  'text-left text-sm font-semibold hover:underline',
                  done && 'text-muted line-through',
                  skipped && 'text-muted'
                )}
              >
                {node.title}
              </button>
            ) : (
              <h3 className={cn('text-sm font-semibold', done && 'text-muted line-through', skipped && 'text-muted')}>{node.title}</h3>
            )}
            {node.priorityLabel && <Badge tone={PRIORITY_TONES[node.priorityLabel] || 'neutral'}>{humanize(node.priorityLabel)}</Badge>}
            {node.importance && <Badge tone={IMPORTANCE_TONES[node.importance] || 'neutral'}>{humanize(node.importance)}</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted">
            {[node.category, node.complexityTier && humanize(node.complexityTier), node.estimatedDurationDays && `~${formatDurationDays(node.estimatedDurationDays)}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {node.description && <p className="mt-2 text-sm leading-relaxed">{node.description}</p>}
          {prerequisites.length > 0 && (
            <p className={cn('mt-2 text-xs', blocking.length > 0 ? 'text-warning' : 'text-muted')}>
              {blocking.length > 0 ? 'Do first: ' : 'Builds on: '}
              {(blocking.length > 0 ? blocking : prerequisites).map((p) => p.title).join(', ')}
            </p>
          )}
        </div>

        <div className="w-full flex-shrink-0 sm:w-40">
          <label htmlFor={`status-${node.id}`} className="sr-only">
            Status for {node.title}
          </label>
          <div className="relative">
            <select
              id={`status-${node.id}`}
              className={selectClass('', 'select-sm')}
              value={node.status || 'not_started'}
              onChange={(e) => onStatusChange(node.id, e.target.value)}
              disabled={saving}
            >
              {ROADMAP_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {saving && <span className="loading loading-spinner loading-xs absolute right-8 top-1/2 -translate-y-1/2" aria-hidden="true" />}
          </div>
        </div>
      </div>

      {hasDetails && (
        <div className="collapse collapse-arrow mt-3 rounded-btn border border-base-300">
          <input type="checkbox" aria-label={`Show resources for ${node.title}`} />
          <div className="collapse-title min-h-0 py-2 text-xs font-medium">Resources and project ideas</div>
          <div className="collapse-content space-y-4 text-sm">
            {node.resources?.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Resources</p>
                <ul className="space-y-2">
                  {node.resources.map((res, i) => (
                    <li key={`${i}-${res.title}`}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{res.title}</span>
                        {res.type && <Badge tone={RESOURCE_TONES[res.type] || 'neutral'}>{humanize(res.type)}</Badge>}
                      </div>
                      {res.description && <p className="text-xs text-muted">{res.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {node.suggestedProjects?.length > 0 && (
              <div>
                <p className="eyebrow mb-2">Practice projects</p>
                <ul className="space-y-2">
                  {node.suggestedProjects.map((p, i) => (
                    <li key={`${i}-${p.title}`}>
                      <p className="font-medium">{p.title}</p>
                      {p.description && <p className="text-xs text-muted">{p.description}</p>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
