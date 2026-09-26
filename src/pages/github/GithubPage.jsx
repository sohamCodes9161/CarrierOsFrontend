import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import AiWaitNotice from '../../components/common/AiWaitNotice.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import FormField, { fieldProps } from '../../components/forms/FormField.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorAlert from '../../components/ui/ErrorAlert.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { SkeletonRows } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { githubApi } from '../../services/api/index.js';
import { SKILL_LEVEL_TONES } from '../../utils/constants.js';
import { formatDate, humanize } from '../../utils/format.js';
import { GITHUB_USERNAME_REGEX } from '../../utils/validation.js';

export default function GithubPage() {
  useDocumentTitle('GitHub analyzer');
  const navigate = useNavigate();
  const toast = useToast();

  const [username, setUsername] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const history = useApi(() => githubApi.listAnalyses(), []);
  const analyze = useAction(githubApi.analyzeProfile);

  function validate(value) {
    const v = value.trim().replace(/^@/, '');
    if (!v) return 'Enter a GitHub username.';
    if (v.length > 39) return 'GitHub usernames are at most 39 characters.';
    if (!GITHUB_USERNAME_REGEX.test(v)) return 'Use letters, numbers, and single hyphens only.';
    return '';
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const problem = validate(username);
    setUsernameError(problem);
    if (problem) return;
    const result = await analyze.run(username.trim().replace(/^@/, ''));
    if (result.ok) {
      toast.success('GitHub profile analyzed.');
      navigate(`/github/${result.data._id}`);
    }
  }

  const analyses = history.data || [];

  return (
    <div>
      <PageHeader
        title="GitHub analyzer"
        description="Analyze any public GitHub profile: languages, recent activity, repository health, and an overall skill assessment."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <SectionCard title="New analysis" className="self-start lg:col-span-2">
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <ErrorAlert error={analyze.error} />

            <FormField id="github-username" label="GitHub username" error={usernameError} hint="Only public data is read. No sign-in to GitHub is needed." required>
              <div className={`input input-bordered flex items-center gap-2 ${usernameError ? 'input-error' : ''}`}>
                <Icon name="code" className="h-4 w-4 text-muted" />
                <input
                  {...fieldProps('github-username', usernameError, true)}
                  type="text"
                  className="grow bg-transparent outline-none"
                  placeholder="octocat"
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  maxLength={40}
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (usernameError) setUsernameError('');
                  }}
                  disabled={analyze.loading}
                />
              </div>
            </FormField>

            {analyze.loading ? (
              <AiWaitNotice title="Analyzing profile…" description="Reading repositories and activity. This can take up to a minute." />
            ) : (
              <Button type="submit" className="w-full">
                <Icon name="sparkles" className="h-4 w-4" />
                Analyze profile
              </Button>
            )}
          </form>
        </SectionCard>

        <div className="lg:col-span-3">
          <h2 className="mb-3 text-base font-semibold">Past analyses</h2>
          {history.loading ? (
            <SkeletonRows rows={3} />
          ) : history.error ? (
            <ErrorState error={history.error} onRetry={() => history.reload()} />
          ) : analyses.length === 0 ? (
            <div className="surface">
              <EmptyState icon="code" title="No analyses yet" description="Enter a username on the left to analyze a GitHub profile." />
            </div>
          ) : (
            <ul className="space-y-3">
              {analyses.map((a) => (
                <li key={a._id}>
                  <Link to={`/github/${a._id}`} className="surface lift flex items-center gap-4 p-4">
                    <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-base-200 text-muted">
                      <Icon name="code" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold">@{a.githubUsername}</span>
                      <span className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge tone={SKILL_LEVEL_TONES[a.estimatedSkillLevel] || 'neutral'}>{humanize(a.estimatedSkillLevel)}</Badge>
                        <span className="text-xs text-muted">
                          {a.publicRepoCount ?? 0} repos · {a.totalStars ?? 0} stars
                        </span>
                      </span>
                    </span>
                    <span className="hidden text-xs text-muted sm:block">{formatDate(a.createdAt)}</span>
                    <Icon name="arrow-right" className="h-4 w-4 text-muted" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
