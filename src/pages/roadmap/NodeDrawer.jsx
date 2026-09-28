import { useEffect } from 'react';

import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { domainColor } from '../../utils/domainColor.js';
import { ROADMAP_STATUSES } from '../../utils/constants.js';
import { formatDurationDays, humanize } from '../../utils/format.js';

const PRIORITY_TONES = { critical: 'error', high: 'warning', medium: 'info', low: 'neutral' };
const RESOURCE_TONES = { article: 'neutral', video: 'neutral', course: 'neutral', 'official-docs': 'neutral', book: 'neutral' };

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
            <header className="flex items-start justify-between gap-3 border-b border-base-300 p-5">
              <div className="min-w-0">
                <span
                  className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                  style={{ color: color.text, backgroundColor: color.bg, borderColor: color.border }}
                >
                  {node.category || 'General'}
                </span>
                <h2 className="mt-2 text-lg font-semibold leading-snug text-white">{node.title}</h2>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  {node.priorityLabel && <Badge tone={PRIORITY_TONES[node.priorityLabel] || 'neutral'}>{humanize(node.priorityLabel)}</Badge>}
                  {node.complexityTier && <Badge tone="neutral">{humanize(node.complexityTier)}</Badge>}
                  {node.estimatedDurationDays ? <Badge tone="neutral">~{formatDurationDays(node.estimatedDurationDays)}</Badge> : null}
                </div>
              </div>
              <button type="button" className="btn btn-ghost btn-sm btn-square -mr-1 -mt-1 flex-shrink-0" onClick={onClose} aria-label="Close">
                <Icon name="x" className="h-5 w-5" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              <p className="eyebrow mb-2">Status</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {ROADMAP_STATUSES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={saving}
                    onClick={() => onStatusChange(node.id, s.value)}
                    className={cn(
                      'btn btn-sm rounded-full',
                      (node.status || 'not_started') === s.value ? 'btn-primary' : 'btn-outline border-base-300 text-muted hover:text-white'
                    )}
                  >
                    {s.label}
                  </button>
                ))}
                {saving && <span className="loading loading-spinner loading-xs self-center" aria-hidden="true" />}
              </div>

              {node.description && (
                <div className="mb-6">
                  <p className="eyebrow mb-2">About this topic</p>
                  <p className="text-sm leading-relaxed text-white/90">{node.description}</p>
                </div>
              )}

              {prerequisites.length > 0 && (
                <div className="mb-6">
                  <p className="eyebrow mb-2">{blocking.length > 0 ? 'Do first' : 'Builds on'}</p>
                  <ul className="space-y-1.5">
                    {(blocking.length > 0 ? blocking : prerequisites).map((p) => (
                      <li key={p.id} className="flex items-center gap-2 text-sm">
                        <Icon
                          name={p.status === 'completed' || p.status === 'skipped' ? 'check-circle' : 'lock'}
                          className={cn('h-4 w-4 flex-shrink-0', p.status === 'completed' || p.status === 'skipped' ? 'text-success' : 'text-faint')}
                        />
                        <span className={p.status === 'completed' ? 'text-muted line-through' : 'text-white/90'}>{p.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.resources?.length > 0 && (
                <div className="mb-6">
                  <p className="eyebrow mb-2">Resources</p>
                  <ul className="space-y-3">
                    {node.resources.map((res, i) => (
                      <li key={`${i}-${res.title}`}>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-medium text-white">{res.title}</span>
                          {res.type && <Badge tone={RESOURCE_TONES[res.type] || 'neutral'}>{humanize(res.type)}</Badge>}
                        </div>
                        {res.description && <p className="mt-0.5 text-xs text-muted">{res.description}</p>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {node.suggestedProjects?.length > 0 && (
                <div>
                  <p className="eyebrow mb-2">Practice projects</p>
                  <ul className="space-y-3">
                    {node.suggestedProjects.map((p, i) => (
                      <li key={`${i}-${p.title}`}>
                        <p className="text-sm font-medium text-white">{p.title}</p>
                        {p.description && <p className="mt-0.5 text-xs text-muted">{p.description}</p>}
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
