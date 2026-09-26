import { useRef } from 'react';

import { cn } from '../../utils/cn.js';

/**
 * Wrapper that adds a gentle pointer-following 3D tilt on top of the
 * `.tilt` hover lift (translateY / scale / shadow live in index.css).
 * Only reacts to a real mouse; touch and reduced-motion users get a flat card.
 */
export default function Tilt({ as: Tag = 'div', max = 3, className = '', children, ...rest }) {
  const ref = useRef(null);
  const frame = useRef(0);

  const handleMove = (event) => {
    if (event.pointerType && event.pointerType !== 'mouse') return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.setProperty('--ry', `${(px * max * 2).toFixed(2)}deg`);
      el.style.setProperty('--rx', `${(-py * max * 2).toFixed(2)}deg`);
    });
  };

  const reset = () => {
    cancelAnimationFrame(frame.current);
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--rx', '0deg');
    el.style.setProperty('--ry', '0deg');
  };

  return (
    <Tag ref={ref} className={cn('tilt', className)} onPointerMove={handleMove} onPointerLeave={reset} {...rest}>
      {children}
    </Tag>
  );
}
