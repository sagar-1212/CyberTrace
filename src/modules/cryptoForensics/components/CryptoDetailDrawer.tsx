import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
  Lock,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Share2,
  Copy,
  Check,
  Hash,
  AlertOctagon,
  ArrowDownLeft,
  ArrowUpRight,
} from 'lucide-react';
import { CryptoTransactionProfile } from '../types';

interface CryptoDetailDrawerProps {
  profile: CryptoTransactionProfile | null;
  onClose: () => void;
  onSelectTx: (txId: string) => void;
  onTracePathwayTo: (txId: string) => void;
}

export const CryptoDetailDrawer: React.FC<CryptoDetailDrawerProps> = ({
  profile,
  onClose,
  onSelectTx,
  onTracePathwayTo,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!profile) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const isIllicit = profile.classLabel === 'illicit';
  const isLicit = profile.classLabel === 'licit';

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[580px] bg-white dark:bg-[#090f1d] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/60 dark:bg-[#0b1222]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
              tx: {profile.txId}
            </span>
            <button
              onClick={() => handleCopy(profile.txId)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy Transaction ID"
            >
              {copiedId === profile.txId ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>

            <span
              className={`text-xs px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider ${
                isIllicit
                  ? 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                  : isLicit
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                  : 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/30'
              }`}
            >
              {profile.classLabel}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
            <span>Time-Step: <strong className="text-slate-700 dark:text-slate-300">Period {profile.timeStep} / 49</strong></span>
            <span>•</span>
            <span>Taint Level: <strong className={isIllicit ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{profile.taintLevel}</strong></span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Research Advisory Banner */}
      <div className="px-5 py-2.5 bg-amber-50/70 dark:bg-amber-950/25 border-b border-amber-200/50 dark:border-amber-900/40 text-[11px] text-amber-900 dark:text-amber-300 flex items-center gap-2">
        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
        <span>
          <strong>Research Benchmark Notice:</strong> Elliptic labels represent academic research classifications. They do not constitute judicial proof of identity, criminal guilt, or ownership of any physical wallet.
        </span>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Risk & Taint Analytics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c1322]">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Calibrated Risk Score
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  profile.riskScore >= 75
                    ? 'text-rose-600 dark:text-rose-400'
                    : profile.riskScore >= 40
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-emerald-600 dark:text-emerald-400'
                }`}
              >
                {profile.riskScore}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {profile.riskScore >= 75 ? 'Critical Risk' : profile.riskScore >= 40 ? 'Suspicious' : 'Low Risk'}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${
                  profile.riskScore >= 75 ? 'bg-rose-500' : profile.riskScore >= 40 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${profile.riskScore}%` }}
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c1322]">
            <span className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider block">
              Illicit Taint Proximity
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span
                className={`text-2xl font-bold font-mono ${
                  profile.taintScore >= 70
                    ? 'text-rose-600 dark:text-rose-400'
                    : profile.taintScore >= 30
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {profile.taintScore}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {profile.hopsToNearestIllicit === 0
                  ? 'Illicit Anchor'
                  : profile.hopsToNearestIllicit === 99
                  ? 'No Proximity'
                  : `${profile.hopsToNearestIllicit} Hops Away`}
              </span>
            </div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
              <div
                className={`h-full rounded-full ${
                  profile.taintScore >= 70 ? 'bg-rose-500' : profile.taintScore >= 30 ? 'bg-amber-500' : 'bg-blue-500'
                }`}
                style={{ width: `${profile.taintScore}%` }}
              />
            </div>
          </div>
        </div>

        {/* Structural Metrics */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] space-y-3">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" />
            Graph Structural Telemetry
          </h4>
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div>
              <span className="text-slate-400 block text-[10px]">Inputs (In-Degree)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{profile.inDegree}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Outputs (Out-Degree)</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{profile.outDegree}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Estimated Volume</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">~{profile.volumeBtcProxy} BTC</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Mining Fee Proxy</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{profile.feeBtcProxy} BTC</span>
            </div>
          </div>

          {/* Archetype Badges */}
          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
            {profile.isPeelingChain && (
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                Peeling Chain Pattern
              </span>
            )}
            {profile.isConsolidation && (
              <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20 font-medium">
                Aggregation / Consolidation Node
              </span>
            )}
            {profile.isDispersion && (
              <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-medium">
                Fan-Out Dispersion Node
              </span>
            )}
          </div>
        </div>

        {/* Explainable Law Enforcement Findings */}
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c1322] space-y-2.5">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            Explainable Forensic Attribution
          </h4>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {profile.explainableFindings.map((finding, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                <span>{finding}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Investigative Directives */}
        <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-2 text-xs">
          <h4 className="font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-500" />
            Actionable Investigation Leads
          </h4>
          <ul className="space-y-1.5 text-slate-700 dark:text-slate-300">
            {profile.investigativeRecommendations.map((rec, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="font-bold text-blue-600 dark:text-blue-400">{idx + 1}.</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Predecessors & Successors */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider">
            Connected Graph Conduit
          </h4>

          {/* Predecessors */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowDownLeft className="w-3.5 h-3.5 text-blue-500" />
              Incoming Feeder Transactions ({profile.predecessorTxIds.length})
            </span>
            {profile.predecessorTxIds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No incoming inputs recorded in this sub-graph slice.</p>
            ) : (
              <div className="space-y-1">
                {profile.predecessorTxIds.map((pId) => (
                  <div
                    key={pId}
                    onClick={() => onSelectTx(pId)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] hover:border-blue-500 cursor-pointer text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="font-mono text-slate-800 dark:text-slate-200">{pId}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Successors */}
          <div className="space-y-1.5 pt-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
              Outgoing Downstream Transactions ({profile.successorTxIds.length})
            </span>
            {profile.successorTxIds.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No outgoing outputs recorded in this sub-graph slice.</p>
            ) : (
              <div className="space-y-1">
                {profile.successorTxIds.map((sId) => (
                  <div
                    key={sId}
                    onClick={() => onSelectTx(sId)}
                    className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] hover:border-rose-500 cursor-pointer text-xs flex items-center justify-between transition-colors"
                  >
                    <span className="font-mono text-slate-800 dark:text-slate-200">{sId}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                      Explore <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1222] flex items-center justify-between gap-3">
        <span className="text-[11px] text-slate-500 dark:text-slate-400">
          Elliptic Dataset v1.0.0
        </span>

        <button
          onClick={() => onTracePathwayTo(profile.txId)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          Trace Pathway From Here
        </button>
      </div>
    </div>
  );
};

