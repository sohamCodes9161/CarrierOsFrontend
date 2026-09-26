import { useEffect, useRef, useState } from 'react';

import Icon from './Icon.jsx';
import { cn } from '../../utils/cn.js';

export default function CopyButton({ text, label = 'Copy', className = '' }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand('copy');
      } finally {
        document.body.removeChild(area);
      }
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={cn('btn btn-ghost btn-xs gap-1', copied && 'text-success', className)}
    >
      <Icon name={copied ? 'check' : 'copy'} className="h-4 w-4" />
      {copied ? 'Copied' : label}
    </button>
  );
}
