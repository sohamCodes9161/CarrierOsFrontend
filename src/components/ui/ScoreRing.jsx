import { scoreTone } from '../../utils/format.js';

const COLORS = { success: '#4CCB8C', warning: '#F0B849', error: '#F26D6D' };

/** Circular 0-100 score indicator. */
export default function ScoreRing({ value, size = 72, label = 'Score', className = '' }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const color = COLORS[scoreTone(clamped)];

  return (
    <div
      className={`relative inline-flex flex-shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`${label}: ${Math.round(clamped)} out of 100`}
    >
      <svg viewBox="0 0 100 100" width={size} height={size} className="-rotate-90">
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#242424" strokeWidth="9" />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.22, 0.7, 0.2, 1)' }}
        />
      </svg>
      <span className="absolute font-semibold tabular-nums text-white" style={{ fontSize: Math.round(size * 0.28) }}>
        {Math.round(clamped)}
      </span>
    </div>
  );
}
