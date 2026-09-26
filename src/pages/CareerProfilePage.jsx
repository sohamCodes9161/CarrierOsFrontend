import { Link } from 'react-router-dom';

import AiWaitNotice from '../components/common/AiWaitNotice.jsx';
import BulletList from '../components/common/BulletList.jsx';
import SectionCard from '../components/common/SectionCard.jsx';
import PageHeader from '../components/layout/PageHeader.jsx';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ErrorAlert from '../components/ui/ErrorAlert.jsx';
import ErrorState from '../components/ui/ErrorState.jsx';
import Icon from '../components/ui/Icon.jsx';
import { PageSkeleton } from '../components/ui/Skeleton.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useAction } from '../hooks/useAction.js';
import { useApi } from '../hooks/useApi.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { careerProfileApi } from '../services/api/index.js';
import { READINESS_LEVELS, SKILL_LEVEL_TONES } from '../utils/constants.js';
import { formatDate, formatDateTime, humanize } from '../utils/format.js';

const SOURCE_TONES = { resume: 'primary', github: 'neutral', interview: 'secondary' };

function SummaryCard({ icon, title, to, children, emptyText }) {
  return (
    <div className="surface p-5">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="eyebrow flex items-center gap-1.5">
          <Icon name={icon} className="h-4 w-4" />
          {title}
        </p>
        {to && children && (
          <Link to={to} className="text-xs font-medium text-primary hover:underline">
            View
          </Link>
        )}
      </div>
      {children || <p className="text-sm text-muted">{emptyText}</p>}
    </div>
  );
}

export default function CareerProfilePage() {
  useDocumentTitle('Career profile');
  const toast = useToast();
  const { data: profile, error, loading, reload, setData } = useApi(() => careerProfileApi.getCareerProfileOrNull(), []);
  const generate = useAction(careerProfileApi.generateCareerProfile);

  async function handleGenerate() {
    const result = await generate.run();
    if (result.ok) {
      setData(result.data);
      toast.success(profile ? 'Career profile refreshed.' : 'Career profile generated.');
    }
  }

  if (loading) return <PageSkeleton label="Loading career profile…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;

  const needsInputs = generate.error?.status === 400;

  if (!profile) {
    return (
      <div>
        <PageHeader title="Career profile" description="One view of your skills, strengths, and next priorities." />
        <div className="surface mx-auto max-w-2xl">
          <EmptyState
            icon="user"
            title="No career profile yet"
            description="Your profile combines your latest resume analysis, GitHub analysis, and completed interviews. You need at least one of them first."
            action={
              generate.loading ? (
                <AiWaitNotice title="Building your profile…" description="This usually takes 10–30 seconds." />
              ) : (
                <Button onClick={handleGenerate}>
                  <Icon name="sparkles" className="h-4 w-4" />
                  Generate career profile
                </Button>
              )
            }
          />
          {generate.error && (
            <div className="px-6 pb-8">
              <ErrorAlert error={generate.error} />
              {needsInputs && (
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  <Button as={Link} to="/resume" variant="outline" size="sm">
                    Analyze resume
                  </Button>
                  <Button as={Link} to="/github" variant="outline" size="sm">
                    Analyze GitHub
                  </Button>
                  <Button as={Link} to="/interviews/new" variant="outline" size="sm">
                    Take an interview
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  const readiness = READINESS_LEVELS[profile.overallReadinessLevel] || { label: humanize(profile.overallReadinessLevel), tone: 'neutral' };
  const { resumeSummary, githubSummary, interviewSummary } = profile;
  const hasInterviews = (interviewSummary?.interviewsCompleted || 0) > 0;

  return (
    <div>
      <PageHeader
        title="Career profile"
        description={`Generated ${formatDateTime(profile.generatedAt)}. Regenerate after new analyses or interviews.`}
        actions={
          <Button variant="outline" size="sm" onClick={handleGenerate} loading={generate.loading}>
            <Icon name="refresh" className="h-4 w-4" />
            {generate.loading ? 'Refreshing…' : 'Regenerate'}
          </Button>
        }
      />

      {generate.error && <ErrorAlert error={generate.error} className="mb-5" />}
      {generate.loading && (
        <div className="mb-5">
          <AiWaitNotice title="Rebuilding your profile…" description="This usually takes 10–30 seconds." />
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard
          title="Overview"
          className="lg:col-span-2"
          actions={<Badge tone={readiness.tone}>{readiness.label}</Badge>}
        >
          <p className="whitespace-pre-line text-sm leading-relaxed">{profile.narrative}</p>
        </SectionCard>

        <SectionCard title="Top priorities">
          {profile.topPriorityFocus?.length > 0 ? (
            <ol className="space-y-3">
              {profile.topPriorityFocus.map((focus, index) => (
                <li key={`${index}-${focus}`} className="flex gap-3 text-sm">
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                    {index + 1}
                  </span>
                  <span className="leading-relaxed">{focus}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-muted">No priorities were listed.</p>
          )}
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryCard
          icon="document"
          title="Resume"
          to={resumeSummary?.resumeAnalysisId ? `/resume/${resumeSummary.resumeAnalysisId}` : '/resume'}
          emptyText="No resume analysis included."
        >
          {resumeSummary && (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">ATS score</dt>
                <dd className="font-medium tabular-nums">{resumeSummary.atsScore}/100</dd>
              </div>
              {resumeSummary.jobMatchScore >= 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Job match</dt>
                  <dd className="font-medium tabular-nums">{resumeSummary.jobMatchScore}%</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Analyzed</dt>
                <dd>{formatDate(resumeSummary.analyzedAt)}</dd>
              </div>
            </dl>
          )}
        </SummaryCard>

        <SummaryCard
          icon="code"
          title="GitHub"
          to={githubSummary?.githubAnalysisId ? `/github/${githubSummary.githubAnalysisId}` : '/github'}
          emptyText="No GitHub analysis included."
        >
          {githubSummary && (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Profile</dt>
                <dd className="font-medium">@{githubSummary.githubUsername}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Level</dt>
                <dd>
                  <Badge tone={SKILL_LEVEL_TONES[githubSummary.estimatedSkillLevel] || 'neutral'}>
                    {humanize(githubSummary.estimatedSkillLevel)}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Total stars</dt>
                <dd className="tabular-nums">{githubSummary.totalStars ?? 0}</dd>
              </div>
            </dl>
          )}
        </SummaryCard>

        <SummaryCard icon="microphone" title="Interviews" to="/interviews" emptyText="No completed interviews yet.">
          {hasInterviews && (
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Completed</dt>
                <dd className="font-medium tabular-nums">{interviewSummary.interviewsCompleted}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Average score</dt>
                <dd className="tabular-nums">{interviewSummary.averageScore ?? '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Most recent</dt>
                <dd>{formatDate(interviewSummary.lastInterviewAt)}</dd>
              </div>
            </dl>
          )}
        </SummaryCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard title="Strengths">
          <BulletList items={profile.strengths} tone="success" empty="No strengths were listed." />
        </SectionCard>
        <SectionCard title="Growth areas">
          <BulletList items={profile.growthAreas} tone="warning" empty="No growth areas were listed." />
        </SectionCard>
      </div>

      <SectionCard
        title="Skills"
        description="Skills confirmed across your resume, GitHub, and interviews. More sources means higher confidence."
        className="mt-6"
        bodyClassName="p-0"
      >
        {profile.skills?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Skill</th>
                  <th>Confirmed by</th>
                  <th className="text-right">Mentions</th>
                </tr>
              </thead>
              <tbody>
                {profile.skills.map((skill) => (
                  <tr key={skill._id || skill.name}>
                    <td className="font-medium">{skill.name}</td>
                    <td>
                      <div className="flex flex-wrap gap-1">
                        {(skill.sources || []).map((source) => (
                          <Badge key={source} tone={SOURCE_TONES[source] || 'neutral'}>
                            {humanize(source)}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="text-right tabular-nums">{skill.mentionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-5 text-sm text-muted">No skills were found.</p>
        )}
      </SectionCard>

      <div className="mt-6 flex flex-wrap gap-3">
        <Button as={Link} to="/roadmap">
          <Icon name="map" className="h-4 w-4" />
          Build a learning roadmap
        </Button>
        <Button as={Link} to="/portfolio" variant="outline">
          <Icon name="globe" className="h-4 w-4" />
          Start your portfolio
        </Button>
      </div>
    </div>
  );
}
