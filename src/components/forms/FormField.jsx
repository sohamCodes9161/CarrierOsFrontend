import { cn } from '../../utils/cn.js';

/** Returns the aria props an input needs to be linked to its FormField message. */
export function fieldProps(id, error, hint) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return { id, 'aria-invalid': error ? true : undefined, 'aria-describedby': describedBy };
}

/** Standard class names for DaisyUI inputs with error styling. */
export function inputClass(error, extra = '') {
  return cn('input input-bordered w-full', error && 'input-error', extra);
}
export function textareaClass(error, extra = '') {
  return cn('textarea textarea-bordered w-full leading-relaxed', error && 'textarea-error', extra);
}
export function selectClass(error, extra = '') {
  return cn('select select-bordered w-full', error && 'select-error', extra);
}

/** Label + control + hint/error wrapper. */
export default function FormField({ id, label, hint, error, required = false, counter, className = '', children }) {
  return (
    <div className={cn('w-full', className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
          {required && (
            <span className="ml-0.5 text-error" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {counter && <span className="text-xs tabular-nums text-muted">{counter}</span>}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}
