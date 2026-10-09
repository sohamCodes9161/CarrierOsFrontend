import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import RoadmapGraphNode from './RoadmapGraphNode.jsx';

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
        
        // Check if nodes are essentially in the same vertical lane
        const isSameLane = Math.abs(fromRect.left - toRect.left) < 50;
        
        let x1, y1, x2, y2, cp1x, cp1y, cp2x, cp2y;

        if (isSameLane) {
          // SMART ANCHOR: Top-to-Bottom connection for nodes in the same lane
          x1 = fromRect.left - containerRect.left + (fromRect.width / 2) + container.scrollLeft;
          y1 = fromRect.bottom - containerRect.top + container.scrollTop;
          
          x2 = toRect.left - containerRect.left + (toRect.width / 2) + container.scrollLeft;
          y2 = toRect.top - containerRect.top + container.scrollTop;
          
          const bend = (y2 - y1) / 2;
          cp1x = x1;
          cp1y = y1 + bend;
          cp2x = x2;
          cp2y = y2 - bend;
        } else {
          // SMART ANCHOR: Left-to-Right connection for nodes across different lanes
          x1 = fromRect.right - containerRect.left + container.scrollLeft;
          y1 = fromRect.top - containerRect.top + (fromRect.height / 2) + container.scrollTop;
          
          x2 = toRect.left - containerRect.left + container.scrollLeft;
          y2 = toRect.top - containerRect.top + (toRect.height / 2) + container.scrollTop;
          
          const bend = Math.max(40, (x2 - x1) / 2);
          cp1x = x1 + bend;
          cp1y = y1;
          cp2x = x2 - bend;
          cp2y = y2;
        }

        const prereqStatus = nodesById.get(prereqId)?.status;
        const done = prereqStatus === 'completed' || prereqStatus === 'skipped';
        
        next.push({
          id: `${prereqId}->${node.id}`,
          d: `M ${x1} ${y1} C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${x2} ${y2}`,
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
    <div 
      ref={containerRef} 
      className="surface relative overflow-auto rounded-2xl border border-base-300 shadow-inner p-8" 
      style={{ 
        maxHeight: '75vh',
        backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px)',
        backgroundSize: '24px 24px'
      }}
    >
      <svg className="pointer-events-none absolute left-0 top-0" width={svgSize.width} height={svgSize.height} aria-hidden="true">
        {paths.map((p) => (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.done ? 'rgba(76,203,140,0.6)' : 'rgba(255,255,255,0.12)'}
            strokeWidth={2}
            strokeDasharray={p.done ? undefined : '5 5'}
            className="transition-all duration-500 ease-in-out"
          />
        ))}
      </svg>

      <div className="relative flex items-start gap-16">
        {lanes.map((lane) => (
          <div key={lane.key} className="w-72 flex-shrink-0">
            <div className="sticky top-0 z-10 mb-6 -mt-2 bg-surface/90 backdrop-blur-md pb-3 pt-2 rounded-b-lg border-b border-base-300">
              <p className="text-xs font-bold tracking-widest text-muted uppercase ml-2">{lane.title}</p>
            </div>
            <div className="flex flex-col gap-8">
              {lane.nodes.map((node) => (
                <RoadmapGraphNode key={node.id} node={node} locked={!isUnlocked(node)} onOpen={onOpenNode} registerRef={registerRef} />
              ))}
            </div>
          </div>
        ))}

        {orphanNodes.length > 0 && (
          <div className="w-72 flex-shrink-0">
            <div className="sticky top-0 z-10 mb-6 -mt-2 bg-surface/90 backdrop-blur-md pb-3 pt-2 rounded-b-lg border-b border-base-300">
              <p className="text-xs font-bold tracking-widest text-muted uppercase ml-2">Other Topics</p>
            </div>
            <div className="flex flex-col gap-8">
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