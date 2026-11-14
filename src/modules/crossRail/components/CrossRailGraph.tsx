import React, { useMemo } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  MarkerType,
  Node,
  Edge,
  Handle,
  Position,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import {
  Building2,
  Coins,
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  ArrowRightLeft,
  Lock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { CrossRailPathwayCase } from '../types';

interface CrossRailGraphProps {
  crossRailCase: CrossRailPathwayCase;
  onSelectEntity: (entityId: string, entityType: 'BANK_ACCOUNT' | 'CRYPTO_WALLET' | 'BRIDGE' | 'GAP') => void;
}

// Custom Banking Node Component
const BankingNodeComponent = ({ data }: any) => {
  const isVictim = data.accountType === 'Victim Account';
  const isEscrow = data.accountType === 'Exchange Escrow';
  const isMule = data.accountType === 'Mule Candidate';

  let borderColor = 'border-blue-500';
  let badgeColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300';
  let title = 'Bank Account';

  if (isVictim) {
    borderColor = 'border-sky-500';
    badgeColor = 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300';
    title = 'Victim Origin';
  } else if (isEscrow) {
    borderColor = 'border-indigo-500';
    badgeColor = 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300';
    title = 'VASP FIAT Escrow';
  } else if (isMule) {
    borderColor = 'border-amber-500';
    badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
    title = 'Mule Intermediate';
  }

  return (
    <div
      onClick={data.onClick}
      className={`px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 ${borderColor} shadow-md hover:shadow-lg transition-all w-56 text-left cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-blue-500" />
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}>
          <Building2 className="w-2.5 h-2.5" /> {title}
        </span>
        <span className="text-[10px] font-mono text-slate-500">{data.bankName}</span>
      </div>
      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
        {data.holderName}
      </div>
      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
        {data.accountReference}
      </div>
      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Flow</span>
        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
          ₹{data.totalInflowINR.toLocaleString('en-IN')}
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-blue-500" />
    </div>
  );
};

// Custom Crypto Node Component
const CryptoNodeComponent = ({ data }: any) => {
  const isIllicit = data.clusterLabel === 'Darknet Entity';
  const isVasp = data.clusterLabel === 'VASP / Exchange Deposit';

  let borderColor = 'border-amber-500';
  let badgeColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300';
  let title = 'Bitcoin Wallet';

  if (isIllicit) {
    borderColor = 'border-rose-500';
    badgeColor = 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300';
    title = 'Darknet Syndicate';
  } else if (isVasp) {
    borderColor = 'border-purple-500';
    badgeColor = 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300';
    title = 'VASP Hot Wallet';
  }

  return (
    <div
      onClick={data.onClick}
      className={`px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 ${borderColor} shadow-md hover:shadow-lg transition-all w-56 text-left cursor-pointer`}
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-amber-500" />
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${badgeColor}`}>
          <Coins className="w-2.5 h-2.5" /> {title}
        </span>
        <span className="text-[10px] font-mono text-slate-500">{data.blockchain}</span>
      </div>
      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
        {data.knownEntityTag || 'Private Cluster'}
      </div>
      <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
        {data.addressOrClusterId}
      </div>
      <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
        <span className="text-slate-500">Volume</span>
        <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
          {data.estimatedVolumeBtc} BTC
        </span>
      </div>
      <Handle type="source" position={Position.Right} className="w-2.5 h-2.5 bg-amber-500" />
    </div>
  );
};

// Custom Incomplete Gap Node Component
const GapNodeComponent = ({ data }: any) => {
  return (
    <div
      onClick={data.onClick}
      className="px-3.5 py-2.5 rounded-xl bg-rose-50/70 dark:bg-rose-950/40 border-2 border-dashed border-rose-400 dark:border-rose-600 shadow-xs hover:shadow-md transition-all w-56 text-left cursor-pointer"
    >
      <Handle type="target" position={Position.Left} className="w-2.5 h-2.5 bg-rose-500" />
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
          <AlertTriangle className="w-2.5 h-2.5 text-rose-600" /> Broken Pathway
        </span>
        <span className="text-[10px] font-mono text-rose-600 dark:text-rose-400">BLINDSPOT</span>
      </div>
      <div className="font-semibold text-xs text-rose-900 dark:text-rose-200">
        {data.gapType}
      </div>
      <p className="mt-1 text-[10px] text-rose-700/80 dark:text-rose-300 line-clamp-2">
        {data.missingEvidenceDescription}
      </p>
      <div className="mt-2 pt-1 border-t border-rose-200 dark:border-rose-900/60 flex items-center justify-between text-[10px]">
        <span className="text-rose-700 dark:text-rose-300">Action</span>
        <span className="font-medium text-rose-800 dark:text-rose-200 underline">
          Issue Notice
        </span>
      </div>
    </div>
  );
};

const nodeTypes = {
  bankingNode: BankingNodeComponent,
  cryptoNode: CryptoNodeComponent,
  gapNode: GapNodeComponent,
};

export const CrossRailGraph: React.FC<CrossRailGraphProps> = ({
  crossRailCase,
  onSelectEntity,
}) => {
  // Construct nodes and edges layout with swimlanes (Banking on left, Crypto on right)
  const { nodes, edges } = useMemo(() => {
    const generatedNodes: Node[] = [];
    const generatedEdges: Edge[] = [];

    // Left Swimlane: Banking Nodes (X: 50 to 280)
    crossRailCase.bankingAccounts.forEach((acc, index) => {
      generatedNodes.push({
        id: acc.accountId,
        type: 'bankingNode',
        position: { x: 50, y: 50 + index * 120 },
        data: {
          ...acc,
          onClick: () => onSelectEntity(acc.accountId, 'BANK_ACCOUNT'),
        },
      });
    });

    // Banking internal transaction edges
    crossRailCase.bankingTransactions.forEach(bTx => {
      generatedEdges.push({
        id: `EDGE-BANK-${bTx.transactionId}`,
        source: bTx.senderAccountId,
        target: bTx.receiverAccountId,
        label: `₹${(bTx.amountINR / 1000).toFixed(0)}k (${bTx.method})`,
        animated: bTx.status === 'Completed',
        style: { stroke: '#3b82f6', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
      });
    });

    // Right Swimlane: Crypto Nodes (X: 720 to 950)
    crossRailCase.cryptoWallets.forEach((wallet, index) => {
      generatedNodes.push({
        id: wallet.walletId,
        type: 'cryptoNode',
        position: { x: 740, y: 50 + index * 120 },
        data: {
          ...wallet,
          onClick: () => onSelectEntity(wallet.walletId, 'CRYPTO_WALLET'),
        },
      });
    });

    // Crypto on-chain edges
    crossRailCase.cryptoTransactions.forEach(cTx => {
      generatedEdges.push({
        id: `EDGE-CRYPTO-${cTx.txHash.substring(0, 8)}`,
        source: cTx.sourceAddressOrTxId,
        target: cTx.destinationAddressOrTxId,
        label: `${cTx.amountBTC} BTC`,
        animated: true,
        style: { stroke: '#f59e0b', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
      });
    });

    // Center Cross-Rail Bridges
    crossRailCase.bridges.forEach((bridge, idx) => {
      const isConfirmed = bridge.classification === 'Confirmed';
      const isUnknown = bridge.classification === 'Unknown' || bridge.classification === 'Unverified';

      generatedEdges.push({
        id: `EDGE-BRIDGE-${bridge.bridgeId}`,
        source: bridge.fromBankingAccountId,
        target: bridge.toCryptoWalletId,
        label: `${bridge.classification} (${bridge.confidenceScore}%) [${bridge.evidenceType}]`,
        animated: isConfirmed,
        style: {
          stroke: isConfirmed ? '#9333ea' : '#e11d48',
          strokeWidth: isConfirmed ? 3 : 2,
          strokeDasharray: isConfirmed ? undefined : '5,5',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isConfirmed ? '#9333ea' : '#e11d48',
        },
      });
    });

    // Incomplete Pathway Gap Nodes (X: 400, Y: 380)
    crossRailCase.incompleteSegments.forEach((gap, index) => {
      const gapNodeId = `NODE-GAP-${gap.gapId}`;
      generatedNodes.push({
        id: gapNodeId,
        type: 'gapNode',
        position: { x: 420, y: 180 + index * 140 },
        data: {
          ...gap,
          onClick: () => onSelectEntity(gap.gapId, 'GAP'),
        },
      });

      // Link last known entity to gap node
      generatedEdges.push({
        id: `EDGE-TO-GAP-${gap.gapId}`,
        source: gap.lastKnownEntityId,
        target: gapNodeId,
        style: { stroke: '#e11d48', strokeDasharray: '4,4', strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#e11d48' },
      });
    });

    return { nodes: generatedNodes, edges: generatedEdges };
  }, [crossRailCase, onSelectEntity]);

  return (
    <div className="relative w-full h-[540px] bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-inner">
      {/* Swimlane Legend Overlay */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none text-xs">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50/90 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 backdrop-blur-xs font-semibold">
          <Building2 className="w-3.5 h-3.5" /> Banking Rail Domain (Fiat)
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-50/90 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-900 text-purple-800 dark:text-purple-300 backdrop-blur-xs font-semibold">
          <ArrowRightLeft className="w-3.5 h-3.5" /> Evidentiary Cross-Rail Gateway
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-50/90 dark:bg-amber-950/80 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 backdrop-blur-xs font-semibold">
          <Coins className="w-3.5 h-3.5" /> Bitcoin Public Ledger Domain
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.3}
        maxZoom={1.8}
      >
        <Background color="#94a3b8" gap={20} size={1} />
        <Controls position="bottom-right" />
      </ReactFlow>
    </div>
  );
};
