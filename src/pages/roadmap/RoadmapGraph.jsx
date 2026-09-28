import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';

import RoadmapGraphNode from './RoadmapGraphNode.jsx';

/**
 * Interactive node graph, roadmap.sh-style: topics grouped into lanes (the roadmap's own
 * milestones), with connector curves drawn from each prerequisite to its dependents.
 * Positions are read from the DOM (refs + ResizeObserver) rather than a layout library,
 * so this has no extra dependency.
 */
export default function RoadmapGraph({ lanes, orphanNodes, nodesById, isUnlocked, onOpenNode }) {
  const containerRef = useRef(null);
  const nodeRefs = useRef(new Map());
  const [paths, setPaths] = useState([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  const registerRef = useCallback((id, el) => {
    if (el) nodeRefs.current.set(id, el);
    else nodeRefs.current.delete(id);
  }, []);

  const allNodes = useMemo(() => [...lanes.flatMap((l) => l.nodes), ...orphanNodes], [lanes, orphanNodes]);

  const recompute = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    const next = [];
    allNodes.forEach((node) => {
      (node.prerequisiteIds || []).forEach((prereqId) => {
        const fromEl = nodeRefs.current.get(prereqId);
        const toEl = nodeRefs.current.get(node.id);
        if (!fromEl || !toEl) return;
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const x1 = fromRect.right - containerRect.left + container.scrollLeft;
        const y1 = fromRect.top - containerRect.top + fromRect.height / 2 + container.scrollTop;
        const x2 = toRect.left - containerRect.left + container.scrollLeft;
        const y2 = toRect.top - containerRect.top + toRect.height / 2 + container.scrollTop;
        const bend = Math.max(40, (x2 - x1) / 2);
        const prereqStatus = nodesById.get(prereqId)?.status;
        const done = prereqStatus === 'completed' || prereqStatus === 'skipped';
        next.push({
          id: `${prereqId}->${node.id}`,
          d: `M ${x1} ${y1} C ${x1 + bend} ${y1}, ${x2 - bend} ${y2}, ${x2} ${y2}`,
          done,
        });
      });
    });
    setPaths(next);
    setSvgSize({ width: container.scrollWidth, height: container.scrollHeight });
  }, [allNodes, nodesById]);

  useLayoutEffect(() => {
    recompute();
  }, [recompute]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const handle = () => recompute();
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(handle);
      ro.observe(container);
      nodeRefs.current.forEach((el) => ro.observe(el));
    }
    window.addEventListener('resize', handle);
    container.addEventListener('scroll', handle);
    return () => {
      ro?.disconnect();
      window.removeEventListener('resize', handle);
      container.removeEventListener('scroll', handle);
    };
  }, [recompute]);

  return (
    <div ref={containerRef} className="surface relative overflow-auto p-6" style={{ maxHeight: '70vh' }}>
      <svg className="pointer-events-none absolute left-0 top-0" width={svgSize.width} height={svgSize.height} aria-hidden="true">
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.done ? 'rgba(76,203,140,0.55)' : 'rgba(255,255,255,0.16)'}
            strokeWidth={1.5}
            strokeDasharray={p.done ? undefined : '4 4'}
          />
        ))}
      </svg>

      <div className="relative flex items-start gap-10">
        {lanes.map((lane) => (
          <div key={lane.key} className="w-56 flex-shrink-0">
            <div className="sticky top-0 z-10 mb-4 -mt-1 bg-surface-3 pb-2">
              <p className="eyebrow">{lane.title}</p>
            </div>
            <div className="flex flex-col gap-5">
              {lane.nodes.map((node) => (
                <RoadmapGraphNode key={node.id} node={node} locked={!isUnlocked(node)} onOpen={onOpenNode} registerRef={registerRef} />
              ))}
            </div>
          </div>
        ))}

        {orphanNodes.length > 0 && (
          <div className="w-56 flex-shrink-0">
            <div className="sticky top-0 z-10 mb-4 -mt-1 bg-surface-3 pb-2">
              <p className="eyebrow">Other</p>
            </div>
            <div className="flex flex-col gap-5">
              {orphanNodes.map((node) => (
                <RoadmapGraphNode key={node.id} node={node} locked={!isUnlocked(node)} onOpen={onOpenNode} registerRef={registerRef} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
