export default function Logo({ className = '' }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden="true">
        <rect width="32" height="32" rx="8" fill="#fff" />
        <path d="M9 21.5 15 15l3.5 3.5L24 11.5" fill="none" stroke="#050505" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M19 11.5h5v5" fill="none" stroke="#050505" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-lg font-semibold tracking-tight text-white">CareerOS</span>
    </span>
  );
}
