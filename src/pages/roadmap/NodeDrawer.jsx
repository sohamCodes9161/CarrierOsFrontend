import { useEffect, useState } from 'react';
import Badge from '../../components/ui/Badge.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { domainColor } from '../../utils/domainColor.js';
import { ROADMAP_STATUSES } from '../../utils/constants.js';
import { formatDurationDays, humanize } from '../../utils/format.js';

const PRIORITY_TONES = { critical: 'error', high: 'warning', medium: 'info', low: 'neutral' };
const RESOURCE_TONES = { article: 'info', video: 'error', course: 'primary', 'official-docs': 'neutral', book: 'warning', interactive: 'secondary' };

const TYPE_ICONS = { article: 'file-text', video: 'play-circle', course: 'monitor', 'official-docs': 'book-open', book: 'book', interactive: 'terminal' };

export default function NodeDrawer({ open, node, prerequisites = [], onStatusChange, onResourcesUpdate, saving = false, onClose }) {
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [editResources, setEditResources] = useState([]);
  const [editPractice, setEditPractice] = useState([]);

  useEffect(() => {
    if (node) {
      setEditResources(node.resources || []);
      setEditPractice(node.practice || []);
      setIsEditingLinks(false);
    }
  }, [node]);

  useEffect(() => {
    if (!open) return;
    function handleKey(event) { if (event.key === 'Escape') onClose(); }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  const color = node ? domainColor(node.category) : null;
  const blocking = prerequisites.filter((p) => p.status !== 'completed' && p.status !== 'skipped');

  const handleSaveLinks = async () => {
    if (onResourcesUpdate) {
      await onResourcesUpdate(node.id, { resources: editResources, practice: editPractice });
    }
    setIsEditingLinks(false);
  };

  const renderResourceCard = (res, i, type = 'resources') => {
    const list = type === 'resources' ? editResources : editPractice;
    const setList = type === 'resources' ? setEditResources : setEditPractice;

    if (isEditingLinks) {
      return (
        <li key={i} className="rounded-xl border border-base-300 bg-base-200/50 p-3.5 space-y-3">
          <p className="text-sm font-medium text-white">{res.title}</p>
          <input
            type="url"
            className="w-full rounded-md border border-base-300 bg-base-100 px-3 py-2 text-sm text-white focus:border-primary focus:outline-none"
            placeholder="Paste custom link here..."
            value={res.url || ''}
            onChange={(e) => {
              const updated = [...list];
              updated[i] = { ...updated[i], url: e.target.value };
              setList(updated);
            }}
          />
        </li>
      );
    }

    return (
      <li key={`${i}-${res.title}`}>
        <a
          href={res.url || '#'}
          target={res.url ? "_blank" : "_self"}
          rel="noopener noreferrer"
          className="group block rounded-xl border border-base-300 bg-base-200/30 p-3.5 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-base-200/60 hover:shadow-sm"
        >
          <div className="mb-1.5 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 font-medium text-white group-hover:text-primary">
              <Icon name={TYPE_ICONS[res.type] || 'external-link'} className="h-4 w-4 text-muted group-hover:text-primary" />
              <span className="leading-tight">{res.title}</span>
            </div>
            {res.url && <Icon name="arrow-up-right" className="h-4 w-4 text-muted opacity-0 transition-opacity group-hover:opacity-100" />}
          </div>
          {res.description && <p className="mb-2.5 text-xs text-muted line-clamp-2 leading-relaxed">{res.description}</p>}
          <div className="flex flex-wrap items-center gap-1.5">
            {res.type && <Badge tone={RESOURCE_TONES[res.type] || 'neutral'}>{humanize(res.type)}</Badge>}
            {res.isFree && <Badge tone="success">Free</Badge>}
            {!res.url && <Badge tone="error">Link Missing</Badge>}
          </div>
        </a>
      </li>
    );
  };

  return (
    <>
      <div onClick={onClose} aria-hidden="true" className={cn('fixed inset-0 z-40 bg-black/70 transition-opacity duration-200', open ? 'opacity-100' : 'pointer-events-none opacity-0')} />
      <aside role="dialog" aria-modal="true" className={cn('fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-base-300 bg-surface-3 shadow-pop transition-transform duration-300 ease-out', open ? 'translate-x-0' : 'translate-x-full')}>
        {node && (
          <>
            <header className="flex items-start justify-between gap-3 border-b border-base-300 bg-surface-2 p-5">
              {/* Header content unchanged */}
              <div className="min-w-0">
                <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: color.text, backgroundColor: color.bg, borderColor: color.border }}>
                  {node.category || 'General'}
                </span>
                <h2 className="mt-2 text-xl font-bold leading-snug text-white">{node.title}</h2>
              </div>
              <button type="button" className="btn btn-ghost btn-sm btn-square flex-shrink-0" onClick={onClose}><Icon name="x" className="h-5 w-5" /></button>
            </header>

            <div className="flex-1 overflow-y-auto p-5">
              {/* Status block unchanged */}
              <div className="mb-8 rounded-xl border border-base-300 bg-base-200/50 p-4">
                <p className="eyebrow mb-3">Topic Status</p>
                <div className="flex flex-wrap gap-2">
                  {ROADMAP_STATUSES.map((s) => (
                    <button key={s.value} type="button" disabled={saving} onClick={() => onStatusChange(node.id, s.value)} className={cn('btn btn-sm rounded-full transition-colors', (node.status || 'not_started') === s.value ? 'btn-primary' : 'btn-outline border-base-300 text-muted hover:border-primary/50 hover:text-white')}>
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Study Materials */}
              {editResources?.length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-3">
                    <p className="eyebrow text-muted">Study materials</p>
                    <button onClick={() => isEditingLinks ? handleSaveLinks() : setIsEditingLinks(true)} className="text-xs font-semibold text-primary hover:text-primary-focus">
                      {isEditingLinks ? 'Save Links' : 'Edit Links'}
                    </button>
                  </div>
                  <ul className="space-y-3">
                    {editResources.map((res, i) => renderResourceCard(res, i, 'resources'))}
                  </ul>
                </div>
              )}

              {/* Hands-on Practice */}
              {editPractice?.length > 0 && (
                <div className="mb-8">
                  <p className="eyebrow mb-3 text-muted">Hands-on practice</p>
                  <ul className="space-y-3">
                    {editPractice.map((res, i) => renderResourceCard(res, i, 'practice'))}
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