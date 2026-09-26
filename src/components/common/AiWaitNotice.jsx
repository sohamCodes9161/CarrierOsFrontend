/** Shown inside forms while a slow AI-backed request is running. */
export default function AiWaitNotice({ title, description }) {
  return (
    <div className="rounded-box border border-white/15 bg-white/[0.04] p-4" role="status" aria-live="polite">
      <div className="flex items-center gap-3">
        <span className="loading loading-spinner loading-sm text-white" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-white">{title}</p>
          {description && <p className="text-xs text-muted">{description}</p>}
        </div>
      </div>
      <progress className="progress progress-primary mt-3 h-1 w-full" aria-hidden="true" />
    </div>
  );
}
