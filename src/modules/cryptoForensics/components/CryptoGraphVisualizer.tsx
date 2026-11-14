import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  Node,
  Edge,
  MarkerType,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  TrendingUp,
  Hash,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CryptoTransactionProfile } from '../types';
import { useTheme } from '../../../context/ThemeContext';

interface CryptoGraphVisualizerProps {
  nodes: CryptoTransactionProfile[];
  edges: { sourceTxId: string; targetTxId: string }[];
  selectedTxId: string | null;
  onSelectTx: (txId: string) => void;
  pathHighlightTxIds?: string[];
}

const CustomCryptoNode = ({ data }: any) => {
  const isSelected = data.isSelected;
  const isHighlightedInPath = data.isHighlightedInPath;
  const isIllicit = data.classLabel === 'illicit';
  const isLicit = data.classLabel === 'licit';

  let borderColor = 'border-slate-400 dark:border-slate-700';
  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let nodeBadge = 'UNCLASSIFIED BITCOIN TX';

  if (isIllicit) {
    borderColor = 'border-rose-500';
    badgeColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
    nodeBadge = 'ILLICIT BITCOIN TX';
  } else if (isLicit) {
    borderColor = 'border-emerald-500';
    badgeColor = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30';
    nodeBadge = 'LICIT VASP / WALLET';
  }

  let shadowRing = '';
  if (isSelected) {
    shadowRing = 'ring-2 ring-blue-500 shadow-xl';
  } else if (isHighlightedInPath) {
    shadowRing = 'ring-2 ring-amber-400 shadow-lg';
    borderColor = 'border-amber-400';
  }

  return (
    <div
      onClick={data.onClick}
      className={`px-3 py-2.5 rounded-xl border-2 bg-white dark:bg-[#0c1322] shadow-sm min-w-[210px] max-w-[230px] cursor-pointer transition-all duration-150 ${borderColor} ${shadowRing}`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-blue-500" />

      <div className="flex items-center justify-between gap-1 mb-1.5">
        <span className={`text-[8.5px] font-mono font-bold px-1.5 py-0.2 rounded border ${badgeColor}`}>
          {nodeBadge}
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-600 dark:text-slate-400">
          Step {data.timeStep}
        </span>
      </div>

      <div className="font-mono font-bold text-xs text-slate-900 dark:text-white truncate">
        tx: {data.txId}
      </div>

      <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/80 text-[10px]">
        <div className="flex items-center gap-1">
          <span className="text-slate-400">Risk:</span>
          <span
            className={`font-mono font-bold ${
              data.riskScore >= 75
                ? 'text-rose-600 dark:text-rose-400'
                : data.riskScore >= 40
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-emerald-600 dark:text-emerald-400'
            }`}
          >
            {data.riskScore}%
          </span>
        </div>

        <div className="flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
          <span>In:{data.inDegree}</span>
          <span>•</span>
          <span>Out:{data.outDegree}</span>
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-rose-500" />
    </div>
  );
};

const nodeTypes = {
  cryptoTxNode: CustomCryptoNode,
};

export const CryptoGraphVisualizer: React.FC<CryptoGraphVisualizerProps> = ({
  nodes,
  edges,
  selectedTxId,
  onSelectTx,
  pathHighlightTxIds = [],
}) => {
  const { theme } = useTheme();

  const { flowNodes, flowEdges } = useMemo(() => {
    const highlightSet = new Set(pathHighlightTxIds);

    // Grid layout with topological column spacing by timeStep
    const timeStepGroups = new Map<number, CryptoTransactionProfile[]>();
    nodes.forEach((n) => {
      const ts = n.timeStep || 1;
      if (!timeStepGroups.has(ts)) timeStepGroups.set(ts, []);
      timeStepGroups.get(ts)!.push(n);
    });

    const flowNodes: Node[] = [];
    const sortedSteps = Array.from(timeStepGroups.keys()).sort((a, b) => a - b);

    sortedSteps.forEach((ts, colIdx) => {
      const group = timeStepGroups.get(ts)!;
      group.forEach((nodeProf, rowIdx) => {
        const xPos = 80 + colIdx * 320;
        const yPos = 60 + rowIdx * 120;

        flowNodes.push({
          id: nodeProf.txId,
          type: 'cryptoTxNode',
          position: { x: xPos, y: yPos },
          data: {
            txId: nodeProf.txId,
            timeStep: nodeProf.timeStep,
            classLabel: nodeProf.classLabel,
            riskScore: nodeProf.riskScore,
            inDegree: nodeProf.inDegree,
            outDegree: nodeProf.outDegree,
            isSelected: selectedTxId === nodeProf.txId,
            isHighlightedInPath: highlightSet.has(nodeProf.txId),
            onClick: () => onSelectTx(nodeProf.txId),
          },
        });
      });
    });

    const flowEdges: Edge[] = edges.map((e, idx) => {
      const isPathEdge =
        highlightSet.has(e.sourceTxId) &&
        highlightSet.has(e.targetTxId) &&
        pathHighlightTxIds.indexOf(e.targetTxId) === pathHighlightTxIds.indexOf(e.sourceTxId) + 1;

      return {
        id: `e-crypto-${e.sourceTxId}-${e.targetTxId}-${idx}`,
        source: e.sourceTxId,
        target: e.targetTxId,
        animated: isPathEdge,
        style: {
          stroke: isPathEdge ? '#f59e0b' : theme === 'dark' ? '#475569' : '#94a3b8',
          strokeWidth: isPathEdge ? 3 : 1.5,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isPathEdge ? '#f59e0b' : theme === 'dark' ? '#64748b' : '#94a3b8',
        },
      };
    });

    return { flowNodes, flowEdges };
  }, [nodes, edges, selectedTxId, pathHighlightTxIds, theme, onSelectTx]);

  return (
    <div className="h-[480px] w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b14] relative overflow-hidden">
      {/* Legend Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 flex-wrap text-[11px] bg-white/90 dark:bg-[#0c1322]/90 backdrop-blur-sm p-2 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
        <span className="font-semibold text-slate-700 dark:text-slate-300">Legend:</span>
        <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Illicit Node (Ground Truth)
        </span>
        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Licit VASP / Entity
        </span>
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" /> Unclassified Transaction
        </span>
        {pathHighlightTxIds.length > 0 && (
          <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" /> Reconstructed Pathway
          </span>
        )}
      </div>

      <ReactFlow
        nodes={flowNodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="text-slate-900 dark:text-slate-100"
      >
        <Background color={theme === 'dark' ? '#1e293b' : '#cbd5e1'} gap={16} />
        <Controls className="dark:bg-slate-800 dark:border-slate-700" />
      </ReactFlow>
    </div>
  );
};

