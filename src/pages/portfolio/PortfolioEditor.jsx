import { useState } from 'react';
import { Link } from 'react-router-dom';

import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import Button from '../../components/ui/Button.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useAction } from '../../hooks/useAction.js';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { portfolioApi } from '../../services/api/index.js';
import BasicsTab from './BasicsTab.jsx';
import PublishTab from './PublishTab.jsx';
import SectionTab from './SectionTab.jsx';

const TABS = [
  { key: 'basics', label: 'Basics' },
  { key: 'projects', label: 'Projects' },
  { key: 'experience', label: 'Experience' },
  { key: 'education', label: 'Education' },
  { key: 'achievements', label: 'Achievements' },
  { key: 'publish', label: 'Publish' },
];

export default function PortfolioEditor() {
  useDocumentTitle('Portfolio');
  const toast = useToast();
  const { data: portfolio, error, loading, reload, setData } = useApi(() => portfolioApi.getPortfolio(), []);
  const [tab, setTab] = useState('basics');
  const quickStart = useAction(portfolioApi.quickStart);

  if (loading) return <PageSkeleton label="Loading portfolio…" />;
  if (error) return <ErrorState error={error} onRetry={reload} />;
  if (!portfolio) return null;

  async function handleQuickStart() {
    const result = await quickStart.run();
    if (result.ok) {
      setData(result.data);
      toast.success('Portfolio pre-filled from your career profile and GitHub.');
    } else {
      toast.error(result.error);
    }
  }

  const counts = {
    projects: portfolio.projects?.length || 0,
    experience: portfolio.experience?.length || 0,
    education: portfolio.education?.length || 0,
    achievements: portfolio.achievements?.length || 0,
  };

  return (
    <div>
      <PageHeader
        title="Portfolio"
        description="Build your portfolio privately, then publish it to a shareable link."
        actions={
          <>
            <Badge tone={portfolio.isPublished ? 'success' : 'neutral'}>{portfolio.isPublished ? 'Published' : 'Draft'}</Badge>
            {portfolio.isPublished && portfolio.slug && (
              <Button as={Link} to={`/p/${portfolio.slug}`} target="_blank" rel="noopener noreferrer" variant="outline" size="sm">
                <Icon name="eye" className="h-4 w-4" />
                View live
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleQuickStart} loading={quickStart.loading} title="Adds skills from your career profile and your top GitHub repositories. Safe to run more than once.">
              <Icon name="sparkles" className="h-4 w-4" />
              Quick-start
            </Button>
          </>
        }
      />

      <div className="mb-6 overflow-x-auto">
        <div role="tablist" className="tabs tabs-bordered min-w-max">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              role="tab"
              aria-selected={tab === t.key}
              className={`tab h-11 gap-1.5 ${tab === t.key ? 'tab-active font-semibold' : ''}`}
              onClick={() => setTab(t.key)}
            >
              {t.label}
              {counts[t.key] > 0 && <span className="badge badge-sm border-base-300 bg-base-200">{counts[t.key]}</span>}
            </button>
          ))}
        </div>
      </div>

      {/* `key` re-mounts the form when the underlying document changes (e.g. after quick-start). */}
      {tab === 'basics' && <BasicsTab key={portfolio.updatedAt} portfolio={portfolio} onChange={setData} />}
      {['projects', 'experience', 'education', 'achievements'].includes(tab) && (
        <SectionTab key={tab} section={tab} portfolio={portfolio} onChange={setData} />
      )}
      {tab === 'publish' && <PublishTab portfolio={portfolio} onChange={setData} />}
    </div>
  );
}
