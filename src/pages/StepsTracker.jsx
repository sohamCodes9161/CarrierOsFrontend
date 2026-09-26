import { Link } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import Badge from '../components/ui/Badge.jsx';
import Icon from '../components/ui/Icon.jsx';

export default function StepsTracker({
  steps,
  stepsLoading,
  allDone,
  profileData
}) {
  if (stepsLoading) {
    return (
      <SectionCard title="Next steps">
        <div className="space-y-3" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-5 w-full" />
          ))}
        </div>
      </SectionCard>
    );
  }

  if (allDone) {
    return (
      <SectionCard title="Next steps">
        <p className="text-sm text-muted">You’ve completed every step. Keep practicing with new interviews and roadmap topics.</p>
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Next steps">
      <ul className="space-y-1">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              to={step.to}
              className="flex items-start gap-3 rounded-btn px-2 py-2 transition-colors hover:bg-base-200"
            >
              <span
                className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border ${
                  step.done ? 'border-success bg-success text-success-content' : 'border-base-300'
                }`}
              >
                {step.done && <Icon name="check" className="h-3 w-3" strokeWidth={3} />}
              </span>
              <span className="min-w-0">
                <span className={`block text-sm ${step.done ? 'text-muted line-through' : 'font-medium'}`}>{step.label}</span>
                {!step.done && step.hint && <span className="block text-xs text-muted">{step.hint}</span>}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {profileData && (
        <div className="mt-4 border-t border-base-300 pt-4">
          <p className="eyebrow mb-2">Top priority focus</p>
          <div className="flex flex-wrap gap-1.5">
            {(profileData.topPriorityFocus || []).slice(0, 4).map((focus) => (
              <Badge key={focus} tone="primary">
                {focus}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  );
}