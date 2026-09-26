import SectionCard from './SectionCard.jsx';
import Badge from '../../ui/Badge.jsx';
import { humanize } from '../../utils/format.js';

export default function OverviewSection({ readiness, narrative }) {
  return (
    <SectionCard
      title="Overview"
      className="lg:col-span-2"
      actions={<Badge tone={readiness.tone}>{readiness.label}</Badge>}
    >
      <p className="whitespace-pre-line text-sm leading-relaxed">{narrative}</p>
    </SectionCard>
  );
}