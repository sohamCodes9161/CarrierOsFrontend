import { useState } from 'react';

import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { portfolioApi } from '../../services/api/index.js';
import { REORDER_ENABLED } from '../../utils/constants.js';
import { formatDateRange, formatPortfolioDate, safeHref, sortByOrder } from '../../utils/portfolio.js';
import ItemModal from './ItemModal.jsx';
import { SECTIONS } from './sectionConfig.js';

function ExternalLink({ href, children }) {
  const safe = safeHref(href);
  if (!safe) return null;
  return (
    <a href={safe} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
      {children}
      <Icon name="external" className="h-3 w-3" />
    </a>
  );
}

function ItemBody({ section, item }) {
  if (section === 'projects') {
    const image = safeHref(item.imageUrl);
    return (
      <div className="flex gap-4">
        {image && (
          <div className="group hidden h-16 w-24 flex-shrink-0 overflow-hidden rounded-btn border border-base-300 bg-base-200 sm:block">
            <img
              src={image}
              alt=""
              loading="lazy"
              className="zoom-img h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.parentElement.style.display = 'none';
              }}
            />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold">{item.title}</h3>
            {item.featured && <Badge tone="primary">Featured</Badge>}
          </div>
          {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>}
          {item.techStack?.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {item.techStack.map((t) => (
                <Badge key={t} tone="neutral">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <div className="mt-2 flex flex-wrap gap-3">
            <ExternalLink href={item.githubUrl}>Code</ExternalLink>
            <ExternalLink href={item.liveUrl}>Live</ExternalLink>
          </div>
        </div>
      </div>
    );
  }

  if (section === 'experience') {
    return (
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">
          {item.role} <span className="font-normal text-muted">at {item.company}</span>
        </h3>
        <p className="text-xs text-muted">{formatDateRange(item.startDate, item.endDate, { current: item.endDate == null && Boolean(item.startDate) })}</p>
        {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>}
      </div>
    );
  }

  if (section === 'education') {
    return (
      <div className="min-w-0">
        <h3 className="text-sm font-semibold">
          {item.degree}
          {item.fieldOfStudy ? `, ${item.fieldOfStudy}` : ''}
        </h3>
        <p className="text-sm text-muted">{item.institution}</p>
        <p className="text-xs text-muted">{formatDateRange(item.startDate, item.endDate)}</p>
      </div>
    );
  }

  return (
    <div className="min-w-0">
      <h3 className="text-sm font-semibold">{item.title}</h3>
      {item.date && <p className="text-xs text-muted">{formatPortfolioDate(item.date)}</p>}
      {item.description && <p className="mt-1 line-clamp-2 text-sm text-muted">{item.description}</p>}
    </div>
  );
}

/** List + add/edit/delete for one portfolio section. */
export default function SectionTab({ section, portfolio, onChange }) {
  const config = SECTIONS[section];
  const toast = useToast();
  const [editing, setEditing] = useState(null); // null | 'new' | item
  const [toDelete, setToDelete] = useState(null);
  const remove = useAction((itemId) => portfolioApi.removeItem(section, itemId));
  const reorder = useAction((ids) => portfolioApi.reorderItems(section, ids));

  const items = sortByOrder(portfolio[section]);

  async function handleSave(payload) {
    const updated =
      editing && editing !== 'new'
        ? await portfolioApi.updateItem(section, editing._id, payload)
        : await portfolioApi.addItem(section, payload);
    onChange(updated);
    toast.success(editing && editing !== 'new' ? `${config.singular} updated.` : `${config.singular} added.`);
  }

  async function handleDelete() {
    const result = await remove.run(toDelete._id);
    if (result.ok) {
      onChange(result.data);
      toast.success(`${config.singular} removed.`);
    } else {
      toast.error(result.error);
    }
    setToDelete(null);
  }

  async function handleMove(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= items.length) return;
    const ids = items.map((i) => i._id);
    [ids[index], ids[target]] = [ids[target], ids[index]];
    const result = await reorder.run(ids);
    if (result.ok) onChange(result.data);
    else toast.error(result.error);
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-base font-semibold">{config.label}</h2>
        <Button size="sm" onClick={() => setEditing('new')}>
          <Icon name="plus" className="h-4 w-4" />
          Add {config.singular.toLowerCase()}
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon="document"
            title={`No ${config.label.toLowerCase()} yet`}
            description={config.emptyText}
            action={
              <Button onClick={() => setEditing('new')}>
                <Icon name="plus" className="h-4 w-4" />
                Add {config.singular.toLowerCase()}
              </Button>
            }
          />
        </div>
      ) : (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item._id} className="surface flex items-start gap-3 p-4">
              {REORDER_ENABLED && items.length > 1 && (
                <div className="flex flex-col">
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => handleMove(index, -1)}
                    disabled={index === 0 || reorder.loading}
                    aria-label={`Move ${item.title || item.role || item.degree} up`}
                  >
                    <Icon name="arrow-up" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost btn-xs btn-square"
                    onClick={() => handleMove(index, 1)}
                    disabled={index === items.length - 1 || reorder.loading}
                    aria-label={`Move ${item.title || item.role || item.degree} down`}
                  >
                    <Icon name="arrow-down" className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="min-w-0 flex-1">
                <ItemBody section={section} item={item} />
              </div>
              <div className="flex flex-shrink-0 gap-1">
                <button type="button" className="btn btn-ghost btn-sm btn-square" onClick={() => setEditing(item)} aria-label="Edit">
                  <Icon name="pencil" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-square text-muted hover:text-error"
                  onClick={() => setToDelete(item)}
                  aria-label="Delete"
                >
                  <Icon name="trash" className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ItemModal
        open={Boolean(editing)}
        config={config}
        item={editing && editing !== 'new' ? editing : null}
        onSave={handleSave}
        onClose={() => setEditing(null)}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        danger
        title={`Remove this ${config.singular.toLowerCase()}?`}
        description="It will be removed from your portfolio. This can’t be undone."
        confirmLabel="Remove"
        loading={remove.loading}
        onConfirm={handleDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
