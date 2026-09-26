import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import ChipList from '../../components/common/ChipList.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { roadmapApi } from '../../services/api/index.js';
import { formatDate, formatDurationDays, pluralize } from '../../utils/format.js';
import RoadmapNode from './RoadmapNode.jsx';

export default function RoadmapDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: roadmap, error, loading, reload, setData } = useApi(() => roadmapApi.getRoadmap(id), [id]);
  const [view, setView] = useState('milestones');
  const [saving, setSaving] = useState({}); // nodeId -> true while a status update is in flight

  useDocumentTitle(roadmap ? `${roadmap.targetRole} · Roadmap` : 'Roadmap');

  const nodesById = useMemo(() => new Map((roadmap?.nodes || []).map((n) => [n.id, n])), [roadmap]);
  const orderedNodes = useMemo(
    () => [...(roadmap?.nodes || [])].sort((a, b) => (a.learningOrder ?? 0) - (b.learningOrder ?? 0)),
    [roadmap]
  );
  const milestones = useMemo(() => [...(roadmap?.milestones || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)), [roadmap]);
  const orphanNodes = useMemo(() => {
    const inMilestone = new Set(milestones.flatMap((m) => m.nodeIds || []));
    return orderedNodes.filter((n) => !inMilestone.has(n.id));
  }, [milestones, orderedNodes]);

  if (loading) return <PageSkeleton label="Loading roadmap…" />;
  if (error) return <ErrorState error={error} onRetry={reload} backTo="/roadmap" backLabel="Back to roadmaps" />;
  if (!roadmap) return null;

  const total = roadmap.nodes.length;
  const counts = roadmap.nodes.reduce((acc, n) => ({ ...acc, [n.status]: (acc[n.status] || 0) + 1 }), {});
  const completed = counts.completed || 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  function patchNodeStatus(nodeId, status) {
    setData((r) => ({ ...r, nodes: r.nodes.map((n) => (n.id === nodeId ? { ...n, status } : n)) }));
  }

  // Optimistic update: the UI changes immediately and rolls back if the request fails.
  async function handleStatusChange(nodeId, status) {
    const previous = nodesById.get(nodeId)?.status || 'not_started';
    if (previous === status) return;
    patchNodeStatus(nodeId, status);
    setSaving((s) => ({ ...s, [nodeId]: true }));
    try {
      await roadmapApi.updateNodeStatus(id, nodeId, status);
    } catch (err) {
      patchNodeStatus(nodeId, previous);
      toast.error(err);
    } finally {
      setSaving((s) => {
        const next = { ...s };
        delete next[nodeId];
        return next;
      });
    }
  }

  function renderNode(node) {
    const prerequisites = (node.prerequisiteIds || []).map((pid) => nodesById.get(pid)).filter(Boolean);
    return (
      <RoadmapNode
        key={node.id}
        node={node}
        prerequisites={prerequisites}
        saving={Boolean(saving[node.id])}
        onStatusChange={handleStatusChange}
      />
    );
  }

  const skillGap = roadmap.skillGap || {};

  return (
    <div>
      <PageHeader
        backTo="/roadmap"
        backLabel="All roadmaps"
        title={roadmap.targetRole}
        description={`~${formatDurationDays(roadmap.totalEstimatedDurationDays)} estimated · generated ${formatDate(roadmap.generatedAt)}`}
      />

      <div className="surface mb-6 p-5">
        <div className="mb-2 flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Progress</p>
            <p className="text-2xl font-semibold tabular-nums">{percent}%</p>
          </div>
          <p className="text-right text-sm text-muted">
            {completed} of {pluralize(total, 'topic')} completed
            {counts.in_progress ? ` · ${counts.in_progress} in progress` : ''}
            {counts.skipped ? ` · ${counts.skipped} skipped` : ''}
          </p>
        </div>
        <progress className="progress progress-primary h-2.5 w-full" value={completed} max={total || 1} aria-label="Roadmap progress" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <SectionCard title="Overview" className="lg:col-span-2">
          <p className="whitespace-pre-line text-sm leading-relaxed">{roadmap.overallSummary}</p>
        </SectionCard>
        <SectionCard title="Skill gap">
          <div className="space-y-4">
            <div>
              <p className="eyebrow mb-2">Already have</p>
              <ChipList items={skillGap.alreadyHave} tone="success" empty="None of your requested skills yet." />
            </div>
            <div>
              <p className="eyebrow mb-2">To learn</p>
              <ChipList items={skillGap.missing} tone="warning" empty="No specific skills were requested." />
            </div>
          </div>
        </SectionCard>
      </div>

      <div role="tablist" className="tabs tabs-boxed mb-4 mt-8 inline-flex bg-base-100 p-1">
        {[
          { value: 'milestones', label: 'By milestone' },
          { value: 'all', label: 'All topics in order' },
        ].map((tab) => (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={view === tab.value}
            className={`tab h-8 ${view === tab.value ? 'tab-active !bg-primary !text-primary-content' : ''}`}
            onClick={() => setView(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {view === 'milestones' ? (
        <div className="space-y-8">
          {milestones.map((milestone) => {
            const nodes = (milestone.nodeIds || []).map((nid) => nodesById.get(nid)).filter(Boolean);
            if (nodes.length === 0) return null;
            const done = nodes.filter((n) => n.status === 'completed').length;
            return (
              <section key={milestone.order} aria-label={milestone.title}>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-content">
                    {milestone.order}
                  </span>
                  <h2 className="text-base font-semibold">{milestone.title}</h2>
                  <Badge tone="neutral">
                    {done}/{nodes.length} done
                  </Badge>
                  {milestone.estimatedDurationDays > 0 && <Badge tone="neutral">~{formatDurationDays(milestone.estimatedDurationDays)}</Badge>}
                </div>
                <div className="space-y-3 border-l-2 border-base-300 pl-4">{nodes.map(renderNode)}</div>
              </section>
            );
          })}
          {orphanNodes.length > 0 && (
            <section aria-label="Other topics">
              <h2 className="mb-3 text-base font-semibold">Other topics</h2>
              <div className="space-y-3">{orphanNodes.map(renderNode)}</div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-3">{orderedNodes.map(renderNode)}</div>
      )}
    </div>
  );
}
