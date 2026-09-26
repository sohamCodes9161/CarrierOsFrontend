import { useState } from 'react';

import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';

/** Chip-style multi-value input. Enter or comma adds a tag; Backspace removes the last one. */
export default function TagInput({
  id,
  value = [],
  onChange,
  max = 20,
  maxLength = 60,
  placeholder = 'Type and press Enter',
  disabled = false,
  error,
  ...aria
}) {
  const [draft, setDraft] = useState('');
  const full = value.length >= max;

  function add(raw) {
    const parts = raw
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
    if (parts.length === 0) return;
    const next = [...value];
    for (const part of parts) {
      if (next.length >= max) break;
      if (!next.some((existing) => existing.toLowerCase() === part.toLowerCase())) next.push(part.slice(0, maxLength));
    }
    onChange(next);
    setDraft('');
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      add(draft);
    } else if (event.key === 'Backspace' && !draft && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div
      className={cn(
        'flex min-h-[3rem] flex-wrap items-center gap-1.5 rounded-btn border bg-base-100 px-2 py-1.5 transition-colors focus-within:border-primary focus-within:ring-1 focus-within:ring-primary',
        error ? 'border-error' : 'border-base-300',
        disabled && 'opacity-60'
      )}
    >
      {value.map((tag) => (
        <span key={tag} className="badge badge-md gap-1 border-base-300 bg-base-200 pr-1 font-medium">
          {tag}
          <button
            type="button"
            onClick={() => onChange(value.filter((v) => v !== tag))}
            disabled={disabled}
            className="rounded p-0.5 hover:bg-base-300"
            aria-label={`Remove ${tag}`}
          >
            <Icon name="x" className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => add(draft)}
        disabled={disabled || full}
        placeholder={full ? `Maximum of ${max} reached` : placeholder}
        className="min-w-[9rem] flex-1 bg-transparent px-1 py-1 text-sm outline-none"
        {...aria}
      />
    </div>
  );
}
