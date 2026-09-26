/**
 * Plays generated interview audio. The backend fills audio URLs in *after*
 * responding (background TTS), so a missing URL is shown as "preparing".
 */
export default function AudioPlayer({ url, preparing = false, unavailable = false, label = 'Audio' }) {
  if (url) {
    return (
      <audio controls preload="none" src={url} className="h-10 w-full max-w-md accent-white" aria-label={label}>
        Your browser does not support audio playback.
      </audio>
    );
  }
  if (preparing) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted" role="status">
        <span className="loading loading-spinner loading-xs" aria-hidden="true" />
        Preparing audio…
      </p>
    );
  }
  if (unavailable) return <p className="text-sm text-muted">Audio isn’t available for this one. You can read it instead.</p>;
  return null;
}
