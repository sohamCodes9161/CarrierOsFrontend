import Icon from '../ui/Icon.jsx';

/** Compact list with a tone-colored marker. tone: success | error | warning | primary */
const TONES = { success: 'text-success', error: 'text-error', warning: 'text-warning', primary: 'text-white' };
const ICONS = { success: 'check', error: 'x', warning: 'warning', primary: 'arrow-right' };

export default function BulletList({ items = [], tone = 'primary', empty = 'Nothing to show.' }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={`${i}-${item}`} className="flex gap-2.5 text-sm leading-relaxed text-white/90">
          <Icon name={ICONS[tone]} className={`mt-0.5 h-4 w-4 flex-shrink-0 ${TONES[tone]}`} strokeWidth={2} />
          <span className="min-w-0 break-words">{item}</span>
        </li>
      ))}
    </ul>
  );
}
