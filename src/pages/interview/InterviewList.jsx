import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import EmptyState from '../../components/ui/EmptyState.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { SkeletonRows } from '../../components/ui/Skeleton.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { interviewApi } from '../../services/api/index.js';
import { formatDate, humanize, scoreTone } from '../../utils/format.js';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'completed', label: 'Completed' },
];

function StatusBadge({ status }) {
  return status === 'completed' ? <Badge tone="success">Completed</Badge> : <Badge tone="warning">In progress</Badge>;
}

function ScoreCell({ interview }) {
  const score = interview.finalReport?.overallScore;
  if (!Number.isFinite(score)) return <span className="text-muted">—</span>;
  const tone = scoreTone(score);
  return <Badge tone={tone}>{score}/100</Badge>;
}

export default function InterviewList() {
  useDocumentTitle('Mock interviews');
  const { data, error, loading, reload } = useApi(() => interviewApi.listInterviews(), []);
  const [filter, setFilter] = useState('all');

  const interviews = data || [];
  const visible = useMemo(
    () => (filter === 'all' ? interviews : interviews.filter((i) => i.status === filter)),
    [interviews, filter]
  );

  const newButton = (
    <Button as={Link} to="/interviews/new" size="sm">
      <Icon name="plus" className="h-4 w-4" />
      New interview
    </Button>
  );

  return (
    <div>
      <PageHeader
        title="Mock interviews"
        description="Practice with adaptive AI questions and get scored feedback on every answer."
        actions={newButton}
      />

      {loading ? (
        <SkeletonRows rows={4} />
      ) : error ? (
        <ErrorState error={error} onRetry={() => reload()} />
      ) : interviews.length === 0 ? (
        <div className="surface">
          <EmptyState
            icon="microphone"
            title="No interviews yet"
            description="Start a mock interview for the role you’re aiming for. Your results feed into your career profile."
            action={
              <Button as={Link} to="/interviews/new">
                Start your first interview
              </Button>
            }
          />
        </div>
      ) : (
        <>
          <div role="tablist" className="tabs tabs-boxed mb-4 inline-flex bg-base-100 p-1">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                role="tab"
                aria-selected={filter === f.value}
                className={`tab h-8 ${filter === f.value ? 'tab-active !bg-primary !text-primary-content' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {visible.length === 0 ? (
            <div className="surface">
              <EmptyState icon="microphone" title="Nothing here" description={`You have no ${filter === 'completed' ? 'completed' : 'in-progress'} interviews.`} />
            </div>
          ) : (
            <>
              {/* Tablet and up: table */}
              <div className="surface hidden overflow-x-auto md:block">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Role</th>
                      <th>Type</th>
                      <th>Difficulty</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Started</th>
                      <th className="w-px" />
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((i) => (
                      <tr key={i._id} className="hover">
                        <td className="font-medium">
                          <Link to={`/interviews/${i._id}`} className="hover:text-primary">
                            {i.role}
                          </Link>
                        </td>
                        <td>{humanize(i.interviewType)}</td>
                        <td>{humanize(i.difficulty)}</td>
                        <td>
                          <StatusBadge status={i.status} />
                        </td>
                        <td>
                          <ScoreCell interview={i} />
                        </td>
                        <td className="whitespace-nowrap text-muted">{formatDate(i.createdAt)}</td>
                        <td>
                          <Link to={`/interviews/${i._id}`} className="btn btn-ghost btn-xs">
                            {i.status === 'completed' ? 'View report' : 'Continue'}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile: cards */}
              <ul className="space-y-3 md:hidden">
                {visible.map((i) => (
                  <li key={i._id}>
                    <Link to={`/interviews/${i._id}`} className="surface lift block p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="min-w-0 truncate font-semibold">{i.role}</p>
                        <ScoreCell interview={i} />
                      </div>
                      <p className="mt-1 text-sm text-muted">
                        {humanize(i.interviewType)} · {humanize(i.difficulty)} · {i.totalQuestions} questions
                      </p>
                      <div className="mt-3 flex items-center justify-between">
                        <StatusBadge status={i.status} />
                        <span className="text-xs text-muted">{formatDate(i.createdAt)}</span>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </>
          )}
        </>
      )}
    </div>
  );
}
