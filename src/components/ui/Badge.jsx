import { cn } from '../../utils/cn.js';

// Soft tinted badges on the dark surface. Text stays light so contrast holds at small sizes.
const TONES = {
  neutral: 'bg-base-content/[0.06] text-muted border-base-content/10',
  primary: 'bg-base-content/10 text-base-content border-base-content/20',
  secondary: 'bg-base-content/[0.06] text-base-content/80 border-base-content/10',
  success: 'bg-success/10 text-success border-success/25',
  warning: 'bg-warning/10 text-warning border-warning/25',
  error: 'bg-error/10 text-error border-error/25',
  info: 'bg-info/10 text-info border-info/25',
};

export default function Badge({ tone = 'neutral', className = '', children, ...rest }) {
  return (
    <span
      className={cn('badge badge-md gap-1 border font-medium', TONES[tone] || TONES.neutral, className)}
      {...rest}
    >
      {children}
    </span>
  );
}
