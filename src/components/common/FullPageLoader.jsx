import Logo from '../layout/Logo.jsx';

export default function FullPageLoader({ label = 'Loading…' }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-page" role="status" aria-live="polite">
      <Logo />
      <span className="loading loading-spinner loading-md text-white" aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
