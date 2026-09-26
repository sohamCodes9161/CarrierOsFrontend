import { Link } from 'react-router-dom';
import Skeleton from '../components/ui/Skeleton.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import Icon from '../components/ui/Icon.jsx';
import { timeAgo } from '../utils/format.js';

export default function ActivityFeed({
  activity,
  resumesLoading,
  githubLoading,
  interviewsLoading,
  roadmapsLoading
}) {
  const ACTIVITY_ICONS = {
    resume: 'document',
    github: 'code',
    interview: 'microphone',
    roadmap: 'map'
  };

  if (resumesLoading || githubLoading || interviewsLoading || roadmapsLoading) {
    return (
      <SectionCard title="Recent activity" className="lg:col-span-2" bodyClassName="p-0">
        <div className="space-y-4 p-5" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-9 w-9 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-1/2" />
                <Skeleton className="h-3 w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  if (activity.length === 0) {
    return (
      <SectionCard title="Recent activity" className="lg:col-span-2" bodyClassName="p-0">
        <EmptyState
          icon="clock"
          title="No activity yet"
          description="Your analyses and interviews will show up here."
          action={
            <Link to="/resume">
              <button className="btn btn-sm">Analyze your resume</button>
            </Link>
          }
        />
      </SectionCard>
    );
  }

  return (
    <SectionCard title="Recent activity" className="lg:col-span-2" bodyClassName="p-0">
      <ul className="divide-y divide-base-300">
        {activity.map((item) => (
          <li key={item.key}>
            <Link to={item.to} className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-base-200/70">
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon name={ACTIVITY_ICONS[item.type]} className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{item.title}</span>
                <span className="block truncate text-xs text-muted">{item.subtitle}</span>
              </span>
              <span className="hidden flex-shrink-0 text-xs text-muted sm:block">{timeAgo(item.date)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </SectionCard>
  );
}