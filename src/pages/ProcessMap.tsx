import { useMemo, useState, useEffect } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  MarkerType,
  BackgroundVariant,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { useApp } from '@/contexts/AppContext';
import { EmptyState } from '@/components/ui/States';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { GitBranch, Zap, Play, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { formatDuration } from '@/lib/utils';

// Custom node component with enhanced styling
interface ActivityNodeData {
  label: string;
  frequency: number;
  avgDuration: number;
  deviationCount: number;
  conformanceScore: number;
  isStart: boolean;
  isEnd: boolean;
  isInIdealPath: boolean;
}

function ActivityNode({ data }: { data: ActivityNodeData }) {
  const isDeviating = data.deviationCount > 0;
  const isHighFrequency = data.frequency > 100;

  // Node color based on type
  let nodeColor = 'bg-white border-accent-blue';
  let iconColor = 'text-accent-blue';

  if (data.isStart) {
    nodeColor = 'bg-gradient-to-br from-accent-emerald/10 to-accent-emerald/5 border-accent-emerald shadow-lg shadow-accent-emerald/20';
    iconColor = 'text-accent-emerald';
  } else if (data.isEnd) {
    nodeColor = 'bg-gradient-to-br from-accent-blue/10 to-accent-blue/5 border-accent-blue shadow-lg shadow-accent-blue/20';
    iconColor = 'text-accent-blue';
  } else if (isDeviating) {
    nodeColor = 'bg-gradient-to-br from-accent-rose/10 to-white border-accent-rose shadow-lg shadow-accent-rose/20';
  } else if (data.isInIdealPath) {
    nodeColor = 'bg-white border-accent-blue shadow-md';
  }

  return (
    <>
      {/* Handle for incoming edges */}
      <Handle type="target" position={Position.Left} />

      <div
        className={cn(
          'px-5 py-4 rounded-xl border-2 min-w-[200px] max-w-[280px]',
          'transition-all duration-300 hover:scale-105 hover:shadow-xl',
          nodeColor,
          isDeviating && 'animate-pulse-subtle'
        )}
      >
      {/* Header with icon */}
      <div className="flex items-center gap-2 mb-2">
        {data.isStart && (
          <div className={cn('p-1.5 rounded-full bg-accent-emerald/10', iconColor)}>
            <Play className="w-3.5 h-3.5 fill-current" />
          </div>
        )}
        {data.isEnd && (
          <div className={cn('p-1.5 rounded-full bg-accent-blue/10', iconColor)}>
            <Square className="w-3.5 h-3.5 fill-current" />
          </div>
        )}
        {!data.isStart && !data.isEnd && isHighFrequency && (
          <div className={cn('p-1.5 rounded-full bg-accent-blue/10', iconColor)}>
            <Zap className="w-3.5 h-3.5" />
          </div>
        )}
        <span className="font-semibold text-sm leading-tight flex-1">{data.label}</span>
      </div>

      {/* Metrics */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Cases</span>
          <span className="font-bold text-accent-blue tabular-nums">{data.frequency}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <span className="text-muted">Avg Duration</span>
          <span className="font-medium tabular-nums">{formatDuration(data.avgDuration)}</span>
        </div>

        {/* Progress bar for conformance */}
        <div className="pt-1">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-muted">Conformance</span>
            <span className="font-medium">{(data.conformanceScore * 100).toFixed(0)}%</span>
          </div>
          <div className="w-full h-1.5 bg-surface-3 rounded-full overflow-hidden">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                data.conformanceScore > 0.9 ? 'bg-accent-emerald' :
                data.conformanceScore > 0.7 ? 'bg-accent-amber' :
                'bg-accent-rose'
              )}
              style={{ width: `${data.conformanceScore * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Deviation badge */}
      {isDeviating && (
        <div className="mt-3 pt-2 border-t border-accent-rose/20">
          <div className="text-xs text-accent-rose font-semibold">
            ⚠ {data.deviationCount} deviation{data.deviationCount !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      </div>

      {/* Handle for outgoing edges */}
      <Handle type="source" position={Position.Right} />
    </>
  );
}

const nodeTypes = {
  activity: ActivityNode,
};

// Enhanced layout algorithm
function layoutGraph(nodes: Node[], edges: Edge[]): Node[] {
  const g = new dagre.graphlib.Graph();
  g.setGraph({
    rankdir: 'LR',
    nodesep: 100,
    ranksep: 150,
    marginx: 50,
    marginy: 50,
  });
  g.setDefaultEdgeLabel(() => ({}));

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 240, height: 140 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  return nodes.map((node) => {
    const pos = g.node(node.id);
    return {
      ...node,
      position: { x: pos.x - 120, y: pos.y - 70 },
    };
  });
}

export default function ProcessMap() {
  const { processModel, conformance } = useApp();
  const navigate = useNavigate();
  const [showIdealPath, setShowIdealPath] = useState(true);
  const [highlightDeviations, setHighlightDeviations] = useState(true);
  const [showFrequency, setShowFrequency] = useState(true);

  const { nodes, edges } = useMemo(() => {
    if (!processModel) return { nodes: [], edges: [] };

    // Calculate deviation counts per activity
    const deviationCounts = new Map<string, number>();
    conformance.forEach((c) => {
      c.deviations.forEach((d) => {
        deviationCounts.set(d.activity, (deviationCounts.get(d.activity) || 0) + 1);
      });
    });

    // Check which activities are in ideal path
    const idealPathSet = new Set(processModel.idealPath);

    // Create nodes with enhanced data
    const useCustomNodes = true; // Custom nodes now work with edges!

    const rawNodes: Node<ActivityNodeData>[] = processModel.activities.map((activity) => ({
      id: activity.id,
      type: useCustomNodes ? 'activity' : 'default',
      position: { x: 0, y: 0 },
      data: useCustomNodes ? {
        label: activity.name,
        frequency: activity.frequency,
        avgDuration: activity.avgDuration,
        deviationCount: highlightDeviations ? (deviationCounts.get(activity.name) || 0) : 0,
        conformanceScore: Math.max(0.7, 1 - (deviationCounts.get(activity.name) || 0) / activity.frequency),
        isStart: activity.isStart,
        isEnd: activity.isEnd,
        isInIdealPath: idealPathSet.has(activity.name),
      } : {
        label: activity.name, // Simple label for default nodes
      },
    }));

    // Create enhanced edges

    const maxFrequency = Math.max(...processModel.transitions.map((t) => t.frequency), 1);
    const rawEdges: Edge[] = processModel.transitions.map((transition, index) => {
      const isIdeal = transition.isInIdealPath;
      const normalizedFreq = transition.frequency / maxFrequency;

      // Edge styling based on ideal path and frequency
      let strokeColor = `hsl(211, 96%, ${48 + normalizedFreq * 20}%)`;
      let strokeWidth = Math.max(2, 2 + normalizedFreq * 4);

      if (showIdealPath && isIdeal) {
        strokeColor = 'hsl(160, 84%, 39%)'; // Emerald for ideal path
        strokeWidth = Math.max(3, 4 + normalizedFreq * 3);
      }

      const edge = {
        id: `${transition.id}-${index}`,
        source: transition.source,
        target: transition.target,
        type: 'smoothstep',
        animated: showIdealPath && isIdeal,
        style: {
          strokeWidth,
          stroke: strokeColor,
          strokeDasharray: undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 25,
          height: 25,
          color: strokeColor,
        },
        label: showFrequency ? `${transition.frequency}` : undefined,
        labelBgStyle: {
          fill: 'white',
          fillOpacity: 0.9,
        },
        labelStyle: {
          fontSize: 11,
          fontWeight: 600,
          fill: '#344054',
        },
      };

      return edge;
    });

    // Apply layout
    const layoutedNodes = layoutGraph(rawNodes, rawEdges);

    return { nodes: layoutedNodes, edges: rawEdges };
  }, [processModel, conformance, showIdealPath, highlightDeviations, showFrequency]);

  if (!processModel) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-2">Process Map</h1>
        <p className="text-muted mb-8">Visual process discovery and analysis</p>

        <EmptyState
          icon={GitBranch}
          title="No Process Model"
          description="Load event log data first to discover and visualize the process model as a directed graph."
          action={
            <Button onClick={() => navigate('/event-logs')}>Go to Event Logs</Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="p-8 pb-4">
        <h1 className="text-3xl font-bold mb-2">Process Map</h1>
        <p className="text-muted">Directed graph showing process flow and relationships</p>
      </div>

      <div className="flex-1 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          minZoom={0.2}
          maxZoom={2}
          defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
          attributionPosition="bottom-left"
          proOptions={{ hideAttribution: false }}
        >
          <Background
            variant={BackgroundVariant.Dots}
            gap={20}
            size={1}
            color="hsl(var(--surface-3))"
          />
          <Controls />
          <MiniMap
            nodeStrokeWidth={3}
            nodeColor={(node) => {
              const data = node.data as ActivityNodeData;
              if (data.isStart) return 'hsl(160, 84%, 39%)';
              if (data.isEnd) return 'hsl(211, 96%, 48%)';
              if (data.deviationCount > 0) return 'hsl(347, 77%, 50%)';
              return 'hsl(211, 96%, 48%)';
            }}
            maskColor="rgba(0, 0, 0, 0.05)"
          />
        </ReactFlow>

        {/* Enhanced Control Panel */}
        <Card className="absolute top-4 right-4 w-72 p-5 space-y-5 shadow-xl">
          <div>
            <h3 className="font-semibold text-sm mb-4">Display Options</h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Ideal Path</label>
                <Switch checked={showIdealPath} onCheckedChange={setShowIdealPath} />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Deviations</label>
                <Switch
                  checked={highlightDeviations}
                  onCheckedChange={setHighlightDeviations}
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Edge Labels</label>
                <Switch
                  checked={showFrequency}
                  onCheckedChange={setShowFrequency}
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-3">
            <p className="text-xs font-semibold text-muted mb-3">Legend</p>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-accent-emerald/10">
                  <Play className="w-3 h-3 text-accent-emerald fill-current" />
                </div>
                <span>Start Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-1 rounded-full bg-accent-blue/10">
                  <Square className="w-3 h-3 text-accent-blue fill-current" />
                </div>
                <span>End Activity</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-accent-emerald rounded"></div>
                <span>Ideal Path (animated)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-accent-blue rounded"></div>
                <span>Alternative Path</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded border-2 border-accent-rose bg-accent-rose/10"></div>
                <span>Has Deviations</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-surface-3">
            <div className="text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-muted">Activities:</span>
                <span className="font-semibold">{processModel.activities.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Transitions:</span>
                <span className="font-semibold">{processModel.transitions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Variants:</span>
                <span className="font-semibold">{processModel.variants.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Nodes Rendered:</span>
                <span className="font-semibold">{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted">Edges Rendered:</span>
                <span className={edges.length === 0 ? "font-semibold text-accent-rose" : "font-semibold"}>{edges.length}</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
