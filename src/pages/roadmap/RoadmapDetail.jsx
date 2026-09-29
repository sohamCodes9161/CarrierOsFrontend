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
import { cn } from '../../utils/cn.js'; // <-- This is the missing import that caused the crash!
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
  const [view, setView] = useState('milestones'); 
  const [saving, setSaving] = useState({}); 
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
    <div className="pb-12">
      <PageHeader
        backTo="/roadmap"
        backLabel="All roadmaps"
        title={roadmap.targetRole}
        description={`~${formatDurationDays(roadmap.totalEstimatedDurationDays)} estimated · generated ${formatDate(roadmap.generatedAt)}`}
      />

      {/* Upgraded Progress Widget */}
      <div className="surface mb-8 overflow-hidden rounded-2xl p-6 relative">
        <div className="absolute top-0 left-0 h-1 w-full bg-base-300">
          <div className="h-full bg-primary transition-all duration-500 ease-out" style={{ width: `${percent}%` }} />
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="eyebrow mb-1 text-primary">Your Progress</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold tracking-tight text-white">{percent}%</span>
              <span className="text-sm font-medium text-muted">completed</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm font-medium">
            <div className="flex flex-col">
              <span className="text-white text-lg">{completed} / {total}</span>
              <span className="text-muted text-xs uppercase tracking-wider">Topics</span>
            </div>
            {counts.in_progress > 0 && (
              <div className="flex flex-col border-l border-base-300 pl-4">
                <span className="text-info text-lg">{counts.in_progress}</span>
                <span className="text-muted text-xs uppercase tracking-wider">In Progress</span>
              </div>
            )}
            {counts.skipped > 0 && (
              <div className="flex flex-col border-l border-base-300 pl-4">
                <span className="text-muted text-lg">{counts.skipped}</span>
                <span className="text-muted text-xs uppercase tracking-wider">Skipped</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 mb-8">
        <SectionCard title="Overview" className="lg:col-span-2 shadow-sm">
          <p className="whitespace-pre-line text-[15px] leading-relaxed text-white/80">{roadmap.overallSummary}</p>
        </SectionCard>
        <SectionCard title="Skill gap" className="shadow-sm">
          <div className="space-y-5">
            <div>
              <p className="eyebrow mb-2.5">Already have</p>
              <ChipList items={skillGap.alreadyHave} tone="success" empty="None of your requested skills yet." />
            </div>
            <div>
              <p className="eyebrow mb-2.5">To learn</p>
              <ChipList items={skillGap.missing} tone="warning" empty="No specific skills were requested." />
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Upgraded View Toggles */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-base-300 pb-4">
        <div role="tablist" className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 border border-base-300">
          {MODES.map((m) => (
            <button
              key={m.value}
              type="button"
              role="tab"
              aria-selected={mode === m.value}
              className={cn(
                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                mode === m.value ? 'bg-primary text-primary-content shadow' : 'text-muted hover:text-white hover:bg-base-200/50'
              )}
              onClick={() => setMode(m.value)}
            >
              <Icon name={m.icon} className="h-4 w-4" />
              {m.label}
            </button>
          ))}
        </div>

        {mode === 'list' && (
          <div role="tablist" className="flex items-center gap-1 rounded-lg bg-surface-2 p-1 border border-base-300">
            {[
              { value: 'milestones', label: 'By milestone' },
              { value: 'all', label: 'All topics' },
            ].map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={view === tab.value}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-all',
                  view === tab.value ? 'bg-base-300 text-white shadow' : 'text-muted hover:text-white hover:bg-base-200/50'
                )}
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
            <div className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-medium text-muted bg-surface-2 inline-flex py-2 px-4 rounded-full border border-base-300">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-success shadow-[0_0_8px_rgba(76,203,140,0.6)]" /> Completed
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-info shadow-[0_0_8px_rgba(59,130,246,0.6)]" /> In progress
              </span>
              <span className="flex items-center gap-2">
                <Icon name="lock" className="h-3 w-3 text-warning" /> Locked
              </span>
            </div>
            <RoadmapGraph lanes={lanes} orphanNodes={orphanNodes} nodesById={nodesById} isUnlocked={isUnlocked} onOpenNode={setSelectedNodeId} />
          </>
        ) : (
          <div className="surface p-8 text-center rounded-xl border border-dashed border-base-300">
            <p className="text-sm text-muted">Not enough topic data to draw a graph yet.</p>
          </div>
        )
      ) : view === 'milestones' ? (
        <div className="space-y-10">
          {milestones.map((milestone) => {
            const nodes = (milestone.nodeIds || []).map((nid) => nodesById.get(nid)).filter(Boolean);
            if (nodes.length === 0) return null;
            const done = nodes.filter((n) => n.status === 'completed').length;
            return (
              <section key={milestone.order} aria-label={milestone.title} className="relative">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary border border-primary/30 text-sm font-bold shadow-sm">
                    {milestone.order}
                  </span>
                  <h2 className="text-lg font-bold text-white">{milestone.title}</h2>
                  <Badge tone="neutral" className="ml-2 bg-surface-2 border-base-300">
                    {done}/{nodes.length} done
                  </Badge>
                  {milestone.estimatedDurationDays > 0 && <Badge tone="info" className="bg-info/10 text-info border-info/20">~{formatDurationDays(milestone.estimatedDurationDays)}</Badge>}
                </div>
                <div className="space-y-3 border-l-2 border-primary/20 pl-6 ml-4">{nodes.map(renderNode)}</div>
              </section>
            );
          })}
          {orphanNodes.length > 0 && (
            <section aria-label="Other topics">
              <h2 className="mb-4 text-lg font-bold text-white ml-4">Other topics</h2>
              <div className="space-y-3 ml-4">{orphanNodes.map(renderNode)}</div>
            </section>
          )}
        </div>
      ) : (
        <div className="space-y-4">{orderedNodes.map(renderNode)}</div>
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