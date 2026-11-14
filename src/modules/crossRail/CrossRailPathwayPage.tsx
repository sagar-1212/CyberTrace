import React, { useState } from 'react';
import {
  ArrowRightLeft,
  Building2,
  Coins,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Clock,
  Layers,
  ArrowRight,
  ExternalLink,
  Info,
  ShieldAlert,
  Search,
  Filter,
} from 'lucide-react';
import { PRIMARY_CROSS_RAIL_CASE } from './crossRailData';
import { CrossRailGraph } from './components/CrossRailGraph';
import { CrossRailTimeline } from './components/CrossRailTimeline';
import { CrossRailDetailDrawer } from './components/CrossRailDetailDrawer';
import { UnifiedTimelineEvent } from './types';

export const CrossRailPathwayPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'GRAPH' | 'TIMELINE' | 'GAPS' | 'REGISTRIES'>('GRAPH');
  const [selectedEntity, setSelectedEntity] = useState<{
    id: string;
    type: 'BANK_ACCOUNT' | 'CRYPTO_WALLET' | 'BRIDGE' | 'GAP';
  } | null>(null);

  const crossRailCase = PRIMARY_CROSS_RAIL_CASE;

  const handleSelectTimelineEvent = (event: UnifiedTimelineEvent) => {
    if (event.associatedEntities.length > 0) {
      const firstEntity = event.associatedEntities[0];
      if (firstEntity.startsWith('ACC-')) {
        setSelectedEntity({ id: firstEntity, type: 'BANK_ACCOUNT' });
      } else if (firstEntity.startsWith('WALLET-') || firstEntity.startsWith('1') || firstEntity.startsWith('bc1')) {
        setSelectedEntity({ id: firstEntity, type: 'CRYPTO_WALLET' });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Case Header Dossier */}
      <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <ArrowRightLeft className="w-3.5 h-3.5" /> Cross-Rail Financial Reconstruction
              </span>
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Case ID: {crossRailCase.caseId}
              </span>
            </div>
            <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white">
              {crossRailCase.caseTitle}
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Synchronized Investigation Dossier: <span className="font-semibold text-slate-800 dark:text-slate-200">{crossRailCase.complaintNumber}</span> • Victim: <span className="font-semibold text-slate-800 dark:text-slate-200">{crossRailCase.victimReference}</span> • Lead Officer: <span className="font-mono text-slate-800 dark:text-slate-200">{crossRailCase.investigatorBadge}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Active Cross-Rail Synchronizer
            </span>
          </div>
        </div>

        {/* KPI Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Total Banking Exposure</span>
              <Building2 className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white">
              ₹{crossRailCase.totalBankingFlowINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-blue-600 dark:text-blue-400 mt-0.5 block">
              4 Accounts (100% Loss Origin)
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Cross-Rail Bridged Volume</span>
              <ArrowRightLeft className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">
              ₹{crossRailCase.totalCrossRailBridgedINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-purple-600/80 dark:text-purple-400/80 mt-0.5 block">
              {crossRailCase.totalCryptoFlowBTC} BTC Settled (70% Trace)
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Untraced Evidentiary Gaps</span>
              <AlertTriangle className="w-4 h-4 text-rose-500" />
            </div>
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400">
              ₹{crossRailCase.untracedGapAmountINR.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-0.5 block">
              2 Broken Pathway Segments
            </span>
          </div>

          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Bridge Evidence Status</span>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              1 Confirmed / 1 Rejected
            </div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              Strict Evidence Rule Active
            </span>
          </div>
        </div>
      </div>

      {/* Mandatory Evidence Rule Legal Disclaimer Banner */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-amber-900 dark:text-amber-300 block">
            EVIDENTIARY INTEGRITY RULE ENFORCED
          </span>
          <p className="text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            FinTrace strictly prohibits connecting banking accounts and crypto wallets based merely on amount similarity, close timestamps, complaint co-occurrence, or pattern resemblance. A cross-rail bridge requires verifiable documentary or cryptographic proof (such as subpoenaed VASP nodal responses, bank deposit UTR memos, or device telemetry). If no evidence exists, the relationship remains <strong className="font-semibold text-rose-600 dark:text-rose-400">Unknown</strong> or <strong className="font-semibold text-rose-600 dark:text-rose-400">Unverified</strong>.
          </p>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 text-sm font-medium gap-2">
        <button
          onClick={() => setActiveTab('GRAPH')}
          className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'GRAPH'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" /> Dual-Rail Pathway Graph
        </button>

        <button
          onClick={() => setActiveTab('TIMELINE')}
          className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'TIMELINE'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <Clock className="w-4 h-4" /> Unified Investigation Timeline
        </button>

        <button
          onClick={() => setActiveTab('GAPS')}
          className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'GAPS'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <AlertTriangle className="w-4 h-4 text-rose-500" /> Incomplete Pathways & Gaps ({crossRailCase.incompleteSegments.length})
        </button>

        <button
          onClick={() => setActiveTab('REGISTRIES')}
          className={`pb-3 px-3 transition-all flex items-center gap-2 border-b-2 ${
            activeTab === 'REGISTRIES'
              ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-bold'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4" /> Entity & Transaction Registries
        </button>
      </div>

      {/* Main Tab Content */}
      {activeTab === 'GRAPH' && (
        <div className="space-y-4">
          <CrossRailGraph
            crossRailCase={crossRailCase}
            onSelectEntity={(id, type) => setSelectedEntity({ id, type })}
          />
        </div>
      )}

      {activeTab === 'TIMELINE' && (
        <CrossRailTimeline
          timeline={crossRailCase.timeline}
          onSelectEvent={handleSelectTimelineEvent}
        />
      )}

      {activeTab === 'GAPS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crossRailCase.incompleteSegments.map(gap => (
            <div
              key={gap.gapId}
              onClick={() => setSelectedEntity({ id: gap.gapId, type: 'GAP' })}
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs hover:border-rose-400 dark:hover:border-rose-600 transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-200">
                  <AlertTriangle className="w-3.5 h-3.5" /> {gap.gapType}
                </span>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                  ₹{gap.estimatedFundsAtRiskINR.toLocaleString('en-IN')} At Risk
                </span>
              </div>

              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Last Tracked Entity: {gap.lastKnownEntityId} ({gap.lastKnownRail} Rail)
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  {gap.missingEvidenceDescription}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-0.5">
                  Actionable Next Step:
                </span>
                <span className="text-slate-600 dark:text-slate-400">
                  {gap.recommendedAction}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'REGISTRIES' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Banking Accounts Registry */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-500" /> Banking Account Entities (Fiat)
              </h3>
              <span className="text-xs text-slate-500">{crossRailCase.bankingAccounts.length} entities</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {crossRailCase.bankingAccounts.map(acc => (
                <div
                  key={acc.accountId}
                  onClick={() => setSelectedEntity({ id: acc.accountId, type: 'BANK_ACCOUNT' })}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-all"
                >
                  <div>
                    <div className="font-semibold text-xs text-slate-900 dark:text-white">
                      {acc.holderName}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500">
                      {acc.accountReference} ({acc.bankName})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                      ₹{acc.totalInflowINR.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {acc.accountType}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Crypto Wallets Registry */}
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" /> Crypto Wallet Clusters (Blockchain)
              </h3>
              <span className="text-xs text-slate-500">{crossRailCase.cryptoWallets.length} entities</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {crossRailCase.cryptoWallets.map(wallet => (
                <div
                  key={wallet.walletId}
                  onClick={() => setSelectedEntity({ id: wallet.walletId, type: 'CRYPTO_WALLET' })}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 px-2 rounded-lg cursor-pointer transition-all"
                >
                  <div className="truncate max-w-[240px]">
                    <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                      {wallet.knownEntityTag || 'Bitcoin Entity'}
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      {wallet.addressOrClusterId}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400">
                      {wallet.estimatedVolumeBtc} BTC
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {wallet.clusterLabel}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Detail Slide-Over Drawer */}
      <CrossRailDetailDrawer
        selectedEntity={selectedEntity}
        crossRailCase={crossRailCase}
        onClose={() => setSelectedEntity(null)}
      />
    </div>
  );
};
