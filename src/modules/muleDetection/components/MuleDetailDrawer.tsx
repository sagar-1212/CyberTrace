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
  Building,
  User,
  Hash,
  AlertOctagon,
  Copy,
  Check,
} from 'lucide-react';
import { SuspiciousAccountProfile } from '../types';
import { MuleNetworkGraph } from './MuleNetworkGraph';

interface MuleDetailDrawerProps {
  profile: SuspiciousAccountProfile | null;
  onClose: () => void;
  onInitiateFreeze: (accountRef: string, holderName: string, bankName: string) => void;
  onUpdateStatus: (accountId: string, status: any) => void;
}

export const MuleDetailDrawer: React.FC<MuleDetailDrawerProps> = ({
  profile,
  onClose,
  onInitiateFreeze,
  onUpdateStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'evidence' | 'graph' | 'connected' | 'timeline'>('evidence');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!profile) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30';
      case 'High':
        return 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30';
      case 'Medium':
        return 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30';
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[620px] bg-white dark:bg-[#090f1d] border-l border-slate-200 dark:border-slate-800 shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/60 dark:bg-[#0b1222]">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
              {profile.accountReference}
            </span>
            <button
              onClick={() => handleCopy(profile.accountReference)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              title="Copy Account Ref"
            >
              {copiedId === profile.accountReference ? (
                <Check className="w-3.5 h-3.5 text-emerald-500" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
            <span className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getRiskBadge(profile.riskLevel)}`}>
              {profile.overallRiskScore}% Risk • {profile.riskLevel}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            <span className="font-semibold text-slate-900 dark:text-white">{profile.holderName}</span> • {profile.bankName} ({profile.branch}, {profile.city})
          </p>

          <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
            <span>Archetype: <strong className="text-slate-700 dark:text-slate-300">{profile.primaryArchetype}</strong></span>
            <span>•</span>
            <span>KYC: <strong className="text-slate-700 dark:text-slate-300">{profile.kycStatus}</strong></span>
            <span>•</span>
            <span>Tier: <strong className="text-slate-700 dark:text-slate-300">Layer {profile.layerIndex}</strong></span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Accuracy & Presumption of Innocence Advisory */}
      <div className="px-5 py-2.5 bg-blue-50/70 dark:bg-blue-950/30 border-b border-blue-200/50 dark:border-blue-900/40 text-[11px] text-blue-800 dark:text-blue-300 flex items-center gap-2">
        <ShieldAlert className="w-4 h-4 text-blue-500 flex-shrink-0" />
        <span>
          <strong>Investigative Safeguard:</strong> This assessment represents algorithmic behavioral suspicion based on telemetry. Field verification & human nodal confirmation are mandatory prior to judicial proceedings.
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-[#090f1d] text-xs">
        {[
          { id: 'evidence', label: 'Evidence & Reasons' },
          { id: 'graph', label: 'Ego Network Graph' },
          { id: 'connected', label: `Connected Accounts (${profile.connectedAccounts.length})` },
          { id: 'timeline', label: `Suspicious Txns (${profile.suspiciousTransactions.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3 font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* TAB 1: EVIDENCE & REASONS */}
        {activeTab === 'evidence' && (
          <div className="space-y-5">
            {/* Explainable Reasons */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#0c1322]">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-500" />
                Explainable Law Enforcement Rationale
              </h4>
              <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
                {profile.explainableReasons.map((reason, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Detected Behavioral Patterns */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Identified Mule Behavior Patterns ({profile.detectedPatterns.length})
              </h4>
              <div className="space-y-2.5">
                {profile.detectedPatterns.map((pat) => (
                  <div
                    key={pat.id}
                    className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                        {pat.title}
                      </span>
                      <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-800 dark:text-amber-200">
                        {pat.confidenceScore}% Confidence
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{pat.description}</p>
                    
                    {/* Pattern Metrics */}
                    <div className="pt-2 mt-2 border-t border-amber-500/20 grid grid-cols-2 sm:grid-cols-3 gap-2 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                      {Object.entries(pat.evidence.metrics || {}).map(([k, v]) => (
                        <div key={k}>
                          <span className="text-slate-400 block capitalize">{k.replace(/([A-Z])/g, ' $1')}</span>
                          <span className="text-slate-700 dark:text-slate-200 font-semibold">{String(v)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Factors Breakdown */}
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Risk Engine Mathematical Breakdown
              </h4>
              <div className="space-y-2">
                {profile.riskFactors.map((rf, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] text-xs"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-800 dark:text-slate-200">{rf.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">Weight: {(rf.weight * 100).toFixed(0)}%</span>
                        <span className="font-mono font-bold text-slate-900 dark:text-white">{rf.score}/100</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                      <div
                        className={`h-full rounded-full ${
                          rf.score >= 75
                            ? 'bg-rose-500'
                            : rf.score >= 50
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${rf.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{rf.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Investigative Actions */}
            <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 text-xs space-y-2">
              <h4 className="font-semibold text-blue-900 dark:text-blue-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                Actionable Enforcement Directives
              </h4>
              <ul className="space-y-1.5 text-slate-700 dark:text-slate-300 text-xs">
                {profile.investigativeRecommendations.map((rec, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-blue-600 dark:text-blue-400">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 2: NETWORK GRAPH */}
        {activeTab === 'graph' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive money movement graph highlighting incoming capital origins, pass-through intermediary links, and downstream dispersion targets.
            </p>
            <MuleNetworkGraph profile={profile} />
          </div>
        )}

        {/* TAB 3: CONNECTED ACCOUNTS */}
        {activeTab === 'connected' && (
          <div className="space-y-2.5">
            {profile.connectedAccounts.map((conn) => (
              <div
                key={conn.accountId}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] text-xs flex items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{conn.holderName}</span>
                    <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">({conn.accountReference})</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                        conn.relationshipType === 'Incoming Source'
                          ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300'
                          : conn.relationshipType === 'Circular Counterparty'
                          ? 'bg-purple-500/10 text-purple-700 dark:text-purple-300'
                          : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {conn.relationshipType}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {conn.bankName} • {conn.transactionCount} transfers
                  </p>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{conn.totalTransferred.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">{conn.riskScore}% Risk</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: TIMELINE / SUSPICIOUS TRANSACTIONS */}
        {activeTab === 'timeline' && (
          <div className="space-y-2">
            {profile.suspiciousTransactions.map((txn) => (
              <div
                key={txn.id}
                className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] text-xs flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      txn.direction === 'INFLOW'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {txn.direction === 'INFLOW' ? 'IN' : 'OUT'}
                  </span>
                  <div>
                    <div className="font-mono font-semibold text-slate-900 dark:text-white">
                      {txn.transactionReference}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {txn.direction === 'INFLOW' ? 'From: ' : 'To: '}
                      <strong className="text-slate-700 dark:text-slate-300">{txn.counterpartyName}</strong> ({txn.counterpartyRef})
                    </p>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400">{txn.flagReason}</span>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                    ₹{txn.amount.toLocaleString('en-IN')}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Action Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1222] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onUpdateStatus(profile.accountId, 'Under Investigator Review')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Mark Under Review
          </button>
          <button
            onClick={() => onUpdateStatus(profile.accountId, 'Cleared / False Positive')}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Clear (False Positive)
          </button>
        </div>

        <button
          onClick={() => onInitiateFreeze(profile.accountReference, profile.holderName, profile.bankName)}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5"
        >
          <Lock className="w-3.5 h-3.5" />
          Issue S.91 CrPC Debit Freeze
        </button>
      </div>
    </div>
  );
};

