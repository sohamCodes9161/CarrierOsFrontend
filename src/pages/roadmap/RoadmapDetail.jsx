import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import ChipList from '../../components/common/ChipList.jsx';
import SectionCard from '../../components/common/SectionCard.jsx';
import PageHeader from '../../components/layout/PageHeader.jsx';
import Badge from '../../components/ui/Badge.jsx';
import ErrorState from '../../components/ui/ErrorState.jsx';
import Icon from '../../components/ui/Icon.jsx';
import { PageSkeleton } from '../../components/ui/Skeleton.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useApi } from '../../hooks/useApi.js';
import { useDocumentTitle } from '../../hooks/useDocumentTitle.js';
import { roadmapApi } from '../../services/api/index.js';
import { formatDate, formatDurationDays, pluralize } from '../../utils/format.js';
import NodeDrawer from './NodeDrawer.jsx';
import RoadmapGraph from './RoadmapGraph.jsx';
import RoadmapNode from './RoadmapNode.jsx';

const MODES = [
  { value: 'graph', label: 'Graph view', icon: 'layout' },
  { value: 'list', label: 'List view', icon: 'menu' },
];

export default function RoadmapDetail() {
  const { id } = useParams();
  const toast = useToast();
  const { data: roadmap, error, loading, reload, setData } = useApi(() => roadmapApi.getRoadmap(id), [id]);
  const [mode, setMode] = useState('graph');
  const [view, setView] = useState('milestones'); // sub-tab within list mode
  const [saving, setSaving] = useState({}); // nodeId -> true while a status update is in flight
  const [selectedNodeId, setSelectedNodeId] = useState(null);

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

  // The graph's lanes reuse the roadmap's own milestones as logical phases (e.g.
  // Foundations -> Advanced), keeping the graph grounded in real backend data.
  const lanes = useMemo(
    () =>
      milestones
        .map((m) => ({
          key: `m-${m.order}`,
          title: m.title,
          nodes: (m.nodeIds || []).map((nid) => nodesById.get(nid)).filter(Boolean),
        }))
        .filter((lane) => lane.nodes.length > 0),
    [milestones, nodesById]
  );

  function isUnlocked(node) {
    const prereqs = node.prerequisiteIds || [];
    if (prereqs.length === 0) return true;
    return prereqs.every((pid) => {
      const status = nodesById.get(pid)?.status;
      return status === 'completed' || status === 'skipped';
    });
  }

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
        onOpenDetail={setSelectedNodeId}
      />
    );
  }

  const skillGap = roadmap.skillGap || {};
  const selectedNode = selectedNodeId ? nodesById.get(selectedNodeId) : null;
  const selectedPrereqs = selectedNode ? (selectedNode.prerequisiteIds || []).map((pid) => nodesById.get(pid)).filter(Boolean) : [];

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

      <div className="mb-4 mt-8 flex flex-wrap items-center justify-between gap-3">
        <div role="tablist" className="tabs tabs-boxed inline-flex bg-base-100 p-1">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="tab"
              aria-selected={mode === m.value}
              className={`tab h-8 gap-1.5 ${mode === m.value ? 'tab-active !bg-primary !text-primary-content' : ''}`}
              onClick={() => setMode(m.value)}
            >
              <Icon name={m.icon} className="h-3.5 w-3.5" />
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'list' && (
          <div role="tablist" className="tabs tabs-boxed inline-flex bg-base-100 p-1">
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
        )}
      </div>

      {mode === 'graph' ? (
        lanes.length > 0 || orphanNodes.length > 0 ? (
          <>
            <p className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-success bg-success/40" /> Completed
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full border border-white bg-white/40" /> In progress
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Icon name="lock" className="h-3 w-3" /> Locked until prerequisites are done
              </span>
            </p>
            <RoadmapGraph lanes={lanes} orphanNodes={orphanNodes} nodesById={nodesById} isUnlocked={isUnlocked} onOpenNode={setSelectedNodeId} />
          </>
        ) : (
          <p className="surface p-6 text-sm text-muted">Not enough topic data to draw a graph yet.</p>
        )
      ) : view === 'milestones' ? (
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

      <NodeDrawer
        open={Boolean(selectedNode)}
        node={selectedNode}
        prerequisites={selectedPrereqs}
        saving={selectedNode ? Boolean(saving[selectedNode.id]) : false}
        onStatusChange={handleStatusChange}
        onClose={() => setSelectedNodeId(null)}
      />
    </div>
  );
}
