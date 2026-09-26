import { useMemo } from 'react';
import { Link } from 'react-router-dom';

import SectionCard from '../components/common/SectionCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Icon from '../components/ui/Icon.jsx';
import ScoreRing from '../components/ui/ScoreRing.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useApi } from '../hooks/useApi.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { careerProfileApi, githubApi, interviewApi, portfolioApi, resumeApi, roadmapApi } from '../services/api/index.js';
import { READINESS_LEVELS } from '../utils/constants.js';
import { humanize, pluralize, timeAgo } from '../utils/format.js';

const ACTIVITY_ICONS = { resume: 'document', github: 'code', interview: 'microphone', roadmap: 'map' };

export default function Dashboard() {
  useDocumentTitle('Dashboard');
  const { user } = useAuth();

  // Each source loads independently so one failure never blanks the whole dashboard.
  const profile = useApi(() => careerProfileApi.getCareerProfileOrNull(), []);
  const resumes = useApi(() => resumeApi.listAnalyses(), []);
  const github = useApi(() => githubApi.listAnalyses(), []);
  const interviews = useApi(() => interviewApi.listInterviews(), []);
  const roadmaps = useApi(() => roadmapApi.listRoadmaps(), []);
  const portfolio = useApi(() => portfolioApi.getPortfolio(), []);

  const latestRoadmapId = roadmaps.data?.[0]?._id;
  const roadmapDetail = useApi(() => roadmapApi.getRoadmap(latestRoadmapId), [latestRoadmapId], {
    enabled: Boolean(latestRoadmapId),
  });

  const sources = [profile, resumes, github, interviews, roadmaps, portfolio];
  const hasError = sources.some((s) => s.error);
  const roadmapLoading = roadmaps.loading || Boolean(latestRoadmapId && !roadmapDetail.data && !roadmapDetail.error);

  function reloadAll() {
    sources.forEach((s) => s.reload());
    if (latestRoadmapId) roadmapDetail.reload();
  }

  const latestResume = resumes.data?.[0];
  const latestGithub = github.data?.[0];

  const completedInterviews = useMemo(
    () => (interviews.data || []).filter((i) => i.status === 'completed'),
    [interviews.data]
  );
  const averageScore = useMemo(() => {
    const scores = completedInterviews.map((i) => i.finalReport?.overallScore).filter((s) => Number.isFinite(s));
    if (scores.length === 0) return null;
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [completedInterviews]);

  const roadmapProgress = useMemo(() => {
    const nodes = roadmapDetail.data?.nodes;
    if (!nodes || nodes.length === 0) return null;
    const done = nodes.filter((n) => n.status === 'completed').length;
    return { done, total: nodes.length, percent: Math.round((done / nodes.length) * 100), role: roadmapDetail.data.targetRole };
  }, [roadmapDetail.data]);

  const activity = useMemo(() => {
    const items = [];
    (resumes.data || []).forEach((a) =>
      items.push({
        key: `resume-${a._id}`,
        type: 'resume',
        title: 'Resume analysis',
        subtitle: `${a.resume?.originalFilename || 'Resume'} · ATS ${a.atsScore}`,
        date: a.createdAt,
        to: `/resume/${a._id}`,
      })
    );
    (github.data || []).forEach((a) =>
      items.push({
        key: `github-${a._id}`,
        type: 'github',
        title: `GitHub analysis · @${a.githubUsername}`,
        subtitle: `${humanize(a.estimatedSkillLevel)} · ${a.totalStars ?? 0} stars`,
        date: a.createdAt,
        to: `/github/${a._id}`,
      })
    );
    (interviews.data || []).forEach((i) =>
      items.push({
        key: `interview-${i._id}`,
        type: 'interview',
        title: `${i.role} interview`,
        subtitle:
          i.status === 'completed'
            ? `Completed · score ${i.finalReport?.overallScore ?? '—'}`
            : 'In progress — continue where you left off',
        date: i.createdAt,
        to: `/interviews/${i._id}`,
      })
    );
    (roadmaps.data || []).forEach((r) =>
      items.push({
        key: `roadmap-${r._id}`,
        type: 'roadmap',
        title: `Roadmap · ${r.targetRole}`,
        subtitle: `${pluralize(Math.round(r.totalEstimatedDurationDays || 0), 'day')} estimated`,
        date: r.updatedAt || r.generatedAt,
        to: `/roadmap/${r._id}`,
      })
    );
    return items.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [resumes.data, github.data, interviews.data, roadmaps.data]);

  const anyInput = (resumes.data?.length || 0) + (github.data?.length || 0) + completedInterviews.length > 0;
  const steps = [
    { key: 'resume', label: 'Analyze your resume', to: '/resume', done: (resumes.data?.length || 0) > 0 },
    { key: 'github', label: 'Analyze your GitHub profile', to: '/github', done: (github.data?.length || 0) > 0 },
    { key: 'interview', label: 'Complete a mock interview', to: '/interviews/new', done: completedInterviews.length > 0 },
    { key: 'profile', label: 'Generate your career profile', to: '/career-profile', done: Boolean(profile.data), hint: anyInput ? '' : 'Needs at least one of the steps above' },
    { key: 'roadmap', label: 'Create a learning roadmap', to: '/roadmap', done: (roadmaps.data?.length || 0) > 0, hint: profile.data ? '' : 'Needs a career profile' },
    { key: 'portfolio', label: 'Publish your portfolio', to: '/portfolio', done: Boolean(portfolio.data?.isPublished) },
  ];
  const stepsLoading = sources.some((s) => s.loading);
  const allDone = !stepsLoading && steps.every((s) => s.done);

  const readiness = profile.data ? READINESS_LEVELS[profile.data.overallReadinessLevel] : null;
  const firstName = (user?.name || '').split(' ')[0];

  return (
    <div>
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ''}`}
        description="Here’s where your career prep stands."
        actions={
          <Button as={Link} to="/interviews/new" size="sm">
            <Icon name="microphone" className="h-4 w-4" />
            New mock interview
          </Button>
        }
      />

      {hasError && (
        <div role="alert" className="alert alert-warning mb-5 items-center py-3 text-sm">
          <Icon name="warning" className="h-5 w-5" />
          <span className="flex-1">Some information couldn’t be loaded.</span>
          <button type="button" className="btn btn-sm btn-ghost" onClick={reloadAll}>
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          to="/resume"
          icon="document"
          label="Resume ATS score"
          loading={resumes.loading}
          value={latestResume ? `${latestResume.atsScore}/100` : '—'}
          hint={
            resumes.error
              ? 'Could not load'
              : latestResume
                ? `${pluralize(resumes.data.length, 'analysis', 'analyses')} · ${timeAgo(latestResume.createdAt)}`
                : 'Analyze your resume'
          }
          accessory={latestResume ? <ScoreRing value={latestResume.atsScore} size={48} label="ATS score" /> : null}
        />
        <StatCard
          to="/github"
          icon="code"
          label="GitHub"
          loading={github.loading}
          value={latestGithub ? humanize(latestGithub.estimatedSkillLevel) : '—'}
          hint={
            github.error
              ? 'Could not load'
              : latestGithub
                ? `@${latestGithub.githubUsername} · ${latestGithub.totalStars ?? 0} stars`
                : 'Analyze your GitHub profile'
          }
        />
        <StatCard
          to="/interviews"
          icon="microphone"
          label="Mock interviews"
          loading={interviews.loading}
          value={`${completedInterviews.length} completed`}
          hint={
            interviews.error
              ? 'Could not load'
              : averageScore !== null
                ? `Average score ${averageScore}/100`
                : 'Start your first interview'
          }
        />
        <StatCard
          to={latestRoadmapId ? `/roadmap/${latestRoadmapId}` : '/roadmap'}
          icon="map"
          label="Roadmap progress"
          loading={roadmapLoading}
          value={roadmapProgress ? `${roadmapProgress.percent}%` : '—'}
          hint={
            roadmaps.error
              ? 'Could not load'
              : roadmapProgress
                ? `${roadmapProgress.done} of ${roadmapProgress.total} topics · ${roadmapProgress.role}`
                : 'Generate a roadmap'
          }
        />
        <StatCard
          to="/career-profile"
          icon="user"
          label="Career readiness"
          loading={profile.loading}
          value={readiness ? readiness.label : '—'}
          hint={profile.error ? 'Could not load' : profile.data ? `Updated ${timeAgo(profile.data.generatedAt)}` : 'Generate your career profile'}
        />
        <StatCard
          to="/portfolio"
          icon="globe"
          label="Portfolio"
          loading={portfolio.loading}
          value={portfolio.data ? (portfolio.data.isPublished ? 'Published' : 'Draft') : '—'}
          hint={
            portfolio.error
              ? 'Could not load'
              : portfolio.data?.isPublished
                ? `${pluralize(portfolio.data.viewCount || 0, 'view')}`
                : 'Not public yet'
          }
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Recent activity" className="lg:col-span-2" bodyClassName="p-0">
          {resumes.loading || github.loading || interviews.loading || roadmaps.loading ? (
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
          ) : activity.length === 0 ? (
            <EmptyState
              icon="clock"
              title="No activity yet"
              description="Your analyses and interviews will show up here."
              action={
                <Button as={Link} to="/resume" size="sm">
                  Analyze your resume
                </Button>
              }
            />
          ) : (
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
          )}
        </SectionCard>

        <SectionCard title="Next steps">
          {stepsLoading ? (
            <div className="space-y-3" aria-hidden="true">
              {[0, 1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-5 w-full" />
              ))}
            </div>
          ) : allDone ? (
            <p className="text-sm text-muted">You’ve completed every step. Keep practicing with new interviews and roadmap topics.</p>
          ) : (
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
          )}
          {/* ✅ FIXED CODE */}
{profile.data && profile.data.topPriorityFocus?.length > 0 && (
  <div className="mt-5 border-t border-base-300 pt-4">
    <p className="eyebrow mb-3">Top priority focus</p>
    <ul className="space-y-2.5">
      {(profile.data.topPriorityFocus || []).slice(0, 4).map((focus, index) => (
        <li key={index} className="flex items-start gap-2 text-xs leading-relaxed text-muted">
          <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
          <span>{focus}</span>
        </li>
      ))}
    </ul>
  </div>
)}
        </SectionCard>
      </div>
    </div>
  );
}
