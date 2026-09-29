import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { selectClass } from '../../components/forms/FormField.jsx';
import { cn } from '../../utils/cn.js';
import { ROADMAP_STATUSES } from '../../utils/constants.js';
import { formatDurationDays, humanize } from '../../utils/format.js';

const PRIORITY_TONES = { critical: 'error', high: 'warning', medium: 'info', low: 'neutral' };
const IMPORTANCE_TONES = { core: 'primary', important: 'secondary', 'nice-to-have': 'neutral' };
const RESOURCE_TONES = { article: 'info', video: 'error', course: 'primary', 'official-docs': 'neutral', book: 'warning', interactive: 'secondary' };

const TYPE_ICONS = {
  article: 'file-text',
  video: 'play-circle',
  course: 'monitor',
  'official-docs': 'book-open',
  book: 'book',
  interactive: 'terminal'
};

/** A single roadmap topic with its status control and expandable resources. */
export default function RoadmapNode({ node, prerequisites = [], onStatusChange, onOpenDetail, saving = false }) {
  const done = node.status === 'completed';
  const skipped = node.status === 'skipped';
  const blocking = prerequisites.filter((p) => p.status !== 'completed' && p.status !== 'skipped');
  const hasDetails = node.resources?.length > 0 || node.suggestedProjects?.length > 0 || node.checklist?.length > 0 || node.practice?.length > 0;

  const renderResourceLink = (res, i) => {
    const content = (
      <>
        <div className="flex items-center gap-2">
          <Icon name={TYPE_ICONS[res.type] || 'external-link'} className={cn('h-3.5 w-3.5', res.url ? 'text-muted group-hover:text-primary' : 'text-muted')} />
          <span className={cn('font-medium', res.url && 'group-hover:text-primary')}>{res.title}</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {res.type && <Badge tone={RESOURCE_TONES[res.type] || 'neutral'}>{humanize(res.type)}</Badge>}
          {res.isFree && <Badge tone="success">Free</Badge>}
        </div>
        {res.description && <p className="mt-1.5 text-xs text-muted line-clamp-1">{res.description}</p>}
      </>
    );

    const baseClass = "block rounded-lg border border-base-300 bg-base-200/30 p-3 transition-colors";
    
    if (res.url) {
      return (
        <li key={`${i}-${res.title}`}>
          <a href={res.url} target="_blank" rel="noopener noreferrer" className={cn("group hover:border-primary/40 hover:bg-base-200/60", baseClass)}>
            {content}
          </a>
        </li>
      );
    }
    
    return <li key={`${i}-${res.title}`} className={baseClass}>{content}</li>;
  };

  return (
    <div className={cn('surface transition-all duration-200 hover:border-base-300 p-4', (done || skipped) && 'bg-base-200/40')}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenDetail ? (
              <button
                type="button"
                onClick={() => onOpenDetail(node.id)}
                className={cn(
                  'text-left text-[15px] font-bold hover:text-primary transition-colors hover:underline',
                  done && 'text-muted line-through hover:text-muted',
                  skipped && 'text-muted'
                )}
              >
                {node.title}
              </button>
            ) : (
              <h3 className={cn('text-[15px] font-bold', done && 'text-muted line-through', skipped && 'text-muted')}>{node.title}</h3>
            )}
            {node.priorityLabel && <Badge tone={PRIORITY_TONES[node.priorityLabel] || 'neutral'}>{humanize(node.priorityLabel)}</Badge>}
            {node.importance && <Badge tone={IMPORTANCE_TONES[node.importance] || 'neutral'}>{humanize(node.importance)}</Badge>}
          </div>
          <p className="mt-1 text-xs font-medium text-muted">
            {[node.category, node.complexityTier && humanize(node.complexityTier), node.estimatedDurationDays && `~${formatDurationDays(node.estimatedDurationDays)}`]
              .filter(Boolean)
              .join(' · ')}
          </p>
          {node.description && <p className="mt-2.5 text-sm leading-relaxed text-white/80">{node.description}</p>}
          
          {prerequisites.length > 0 && (
            <p className={cn('mt-2 text-xs font-medium', blocking.length > 0 ? 'text-warning' : 'text-muted')}>
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
              className={selectClass(done ? 'border-success/30 bg-success/5 text-success' : '', 'select-sm w-full font-medium')}
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
        <div className="collapse collapse-arrow mt-4 rounded-xl border border-base-300 bg-base-200/20">
          <input type="checkbox" aria-label={`Show details for ${node.title}`} />
          <div className="collapse-title min-h-0 py-2.5 text-xs font-semibold text-muted">View checklist & resources</div>
          <div className="collapse-content space-y-6 text-sm">
            
            {node.checklist?.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Key Concepts</p>
                <div className="grid gap-2 sm:grid-cols-2">
                  {node.checklist.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Icon name={done ? "check-square" : "square"} className={cn("mt-0.5 h-3.5 w-3.5 flex-shrink-0", done ? "text-primary" : "text-muted")} />
                      <span className={cn("text-xs", done ? "text-muted line-through" : "text-white/90")}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="grid gap-6 md:grid-cols-2">
              {node.resources?.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">Study Materials</p>
                  <ul className="space-y-2">
                    {node.resources.map(renderResourceLink)}
                  </ul>
                </div>
              )}
              {node.practice?.length > 0 && (
                <div>
                  <p className="eyebrow mb-3">Interactive Practice</p>
                  <ul className="space-y-2">
                    {node.practice.map(renderResourceLink)}
                  </ul>
                </div>
              )}
            </div>

            {node.suggestedProjects?.length > 0 && (
              <div>
                <p className="eyebrow mb-3">Project Ideas</p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {node.suggestedProjects.map((p, i) => (
                    <li key={`${i}-${p.title}`} className="rounded-lg border border-base-300 bg-base-200/50 p-3">
                      <p className="font-semibold text-white/90">{p.title}</p>
                      {p.description && <p className="mt-1 text-xs leading-relaxed text-muted">{p.description}</p>}
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