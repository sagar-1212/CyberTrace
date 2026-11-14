import React, { useMemo, useState } from 'react';
import {
  Coins,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Download,
  Share2,
  Clock,
  Layers,
  ArrowRight,
  CheckCircle2,
  Users,
  Grid,
  List as ListIcon,
  ChevronRight,
  Eye,
  Lock,
  Award,
  HelpCircle,
  Hash,
  ExternalLink,
  Shield,
  FileText,
} from 'lucide-react';
import { CryptoForensicsEngine } from './cryptoGraphEngine';
import { CryptoPathwayResult, CryptoTransactionProfile } from './types';
import { CryptoGraphVisualizer } from './components/CryptoGraphVisualizer';
import { CryptoDetailDrawer } from './components/CryptoDetailDrawer';
import { ModelBenchmarkModal } from './components/ModelBenchmarkModal';

interface CryptoForensicsPageProps {
  onNavigateTab: (tab: any) => void;
}

export const CryptoForensicsPage: React.FC<CryptoForensicsPageProps> = ({ onNavigateTab }) => {
  const engine = useMemo(() => new CryptoForensicsEngine(), []);
  const overview = useMemo(() => engine.getOverview(), [engine]);

  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('All');
  const [selectedTimeStep, setSelectedTimeStep] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'graph' | 'table' | 'clusters'>('graph');
  const [selectedTxId, setSelectedTxId] = useState<string | null>('5530458');
  const [isBenchmarkOpen, setIsBenchmarkOpen] = useState(false);

  // Pathway Explorer State
  const [sourcePathTxId, setSourcePathTxId] = useState('230425980');
  const [targetPathTxId, setTargetPathTxId] = useState('232438397');
  const [pathwayResult, setPathwayResult] = useState<CryptoPathwayResult | null>(null);

  // Selected Profile
  const selectedProfile: CryptoTransactionProfile | null = useMemo(() => {
    if (!selectedTxId) return null;
    return engine.getTransactionProfile(selectedTxId);
  }, [selectedTxId, engine]);

  // Filtered transactions list
  const filteredProfiles = useMemo(() => {
    let list: CryptoTransactionProfile[] = [];
    // Populate all profiles
    const topIllicit = overview.topIllicitTransactions;
    list = [...topIllicit];

    // Filter by search
    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      const direct = engine.getTransactionProfile(q);
      if (direct) {
        list = [direct, ...list.filter((p) => p.txId !== direct.txId)];
      } else {
        list = list.filter((p) => p.txId.toLowerCase().includes(q));
      }
    }

    // Filter by class
    if (selectedClass !== 'All') {
      list = list.filter((p) => p.classLabel.toLowerCase() === selectedClass.toLowerCase());
    }

    // Filter by timeStep
    if (selectedTimeStep !== 'All') {
      const stepNum = parseInt(selectedTimeStep, 10);
      list = list.filter((p) => p.timeStep === stepNum);
    }

    return list;
  }, [overview, searchTerm, selectedClass, selectedTimeStep, engine]);

  // Ego graph or pathway graph to render in visualizer
  const { graphNodes, graphEdges } = useMemo(() => {
    if (pathwayResult && pathwayResult.pathFound) {
      const nodes: CryptoTransactionProfile[] = [];
      const edges: { sourceTxId: string; targetTxId: string }[] = [];
      for (let i = 0; i < pathwayResult.pathTxIds.length; i++) {
        const id = pathwayResult.pathTxIds[i];
        const p = engine.getTransactionProfile(id);
        if (p) nodes.push(p);
        if (i < pathwayResult.pathTxIds.length - 1) {
          edges.push({ sourceTxId: id, targetTxId: pathwayResult.pathTxIds[i + 1] });
        }
      }
      return { graphNodes: nodes, graphEdges: edges };
    }

    const centerId = selectedTxId || '5530458';
    const ego = engine.extractEgoGraph(centerId, 2);
    return { graphNodes: ego.nodes, graphEdges: ego.edges };
  }, [selectedTxId, pathwayResult, engine]);

  const handleExecutePathway = () => {
    if (!sourcePathTxId.trim() || !targetPathTxId.trim()) return;
    const res = engine.findPathway(sourcePathTxId.trim(), targetPathTxId.trim());
    setPathwayResult(res);
  };

  const handleClearPathway = () => {
    setPathwayResult(null);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
              <Coins className="w-3.5 h-3.5" />
              BITCOIN FORENSICS INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              ELLIPTIC BENCHMARK REPOSITORY (167 FEATURES)
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            Cryptocurrency Forensics & On-Chain Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Graph-based Bitcoin transaction tracing, multi-hop taint propagation, and out-of-time machine learning classification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBenchmarkOpen(true)}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Award className="w-4 h-4 text-amber-500" />
            ML Benchmark (F1: 0.787)
          </button>
        </div>
      </div>

      {/* Research Advisory Pill */}
      <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30 text-[11px] text-amber-900 dark:text-amber-300 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <span>
            <strong>Research Scope Notice:</strong> Dataset provides graph-level transaction telemetry. It does not deanonymize privacy coins, access closed exchange records, or establish physical wallet owner identity.
          </span>
        </div>
        <span className="text-[10px] font-mono opacity-80 flex-shrink-0">KDD 2019 Weber et al.</span>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Indexed Bitcoin Txns</span>
            <Hash className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            {overview.totalTransactions.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Ground truth registry</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-rose-500/30 bg-rose-500/5 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-medium">
            <span>Illicit Transactions</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1.5">
            {overview.illicitCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Ransomware/Scam nodes</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-emerald-500/30 bg-emerald-500/5 shadow-sm">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 text-xs font-medium">
            <span>Licit VASP / Wallets</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1.5">
            {overview.licitCount.toLocaleString()}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80 mt-1">Exchanges & Miners</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Peeling Clusters</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            {overview.activeClustersCount}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Connected subgraphs</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-amber-500/30 bg-amber-500/5 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-medium">
            <span>Model Test F1-Score</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1.5">
            0.787
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">PR-AUC: 0.824 (Test)</p>
        </div>
      </div>

      {/* Pathway Explorer Section */}
      <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] shadow-sm space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span>Directed Payment Pathway Reconstructor (Graph BFS Conduit)</span>
          </div>
          {pathwayResult && (
            <button
              onClick={handleClearPathway}
              className="text-[11px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
            >
              Reset Pathway
            </button>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2">
          <input
            type="text"
            value={sourcePathTxId}
            onChange={(e) => setSourcePathTxId(e.target.value)}
            placeholder="Origin TxID (e.g. 230425980)..."
            className="flex-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <ArrowRight className="w-4 h-4 text-slate-400 flex-shrink-0 hidden sm:block" />

          <input
            type="text"
            value={targetPathTxId}
            onChange={(e) => setTargetPathTxId(e.target.value)}
            placeholder="Destination TxID (e.g. 232438397)..."
            className="flex-1 w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          <button
            onClick={handleExecutePathway}
            className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center justify-center gap-1.5 flex-shrink-0"
          >
            Trace Conduit
          </button>
        </div>

        {/* Pathway Result Banner */}
        {pathwayResult && (
          <div
            className={`p-3 rounded-lg border text-xs ${
              pathwayResult.pathFound
                ? 'bg-amber-500/10 border-amber-500/30 text-amber-900 dark:text-amber-300'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            <p className="font-semibold">{pathwayResult.pathSummary}</p>
            {pathwayResult.pathFound && (
              <div className="flex items-center gap-2 mt-2 pt-2 border-t border-amber-500/20 flex-wrap text-[11px] font-mono">
                {pathwayResult.hops.map((hop, i) => (
                  <span key={i} className="flex items-center gap-1">
                    <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-bold border border-amber-500/30">
                      {hop.fromTxId}
                    </span>
                    <ArrowRight className="w-3 h-3 text-amber-500" />
                    {i === pathwayResult.hops.length - 1 && (
                      <span className="px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 font-bold border border-amber-500/30">
                        {hop.toTxId}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Filter and View Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Bitcoin txId (e.g. 5530458, 230425980)..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Classifications</option>
            <option value="Illicit">Illicit Transactions (Anchor)</option>
            <option value="Licit">Licit VASP / Entity</option>
            <option value="Unknown">Unclassified Transactions</option>
          </select>

          {/* TimeStep Filter */}
          <select
            value={selectedTimeStep}
            onChange={(e) => setSelectedTimeStep(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Time Steps (1-49)</option>
            <option value="1">Period 1</option>
            <option value="2">Period 2</option>
            <option value="3">Period 3</option>
            <option value="4">Period 4</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800/60">
            <button
              onClick={() => setViewMode('graph')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'graph'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Graph View"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <ListIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('clusters')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'clusters'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Clusters View"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: GRAPH VIEW */}
      {viewMode === 'graph' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>
              Showing sub-graph slice for transaction: <strong className="font-mono text-slate-900 dark:text-white">{selectedTxId || '5530458'}</strong>
            </span>
            <span className="text-[11px]">Click any node to open forensic dossier</span>
          </div>

          <CryptoGraphVisualizer
            nodes={graphNodes}
            edges={graphEdges}
            selectedTxId={selectedTxId}
            onSelectTx={(txId) => setSelectedTxId(txId)}
            pathHighlightTxIds={pathwayResult?.pathTxIds}
          />
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0c1322] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Transaction ID (txId)</th>
                  <th className="px-4 py-3">Classification</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Taint Proximity</th>
                  <th className="px-4 py-3">In / Out Degree</th>
                  <th className="px-4 py-3">Time Step</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {filteredProfiles.map((prof) => (
                  <tr
                    key={prof.txId}
                    onClick={() => setSelectedTxId(prof.txId)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">
                      {prof.txId}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase ${
                          prof.classLabel === 'illicit'
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : prof.classLabel === 'licit'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                        }`}
                      >
                        {prof.classLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-bold ${
                          prof.riskScore >= 75
                            ? 'text-rose-600 dark:text-rose-400'
                            : prof.riskScore >= 40
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {prof.riskScore}%
                      </span>
                    </td>
                    <td className="px-4 py-3 font-sans text-[11px] text-slate-600 dark:text-slate-300">
                      {prof.taintLevel} ({prof.hopsToNearestIllicit === 0 ? 'Anchor' : `${prof.hopsToNearestIllicit} hops`})
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      In:{prof.inDegree} • Out:{prof.outDegree}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      Period {prof.timeStep}
                    </td>
                    <td className="px-4 py-3 text-right font-sans">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTxId(prof.txId);
                        }}
                        className="px-2.5 py-1 rounded bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-semibold text-[11px]"
                      >
                        Investigate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW 3: CLUSTERS VIEW */}
      {viewMode === 'clusters' && (
        <div className="space-y-4">
          {overview.topClusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20 font-bold">
                      {cluster.clusterId}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{cluster.clusterName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Temporal Period: <strong className="text-slate-700 dark:text-slate-300">Time-Step {cluster.timeStep}</strong> • Central Illicit Hub:{' '}
                    <strong className="font-mono text-blue-600 dark:text-blue-400">{cluster.centralHubTxId}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-rose-600 dark:text-rose-400">
                    {cluster.illicitNodesCount} Illicit Nodes
                  </div>
                  <span className="text-[10px] text-slate-400">{cluster.totalNodesCount} Total Transactions</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Cluster Nodes: <span className="font-mono">{cluster.nodes.slice(0, 4).join(', ')}...</span>
                </span>
                <button
                  onClick={() => {
                    setSelectedTxId(cluster.centralHubTxId);
                    setViewMode('graph');
                  }}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View Ego Graph on Hub <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* LIMITATIONS & COMPLIANCE FRAMEWORK SECTION */}
      <div className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-[#080d18] space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Shield className="w-4 h-4 text-blue-500" />
          Technical Scope & Judicial Evidentiary Limitations
        </div>
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          FinTrace implements graph learning algorithms on public ledger topological features. In strict adherence to scientific ethics and Indian criminal jurisprudence:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] space-y-1">
            <span className="font-semibold text-rose-600 dark:text-rose-400 block">Non-Supported Capabilities</span>
            <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400">
              <li>Cannot de-anonymize Monero/Zcash stealth address rings.</li>
              <li>Cannot access offshore unregulated centralized exchange orderbooks without Interpol MLAT.</li>
              <li>Cannot establish real-world biological personhood from raw hashes alone.</li>
            </ul>
          </div>

          <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] space-y-1">
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 block">Extensible Architecture</span>
            <ul className="space-y-1 list-disc pl-4 text-[11px] text-slate-500 dark:text-slate-400">
              <li>Modular graph schemas support future Bitcoin, Ethereum, and TRC-20 RPC node hooks.</li>
              <li>Zero reliance on paid third-party commercial APIs (Chainalysis / TRM Labs).</li>
              <li>Court-admissible tamper-evident hash logging for all forensic export trails.</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Slide-over Detail Drawer */}
      <CryptoDetailDrawer
        profile={selectedProfile}
        onClose={() => setSelectedTxId(null)}
        onSelectTx={(txId) => setSelectedTxId(txId)}
        onTracePathwayTo={(txId) => {
          setSourcePathTxId(txId);
          setSelectedTxId(null);
        }}
      />

      {/* ML Benchmark Modal */}
      <ModelBenchmarkModal
        isOpen={isBenchmarkOpen}
        onClose={() => setIsBenchmarkOpen(false)}
        models={overview.benchmark.models}
        leakageProtection={overview.benchmark.leakageProtection}
        scientificDisclaimer={overview.benchmark.scientificDisclaimer}
      />
    </div>
  );
};

