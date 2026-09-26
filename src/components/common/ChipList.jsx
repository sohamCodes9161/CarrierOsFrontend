import Badge from '../ui/Badge.jsx';

export default function ChipList({ items = [], tone = 'neutral', empty = 'None' }) {
  if (!items || items.length === 0) return <p className="text-sm text-muted">{empty}</p>;
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, i) => (
        <Badge key={`${i}-${item}`} tone={tone}>
          {item}
        </Badge>
      ))}
    </div>
  );
}
