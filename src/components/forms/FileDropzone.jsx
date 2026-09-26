import { useState } from 'react';

import Icon from '../ui/Icon.jsx';
import { cn } from '../../utils/cn.js';
import { formatBytes } from '../../utils/format.js';

export default function FileDropzone({ id, file, onFile, accept, hint, error, disabled = false, prompt = 'Drop a file here or click to browse' }) {
  const [dragging, setDragging] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (!disabled && e.dataTransfer.files?.[0]) onFile(e.dataTransfer.files[0]);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-box border-2 border-dashed px-4 py-8 text-center transition-colors focus-within:border-primary',
          dragging ? 'border-primary bg-primary/5' : 'border-base-300 hover:border-primary/60 hover:bg-base-200/60',
          error && 'border-error',
          disabled && 'pointer-events-none opacity-60'
        )}
      >
        <Icon name={file ? 'document' : 'upload'} className="h-7 w-7 text-muted" />
        <span className="max-w-full break-all text-sm font-medium">{file ? file.name : prompt}</span>
        <span className="text-xs text-muted">{file ? formatBytes(file.size) : hint}</span>
        <input
          id={id}
          type="file"
          accept={accept}
          className="sr-only"
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          onChange={(e) => {
            const picked = e.target.files?.[0];
            if (picked) onFile(picked);
            e.target.value = ''; // allow re-selecting the same file
          }}
        />
      </label>
      {file && !disabled && (
        <button type="button" onClick={() => onFile(null)} className="btn btn-ghost btn-xs mt-2">
          Remove file
        </button>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm text-error">
          {error}
        </p>
      )}
    </div>
  );
}
