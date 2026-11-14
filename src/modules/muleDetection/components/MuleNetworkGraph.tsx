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
  ArrowRight,
  TrendingUp,
  Building,
  User,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SuspiciousAccountProfile } from '../types';
import { useTheme } from '../../../context/ThemeContext';

interface MuleNetworkGraphProps {
  profile: SuspiciousAccountProfile;
}

// Custom Node for the focused Mule Network
const CustomMuleNode = ({ data }: any) => {
  const isTarget = data.isTarget;
  const isIncoming = data.isIncoming;
  const isCircular = data.isCircular;
  const isCashout = data.isCashout;

  let borderColor = 'border-slate-300 dark:border-slate-700';
  let badgeColor = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  let nodeTitle = 'Counterparty';

  if (isTarget) {
    borderColor = 'border-rose-500 shadow-lg ring-2 ring-rose-500/30';
    badgeColor = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30';
    nodeTitle = 'TARGET MULE NODE';
  } else if (isCircular) {
    borderColor = 'border-purple-500';
    badgeColor = 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/30';
    nodeTitle = 'Circular Washer';
  } else if (isIncoming) {
    borderColor = 'border-blue-500';
    badgeColor = 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30';
    nodeTitle = 'Inflow Source';
  } else if (isCashout) {
    borderColor = 'border-amber-500';
    badgeColor = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30';
    nodeTitle = 'Dispersion / Cashout';
  }

  return (
    <div
      className={`relative px-3 py-2.5 rounded-lg border-2 bg-white dark:bg-[#0c1322] shadow-sm min-w-[190px] max-w-[220px] transition-all ${borderColor}`}
    >
      <Handle type="target" position={Position.Left} className="w-2 h-2 bg-blue-500" />
      
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className={`text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded border ${badgeColor}`}>
          {nodeTitle}
        </span>
        <span className="text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400">
          {data.riskScore ? `${data.riskScore}% Risk` : ''}
        </span>
      </div>

      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
        {data.label}
      </div>

      <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 truncate">
        {data.accountRef}
      </div>

      <div className="mt-1 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] flex items-center justify-between text-slate-600 dark:text-slate-300">
        <span>{data.bankName || 'Bank'}</span>
        {data.volume ? (
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">
            ₹{data.volume.toLocaleString('en-IN')}
          </span>
        ) : null}
      </div>

      <Handle type="source" position={Position.Right} className="w-2 h-2 bg-rose-500" />
    </div>
  );
};

const nodeTypes = {
  muleNode: CustomMuleNode,
};

export const MuleNetworkGraph: React.FC<MuleNetworkGraphProps> = ({ profile }) => {
  const { theme } = useTheme();

  const { nodes, edges } = useMemo(() => {
    const rawNodes: Node[] = [];
    const rawEdges: Edge[] = [];

    // Center Target Node
    rawNodes.push({
      id: profile.accountId,
      type: 'muleNode',
      position: { x: 380, y: 180 },
      data: {
        label: profile.holderName,
        accountRef: profile.accountReference,
        bankName: profile.bankName,
        riskScore: profile.overallRiskScore,
        volume: profile.totalInflow,
        isTarget: true,
      },
    });

    const incomings = profile.connectedAccounts.filter((c) => c.relationshipType === 'Incoming Source');
    const outgoings = profile.connectedAccounts.filter((c) => c.relationshipType === 'Outgoing Recipient');
    const circulars = profile.connectedAccounts.filter((c) => c.relationshipType === 'Circular Counterparty');

    // Layout Incomings on Left
    incomings.slice(0, 4).forEach((inc, idx) => {
      const yOffset = 80 + idx * 80;
      rawNodes.push({
        id: inc.accountId,
        type: 'muleNode',
        position: { x: 60, y: yOffset },
        data: {
          label: inc.holderName,
          accountRef: inc.accountReference,
          bankName: inc.bankName,
          riskScore: inc.riskScore,
          volume: inc.totalTransferred,
          isIncoming: true,
        },
      });

      rawEdges.push({
        id: `e-${inc.accountId}-${profile.accountId}`,
        source: inc.accountId,
        target: profile.accountId,
        animated: true,
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
        label: `₹${inc.totalTransferred.toLocaleString('en-IN')}`,
        labelStyle: { fontSize: 10, fill: '#3b82f6', fontWeight: 600 },
      });
    });

    // Layout Outgoings on Right
    outgoings.slice(0, 4).forEach((out, idx) => {
      const yOffset = 80 + idx * 80;
      rawNodes.push({
        id: out.accountId,
        type: 'muleNode',
        position: { x: 700, y: yOffset },
        data: {
          label: out.holderName,
          accountRef: out.accountReference,
          bankName: out.bankName,
          riskScore: out.riskScore,
          volume: out.totalTransferred,
          isCashout: true,
        },
      });

      rawEdges.push({
        id: `e-${profile.accountId}-${out.accountId}`,
        source: profile.accountId,
        target: out.accountId,
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' },
        label: `₹${out.totalTransferred.toLocaleString('en-IN')}`,
        labelStyle: { fontSize: 10, fill: '#ef4444', fontWeight: 600 },
      });
    });

    // Layout Circular Nodes on Top/Bottom
    circulars.forEach((circ, idx) => {
      const pos = idx === 0 ? { x: 380, y: 20 } : { x: 380, y: 340 };
      rawNodes.push({
        id: circ.accountId,
        type: 'muleNode',
        position: pos,
        data: {
          label: circ.holderName,
          accountRef: circ.accountReference,
          bankName: circ.bankName,
          riskScore: circ.riskScore,
          volume: circ.totalTransferred,
          isCircular: true,
        },
      });

      rawEdges.push({
        id: `e-circ-out-${profile.accountId}-${circ.accountId}`,
        source: profile.accountId,
        target: circ.accountId,
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
        label: 'Loop Out',
        labelStyle: { fontSize: 9, fill: '#a855f7' },
      });

      rawEdges.push({
        id: `e-circ-in-${circ.accountId}-${profile.accountId}`,
        source: circ.accountId,
        target: profile.accountId,
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2, strokeDasharray: '4 4' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
        label: 'Loop Return',
        labelStyle: { fontSize: 9, fill: '#a855f7' },
      });
    });

    return { nodes: rawNodes, edges: rawEdges };
  }, [profile]);

  return (
    <div className="h-[360px] w-full rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#070b14] relative overflow-hidden">
      <div className="absolute top-2 left-3 z-10 flex items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-white/80 dark:bg-slate-900/80 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-800">
          Topology Topology for {profile.accountReference}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400">
          {profile.connectedAccounts.length} Connected Counterparties
        </span>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-right"
        className="text-slate-900 dark:text-slate-100"
      >
        <Background color={theme === 'dark' ? '#1e293b' : '#cbd5e1'} gap={16} />
        <Controls showInteractive={false} className="dark:bg-slate-800 dark:border-slate-700" />
      </ReactFlow>
    </div>
  );
};

