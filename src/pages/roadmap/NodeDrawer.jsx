import { useEffect } from 'react';

import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { domainColor } from '../../utils/domainColor.js';
import { ROADMAP_STATUSES } from '../../utils/constants.js';
import { formatDurationDays, humanize } from '../../utils/format.js';

const PRIORITY_TONES = { critical: 'error', high: 'warning', medium: 'info', low: 'neutral' };
const RESOURCE_TONES = { article: 'info', video: 'error', course: 'primary', 'official-docs': 'neutral', book: 'warning', interactive: 'secondary' };

const TYPE_ICONS = {
  article: 'file-text',
  video: 'play-circle',
  course: 'monitor',
  'official-docs': 'book-open',
  book: 'book',
  interactive: 'terminal'
};

/** Slide-over detail panel for a single roadmap topic, opened from either the graph or list view. */
export default function NodeDrawer({ open, node, prerequisites = [], onStatusChange, saving = false, onClose }) {
  useEffect(() => {
    if (!open) return undefined;
    function handleKey(event) {
      if (event.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const color = node ? domainColor(node.category) : null;
  const blocking = prerequisites.filter((p) => p.status !== 'completed' && p.status !== 'skipped');

  const renderResourceCard = (res, i) => (
    <li key={`${i}-${res.title}`}>
      {res.url ? (
        <a
          href={res.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group block rounded-xl border border-base-300 bg-base-200/30 p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-base-200/60 hover:shadow-sm"
        >
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-white group-hover:text-primary">
              <Icon name={TYPE_ICONS[res.type] || 'external-link'} className="h-4 w-4 text-muted group-hover:text-primary" />
              <span className="leading-tight">{res.title}</span>
            </div>
            <Icon name="arrow-up-right" className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />
          </div>
          {res.description && <p className="mb-2.5 text-xs text-muted line-clamp-2 leading-relaxed">{res.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5">
            {res.type && <Badge tone={RESOURCE_TONES[res.type] || 'neutral'}>{humanize(res.type)}</Badge>}
            {res.isFree && <Badge tone="success">Free</Badge>}
          </div>
        </a>
      ) : (
        <div className="rounded-xl border border-base-300 bg-base-200/30 p-3.5">
          <div className="mb-1.5 flex items-center gap-2 font-medium text-white">
            <Icon name={TYPE_ICONS[res.type] || 'file'} className="h-4 w-4 text-muted" />
            <span className="leading-tight">{res.title}</span>
          </div>
          {res.description && <p className="mb-2.5 text-xs text-muted line-clamp-2 leading-relaxed">{res.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5">
            {res.type && <Badge tone={RESOURCE_TONES[res.type] || 'neutral'}>{humanize(res.type)}</Badge>}
            {res.isFree && <Badge tone="success">Free</Badge>}
          </div>
        </div>
      )}
    </li>
  );

  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        className={cn(
          'fixed inset-0 z-40 bg-black/70 transition-opacity duration-200',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label={node?.title || 'Topic details'}
        className={cn(
          'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-base-300 bg-surface-3 shadow-pop transition-transform duration-300 ease-out',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {node && (
          <>
            <header className="flex items-start justify-between gap-3 border-b border-base-300 bg-surface-2 p-5">
              <div className="min-w-0">
                <span
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: color.text, backgroundColor: color.bg, borderColor: color.border }}
                >
                  {node.category || 'General'}
                </span>
                <h2 className="mt-2 text-xl font-bold leading-snug text-white">{node.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {node.priorityLabel && <Badge tone={PRIORITY_TONES[node.priorityLabel] || 'neutral'}>{humanize(node.priorityLabel)} priority</Badge>}
                  {node.complexityTier && <Badge tone="neutral">{humanize(node.complexityTier)}</Badge>}
                  {node.estimatedDurationDays ? <Badge tone="neutral">~{formatDurationDays(node.estimatedDurationDays)}</Badge> : null}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm btn-square -mr-1 -mt-1 flex-shrink-0" onClick={onClose} aria-label="Close">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <div className="mb-8 rounded-xl border border-base-300 bg-base-200/50 p-4">
                <p className="eyebrow mb-3">Topic Status</p>
                <div className="flex flex-wrap gap-2">
                  {ROADMAP_STATUSES.map((s) => (
                    <button
                      key={s.value}
                      type="button"
                      disabled={saving}
                      onClick={() => onStatusChange(node.id, s.value)}
                      className={cn(
                        'btn btn-sm rounded-full transition-colors',
                        (node.status || 'not_started') === s.value ? 'btn-primary' : 'btn-outline border-base-300 text-muted hover:border-primary/50 hover:text-white'
                      )}
                    >
                      {s.label}
                    </button>
                  ))}
                  {saving && <span className="loading loading-spinner loading-xs self-center" aria-hidden="true" />}
                </div>
              </div>

              {node.description && (
                <div className="mb-8">
                  <p className="eyebrow mb-2 text-muted">About this topic</p>
                  <p className="text-sm leading-relaxed text-white/90">{node.description}</p>
                </div>
              )}

              {prerequisites.length > 0 && (
                <div className="mb-8">
                  <p className="eyebrow mb-3">{blocking.length > 0 ? 'Do first' : 'Builds on'}</p>
                  <ul className="space-y-2">
                    {(blocking.length > 0 ? blocking : prerequisites).map((p) => (
                      <li key={p.id} className="flex items-center gap-2.5 rounded-lg border border-base-300 bg-base-200/30 px-3 py-2 text-sm">
                        <Icon
                          name={p.status === 'completed' || p.status === 'skipped' ? 'check-circle' : 'lock'}
                          className={cn('h-4 w-4 flex-shrink-0', p.status === 'completed' || p.status === 'skipped' ? 'text-success' : 'text-warning')}
                        />
                        <span className={p.status === 'completed' ? 'text-muted line-through' : 'font-medium text-white/90'}>{p.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.checklist?.length > 0 && (
                <div className="mb-8">
                  <p className="eyebrow mb-3 text-muted">What to learn</p>
                  <ul className="space-y-2.5">
                    {node.checklist.map((item, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm">
                        <Icon name={node.status === 'completed' ? 'check-square' : 'square'} className={cn('mt-0.5 h-4 w-4 flex-shrink-0', node.status === 'completed' ? 'text-primary' : 'text-muted')} />
                        <span className={cn('leading-snug', node.status === 'completed' ? 'text-muted line-through' : 'text-white/90')}>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.resources?.length > 0 && (
                <div className="mb-8">
                  <p className="eyebrow mb-3 text-muted">Study materials</p>
                  <ul className="space-y-3">
                    {node.resources.map(renderResourceCard)}
                  </ul>
                </div>
              )}

              {node.practice?.length > 0 && (
                <div className="mb-8">
                  <p className="eyebrow mb-3 text-muted">Hands-on practice</p>
                  <ul className="space-y-3">
                    {node.practice.map(renderResourceCard)}
                  </ul>
                </div>
              )}

              {node.suggestedProjects?.length > 0 && (
                <div className="mb-4">
                  <p className="eyebrow mb-3 text-muted">Portfolio builders</p>
                  <ul className="space-y-3">
                    {node.suggestedProjects.map((p, i) => (
                      <li key={`${i}-${p.title}`} className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                        <div className="mb-1.5 flex items-center gap-2">
                          <Icon name="code" className="h-4 w-4 text-primary" />
                          <p className="font-semibold text-primary-content">{p.title}</p>
                        </div>
                        {p.description && <p className="text-sm leading-relaxed text-muted">{p.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}
      </aside>
    </>
  );
}