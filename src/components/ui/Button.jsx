import { cn } from '../../utils/cn.js';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  neutral: 'btn-neutral border border-line-2',
  outline: 'btn-outline border-base-300 text-white hover:bg-white hover:text-black hover:border-white',
  ghost: 'btn-ghost text-muted hover:bg-white/[0.06] hover:text-white',
  danger: 'btn-error',
  'danger-outline': 'btn-outline btn-error',
};

const SIZES = { xs: 'btn-xs', sm: 'btn-sm', md: '', lg: 'btn-lg text-base' };

/**
 * DaisyUI button with a built-in loading state.
 * Pass `as={Link}` (with `to`) to render a router link that looks like a button.
 */
export default function Button({
  as: Tag = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  children,
  type = 'button',
  ...rest
}) {
  const isButton = Tag === 'button';
  const isDisabled = disabled || loading;
  const props = isButton ? { type, disabled: isDisabled } : { 'aria-disabled': isDisabled || undefined };

  return (
    <Tag
      className={cn('btn rounded-full font-medium', VARIANTS[variant], SIZES[size], isDisabled && !isButton && 'btn-disabled', 'gap-2', className)}
      {...props}
      {...rest}
    >
      {loading && <span className="loading loading-spinner loading-xs" aria-hidden="true" />}
      {children}
    </Tag>
  );
}
