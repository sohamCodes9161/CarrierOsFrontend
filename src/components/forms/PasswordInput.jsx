import { useState } from 'react';

import { inputClass } from './FormField.jsx';

export default function PasswordInput({ error, className = '', ...rest }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        type={visible ? 'text' : 'password'}
        className={inputClass(error, `pr-16 ${className}`)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="absolute inset-y-0 right-2 my-auto h-7 rounded px-2 text-xs font-medium text-muted hover:text-base-content"
        aria-label={visible ? 'Hide password' : 'Show password'}
        aria-pressed={visible}
      >
        {visible ? 'Hide' : 'Show'}
      </button>
    </div>
  );
}
