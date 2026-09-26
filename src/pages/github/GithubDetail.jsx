import { useParams } from 'react-router-dom';

import BulletList from '../../components/common/BulletList.jsx';
import ChipList from '../../components/common/ChipList.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { githubApi } from '../../services/api/index.js';
import { SKILL_LEVEL_TONES } from '../../utils/constants.js';
import { formatDate, humanize } from '../../utils/format.js';

function Metric({ label, value }) {
  return (
    <div className="surface p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-1 text-xl font-semibold tabular-nums">{value ?? '—'}</p>
    </div>
  );
}

function Check({ ok, label }) {
  return ok ? (
    <span className="inline-flex text-success" title={`${label}: yes`}>
      <Icon name="check" className="h-4 w-4" strokeWidth={2.5} />
      <span className="sr-only">{label}: yes</span>
    </span>
  ) : (
    <span className="inline-flex text-error/70" title={`${label}: no`}>
      <Icon name="x" className="h-4 w-4" strokeWidth={2.5} />
      <span className="sr-only">{label}: no</span>
    </span>
  );
}

export default function GithubDetail() {
  const { id } = useParams();
  const { data: a, error, loading, reload } = useApi(() => githubApi.getAnalysis(id), [id]);
  useDocumentTitle(a ? `@${a.githubUsername} · GitHub` : 'GitHub analysis');

  if (loading) return <PageSkeleton label="Loading analysis…" />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/github" backLabel="Back to GitHub" />;
  if (!a) return null;

  return (
    <div>
      <PageHeader
        backTo="/github"
        backLabel="All analyses"
        title={`@${a.githubUsername}`}
        description={`Analyzed ${formatDate(a.createdAt)}${a.bio ? ` · ${a.bio}` : ''}`}
        actions={
          <>
            <Badge tone={SKILL_LEVEL_TONES[a.estimatedSkillLevel] || 'neutral'} className="badge-lg">
              {humanize(a.estimatedSkillLevel)}
            </Badge>
            {a.profileUrl && (
              <Button as="a" href={a.profileUrl} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                <Icon name="external" className="h-4 w-4" />
                View on GitHub
              </Button>
            )}
          </>
        }
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-6">
        <Metric label="Public repos" value={a.publicRepoCount} />
        <Metric label="Stars" value={a.totalStars} />
        <Metric label="Forks" value={a.totalForks} />
        <Metric label="Followers" value={a.followers} />
        <Metric label="Account age" value={Number.isFinite(a.accountAgeYears) ? `${Number(a.accountAgeYears).toFixed(1)} yrs` : '—'} />
        <Metric label="Active days (90d)" value={a.activeDaysLast90} />
      </div>

      <SectionCard title="Summary" className="mt-6">
        <p className="text-sm leading-relaxed">{a.summary}</p>
        {a.activityAssessment && (
          <p className="mt-3 border-t border-base-300 pt-3 text-sm leading-relaxed text-muted">
            <span className="font-medium text-base-content">Activity: </span>
            {a.activityAssessment}
          </p>
        )}
      </SectionCard>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard title="Strengths">
          <BulletList items={a.strengths} tone="success" empty="No strengths were listed." />
        </SectionCard>
        <SectionCard title="Areas for improvement">
          <BulletList items={a.areasForImprovement} tone="warning" empty="No improvements were listed." />
        </SectionCard>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <SectionCard title="Languages">
          {a.languageBreakdown?.length > 0 ? (
            <ul className="space-y-3">
              {a.languageBreakdown.map((l) => (
                <li key={l.language}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{l.language}</span>
                    <span className="tabular-nums text-muted">{Math.round(l.percentage)}%</span>
                  </div>
                  <progress className="progress progress-primary h-2 w-full" value={l.percentage} max="100" aria-label={`${l.language} share`} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">No language data available.</p>
          )}
        </SectionCard>

        <SectionCard title="Recent commit activity">
          <dl className="grid grid-cols-3 gap-4 text-center">
            <div>
              <dd className="text-2xl font-semibold tabular-nums">{a.commitCountLast30Days ?? 0}</dd>
              <dt className="mt-0.5 text-xs text-muted">Commits, 30 days</dt>
            </div>
            <div>
              <dd className="text-2xl font-semibold tabular-nums">{a.commitCountLast90Days ?? 0}</dd>
              <dt className="mt-0.5 text-xs text-muted">Commits, 90 days</dt>
            </div>
            <div>
              <dd className="text-2xl font-semibold tabular-nums">{a.activeDaysLast90 ?? 0}</dd>
              <dt className="mt-0.5 text-xs text-muted">Active days</dt>
            </div>
          </dl>
          {a.lastActiveAt && <p className="mt-4 text-center text-xs text-muted">Last active {formatDate(a.lastActiveAt)}</p>}
          <div className="mt-5 border-t border-base-300 pt-4">
            <p className="eyebrow mb-2">Inferred skills</p>
            <ChipList items={a.inferredSkills} tone="primary" empty="No skills inferred." />
          </div>
        </SectionCard>
      </div>

      {a.topRepos?.length > 0 && (
        <SectionCard title="Top repositories" className="mt-6" bodyClassName="p-0">
          <ul className="divide-y divide-base-300">
            {a.topRepos.map((repo) => (
              <li key={repo.name} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">
                    {repo.name}
                  </a>
                  {repo.description && <p className="mt-0.5 text-sm text-muted">{repo.description}</p>}
                </div>
                <div className="flex flex-shrink-0 flex-wrap items-center gap-2 text-xs text-muted">
                  {repo.language && <Badge tone="neutral">{repo.language}</Badge>}
                  <span className="inline-flex items-center gap-1">
                    <Icon name="star" className="h-3.5 w-3.5" /> {repo.stars ?? 0}
                  </span>
                  <span>{repo.forks ?? 0} forks</span>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {a.projectHighlights?.length > 0 && (
        <SectionCard title="Project highlights" className="mt-6" bodyClassName="space-y-3">
          {a.projectHighlights.map((p) => (
            <div key={p.repoName} className="rounded-btn border border-base-300 p-4">
              <p className="text-sm font-semibold">{p.repoName}</p>
              <p className="mt-1 text-sm text-muted">{p.whyItStandsOut}</p>
            </div>
          ))}
        </SectionCard>
      )}

      {a.repoHealth?.length > 0 && (
        <SectionCard title="Repository health" description="Checked for the top repositories." className="mt-6" bodyClassName="p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Repository</th>
                  <th className="text-center">README</th>
                  <th className="text-center">License</th>
                  <th className="text-center">Tests</th>
                  <th className="text-center">CI</th>
                  <th className="text-center">.gitignore</th>
                  <th className="text-center">package.json</th>
                  <th className="text-right">Score</th>
                </tr>
              </thead>
              <tbody>
                {a.repoHealth.map((h) => (
                  <tr key={h.repoName}>
                    <td className="font-medium">{h.repoName}</td>
                    <td className="text-center"><Check ok={h.hasReadme} label="README" /></td>
                    <td className="text-center"><Check ok={h.hasLicense} label="License" /></td>
                    <td className="text-center"><Check ok={h.hasTests} label="Tests" /></td>
                    <td className="text-center"><Check ok={h.hasCI} label="CI" /></td>
                    <td className="text-center"><Check ok={h.hasGitignore} label=".gitignore" /></td>
                    <td className="text-center"><Check ok={h.hasPackageJson} label="package.json" /></td>
                    <td className="text-right font-semibold tabular-nums">{h.healthScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      )}
    </div>
  );
}
