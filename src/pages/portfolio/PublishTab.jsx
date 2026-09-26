import { useEffect, useRef, useState } from 'react';

import SectionCard from '../../components/common/SectionCard.jsx';
import FormField from '../../components/forms/FormField.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ConfirmDialog from '../../components/ui/ConfirmDialog.jsx';
import CopyButton from '../../components/ui/CopyButton.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { Skeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useSlugAvailability } from '../../hooks/useSlugAvailability.js';
import { portfolioApi } from '../../services/api/index.js';
import { cn } from '../../utils/cn.js';
import { formatDateTime, pluralize } from '../../utils/format.js';
import { publicPortfolioUrl } from '../../utils/portfolio.js';

const REASONS = {
  reserved: 'That address is reserved. Try another.',
  taken: 'That address is already taken.',
  invalid_format: 'Use 3–40 lowercase letters, numbers, and single hyphens.',
};

function SlugStatus({ state }) {
  switch (state.status) {
    case 'checking':
      return (
        <p className="mt-1.5 flex items-center gap-2 text-sm text-muted" role="status">
          <span className="loading loading-spinner loading-xs" /> Checking availability…
        </p>
      );
    case 'available':
      return (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm text-success" role="status">
          <Icon name="check-circle" className="h-4 w-4" /> Available
        </p>
      );
    case 'unavailable':
      return (
        <p className="mt-1.5 text-sm text-error" role="alert">
          {REASONS[state.reason] || 'That address isn’t available.'}
        </p>
      );
    case 'invalid':
      return (
        <p className="mt-1.5 text-sm text-error" role="alert">
          {REASONS.invalid_format}
        </p>
      );
    case 'unknown':
      return <p className="mt-1.5 text-sm text-muted">Couldn’t check availability right now. You can still try saving it.</p>;
    default:
      return null;
  }
}

export default function PublishTab({ portfolio, onChange }) {
  const toast = useToast();
  const [slug, setSlug] = useState(portfolio.slug || '');
  const [confirmUnpublish, setConfirmUnpublish] = useState(false);

  useEffect(() => {
    setSlug(portfolio.slug || '');
  }, [portfolio.slug]);

  const availability = useSlugAvailability(slug, portfolio.slug);
  const readiness = useApi(() => portfolioApi.getPublishReadiness(), []);
  const firstRun = useRef(true);
  useEffect(() => {
    // Refresh the checklist quietly whenever the portfolio changes.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    readiness.reload({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [portfolio.updatedAt]);

  const saveSlug = useAction(portfolioApi.updateSlug);
  const publish = useAction(portfolioApi.publish);
  const unpublish = useAction(portfolioApi.unpublish);

  const normalized = slug.trim().toLowerCase();
  const slugChanged = normalized !== (portfolio.slug || '');
  const canSaveSlug = slugChanged && ['available', 'unknown'].includes(availability.status);
  const url = portfolio.slug ? publicPortfolioUrl(portfolio.slug) : '';
  const slugInvalid = availability.status === 'unavailable' || availability.status === 'invalid';

  async function handleSaveSlug(event) {
    event.preventDefault();
    const result = await saveSlug.run(normalized);
    if (result.ok) {
      onChange(result.data);
      toast.success('Public address saved.');
    }
  }

  async function handlePublish() {
    const result = await publish.run();
    if (result.ok) {
      onChange(result.data);
      toast.success('Your portfolio is live.');
    }
  }

  async function handleUnpublish() {
    const result = await unpublish.run();
    setConfirmUnpublish(false);
    if (result.ok) {
      onChange(result.data);
      toast.success('Your portfolio is now private.');
    } else {
      toast.error(result.error);
    }
  }

  return (
    <div className="space-y-6">
      <SectionCard
        title="Status"
        actions={<Badge tone={portfolio.isPublished ? 'success' : 'neutral'}>{portfolio.isPublished ? 'Published' : 'Draft'}</Badge>}
      >
        {portfolio.isPublished ? (
          <div className="space-y-3">
            <p className="text-sm text-muted">
              Live since {formatDateTime(portfolio.publishedAt)} · {pluralize(portfolio.viewCount || 0, 'view')}
            </p>
            <div className="flex flex-wrap items-center gap-2 rounded-btn border border-base-300 bg-base-200/60 px-3 py-2">
              <span className="min-w-0 flex-1 break-all text-sm font-medium">{url}</span>
              <CopyButton text={url} label="Copy link" />
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-xs gap-1">
                <Icon name="external" className="h-4 w-4" />
                Open
              </a>
            </div>
            <Button variant="danger-outline" size="sm" onClick={() => setConfirmUnpublish(true)}>
              Unpublish
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted">Your portfolio is private. Finish the checklist below, then publish it to get a shareable link.</p>
        )}
      </SectionCard>

      <SectionCard title="Public address" description="Choose the link visitors will use.">
        <form onSubmit={handleSaveSlug} noValidate className="space-y-3">
          <ErrorAlert error={saveSlug.error} />
          <FormField id="slug" label="Address">
            <div className="join w-full">
              <span className="join-item hidden items-center whitespace-nowrap border border-base-300 bg-base-200 px-3 text-sm text-muted sm:flex">
                {window.location.host}/p/
              </span>
              <input
                id="slug"
                aria-invalid={slugInvalid || undefined}
                type="text"
                className={cn('input input-bordered join-item w-full', slugInvalid && 'input-error')}
                placeholder="your-name"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={40}
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase())}
                disabled={saveSlug.loading}
              />
            </div>
            <SlugStatus state={availability} />
          </FormField>
          <Button type="submit" size="sm" disabled={!canSaveSlug} loading={saveSlug.loading}>
            Save address
          </Button>
        </form>
      </SectionCard>

      <SectionCard title="Publish checklist" description="Everything needed before your portfolio can go live.">
        {readiness.loading ? (
          <div className="space-y-2" aria-hidden="true">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : readiness.error ? (
          <p className="text-sm text-muted">Couldn’t check readiness. Publishing will still tell you what’s missing.</p>
        ) : readiness.data.ready ? (
          <p className="flex items-center gap-2 text-sm text-success">
            <Icon name="check-circle" className="h-5 w-5" /> Everything is in place.
          </p>
        ) : (
          <div>
            <p className="mb-2 text-sm text-muted">Still missing:</p>
            <ul className="space-y-1.5">
              {readiness.data.missing.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Icon name="warning" className="mt-0.5 h-4 w-4 flex-shrink-0 text-warning" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {!portfolio.isPublished && (
          <div className="mt-5 border-t border-base-300 pt-4">
            <ErrorAlert error={publish.error} className="mb-3" />
            <Button onClick={handlePublish} loading={publish.loading} disabled={readiness.data ? !readiness.data.ready : false}>
              <Icon name="globe" className="h-4 w-4" />
              Publish portfolio
            </Button>
          </div>
        )}
      </SectionCard>

      <ConfirmDialog
        open={confirmUnpublish}
        title="Unpublish your portfolio?"
        description="Your public link will stop working until you publish again. Your content is kept."
        confirmLabel="Unpublish"
        danger
        loading={unpublish.loading}
        onConfirm={handleUnpublish}
        onCancel={() => setConfirmUnpublish(false)}
      />
    </div>
  );
}
