/** Shown inside forms while a slow AI-backed request is running. */
export default function AiWaitNotice({ title, description }) {
  return (
    <div className="rounded-box border border-base-content/15 bg-base-content/[0.04] p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="loading loading-spinner loading-sm text-base-content" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-base-content">{title}</p>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      </div>
      <progress className="progress progress-primary mt-3 h-1 w-full" aria-hidden="true" />
    </div>
  );
}
