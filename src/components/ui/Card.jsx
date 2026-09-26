import { cn } from '../../utils/cn.js';

/** Surface container. `interactive` adds the subtle hover lift for clickable cards. */
export default function Card({ as: Tag = 'div', interactive = false, padded = true, className = '', children, ...rest }) {
  return (
    <Tag className={cn('surface', padded && 'p-5', interactive && 'lift block cursor-pointer', className)} {...rest}>
      {children}
    </Tag>
  );
}
