import React, { useMemo, useState } from 'react';
import {
  UserCheck,
  Search,
  Filter,
  ShieldAlert,
  AlertTriangle,
  RotateCcw,
  Download,
  Building,
  TrendingUp,
  Share2,
  Clock,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  Users,
  Grid,
  List as ListIcon,
  ChevronRight,
  Eye,
  Lock,
} from 'lucide-react';
import { Account, Complaint, Transaction } from '../../types';
import { IntelligentMuleDetectionEngine } from './muleDetectionEngine';
import { MulePatternType, MuleRiskLevel, SuspiciousAccountProfile } from './types';
import { MuleScoreCard } from './components/MuleScoreCard';
import { MuleDetailDrawer } from './components/MuleDetailDrawer';

interface MuleDetectionPageProps {
  accounts: Account[];
  transactions: Transaction[];
  activeComplaint: Complaint;
  onNavigateTab: (tab: any) => void;
  onFreezeRequest?: (txnRef: string, accountRef: string) => void;
}

export const MuleDetectionPage: React.FC<MuleDetectionPageProps> = ({
  accounts,
  transactions,
  activeComplaint,
  onNavigateTab,
  onFreezeRequest,
}) => {
  // Engine analysis initialization
  const engine = useMemo(() => {
    return new IntelligentMuleDetectionEngine(accounts, transactions);
  }, [accounts, transactions]);

  const { profiles, summary } = useMemo(() => {
    return engine.runFullMuleDetection();
  }, [engine]);

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState<string>('All');
  const [selectedPattern, setSelectedPattern] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'grid' | 'table' | 'clusters'>('grid');
  const [selectedProfile, setSelectedProfile] = useState<SuspiciousAccountProfile | null>(null);
  const [freezeNoticeSuccess, setFreezeNoticeSuccess] = useState<string | null>(null);

  // Dynamic Filtering
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        p.holderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.accountReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.branch.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRisk =
        selectedRiskLevel === 'All' || p.riskLevel.toLowerCase() === selectedRiskLevel.toLowerCase();

      const matchesPattern =
        selectedPattern === 'All' ||
        p.detectedPatterns.some((pat) => pat.patternType === selectedPattern);

      return matchesSearch && matchesRisk && matchesPattern;
    });
  }, [profiles, searchTerm, selectedRiskLevel, selectedPattern]);

  const handleInitiateFreeze = (accountRef: string, holderName?: string, bankName?: string) => {
    if (onFreezeRequest) {
      onFreezeRequest(`S91-MULE-${Date.now().toString().slice(-4)}`, accountRef);
    }
    setFreezeNoticeSuccess(`Section 91 CrPC notice submitted to ${bankName || 'Nodal Desk'} for account ${accountRef}.`);
    setTimeout(() => setFreezeNoticeSuccess(null), 4000);
  };

  const handleUpdateStatus = (accountId: string, status: any) => {
    if (selectedProfile && selectedProfile.accountId === accountId) {
      setSelectedProfile({
        ...selectedProfile,
        verificationStatus: status,
      });
    }
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              NATIONAL CYBERCRIME INTELLIGENCE
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
              CASE: {activeComplaint.complaintNumber}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1 flex items-center gap-2.5">
            <UserCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            Intelligent Mule Detection System
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time behavioral graph analytics & explainable multi-factor scoring to detect mule rings, rapid transit hubs, and structuring syndicates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('network')}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            Full DAG Topology
          </button>
        </div>
      </div>

      {/* Freeze Notice Toast */}
      {freezeNoticeSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
          <span>{freezeNoticeSuccess}</span>
        </div>
      )}

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Analyzed Accounts</span>
            <Users className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            {summary.totalAnalyzedAccounts}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Total network footprint</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-rose-500/30 bg-rose-500/5 shadow-sm">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 text-xs font-medium">
            <span>Critical Mule Nodes</span>
            <ShieldAlert className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400 mt-1.5">
            {summary.criticalMuleCount}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">Risk score &ge; 80%</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-amber-500/30 bg-amber-500/5 shadow-sm">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 text-xs font-medium">
            <span>High-Risk Intermediaries</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1.5">
            {summary.highRiskMuleCount}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80 mt-1">Tier 1 & 2 pass-through</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Flagged Transit Volume</span>
            <TrendingUp className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            ₹{summary.totalFlaggedVolumeINR.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">High-risk capital pool</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800/80 shadow-sm col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-medium">
            <span>Mule Syndicates</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900 dark:text-white mt-1.5">
            {summary.syndicateClusters.length}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">Connected clusters detected</p>
        </div>
      </div>

      {/* Top Behavioral Patterns Strip */}
      <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          <span>Dominant Laundering Patterns:</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap text-xs">
          {summary.topDetectedPatterns.map((pat) => (
            <button
              key={pat.patternType}
              onClick={() => setSelectedPattern(selectedPattern === pat.patternType ? 'All' : pat.patternType)}
              className={`px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors flex items-center gap-1.5 ${
                selectedPattern === pat.patternType
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
              }`}
            >
              <span>{pat.label}</span>
              <span className="font-mono font-bold opacity-80">({pat.count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by account reference, holder name, bank or city..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Risk Level Filter */}
          <select
            value={selectedRiskLevel}
            onChange={(e) => setSelectedRiskLevel(e.target.value)}
            className="px-3 py-2 rounded-lg bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="All">All Risk Levels</option>
            <option value="Critical">Critical Risk (&ge;80%)</option>
            <option value="High">High Risk (60-79%)</option>
            <option value="Medium">Medium Risk (40-59%)</option>
            <option value="Low">Low / Cleared</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md text-xs transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
            >
              <Grid className="w-3.5 h-3.5" />
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
              title="Syndicate Clusters"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: GRID VIEW */}
      {viewMode === 'grid' && (
        <div>
          {filteredProfiles.length === 0 ? (
            <div className="p-12 text-center rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322]">
              <UserCheck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <h3 className="font-semibold text-slate-900 dark:text-white text-sm">No accounts match criteria</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Try resetting your search query or selecting a different risk level filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((prof) => (
                <MuleScoreCard
                  key={prof.accountId}
                  profile={prof}
                  isSelected={selectedProfile?.accountId === prof.accountId}
                  onSelect={() => setSelectedProfile(prof)}
                  onInitiateFreeze={handleInitiateFreeze}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: TABLE VIEW */}
      {viewMode === 'table' && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-white dark:bg-[#0c1322] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Account & Holder</th>
                  <th className="px-4 py-3">Bank & Branch</th>
                  <th className="px-4 py-3">Risk Score</th>
                  <th className="px-4 py-3">Archetype</th>
                  <th className="px-4 py-3">Inflow / Turnover</th>
                  <th className="px-4 py-3">Holding Dwell</th>
                  <th className="px-4 py-3">Detected Patterns</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {filteredProfiles.map((prof) => (
                  <tr
                    key={prof.accountId}
                    onClick={() => setSelectedProfile(prof)}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-mono font-semibold text-slate-900 dark:text-white">
                        {prof.accountReference}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">{prof.holderName}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-slate-800 dark:text-slate-200">{prof.bankName}</div>
                      <div className="text-[10px] text-slate-400">{prof.city}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`font-mono font-bold text-xs px-2 py-0.5 rounded-full border ${
                          prof.overallRiskScore >= 80
                            ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                            : prof.overallRiskScore >= 60
                            ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {prof.overallRiskScore}% {prof.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                        {prof.primaryArchetype}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">
                      <div className="text-slate-900 dark:text-white font-semibold">
                        ₹{prof.totalInflow.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Turnover: {(prof.turnoverRatio * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 dark:text-slate-300">
                      {prof.averageHoldingTimeMinutes > 0 ? `${prof.averageHoldingTimeMinutes}m` : '<10m'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {prof.detectedPatterns.slice(0, 2).map((pat) => (
                          <span
                            key={pat.id}
                            className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                          >
                            {pat.title.split(' ')[0]}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedProfile(prof);
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

      {/* VIEW 3: SYNDICATE CLUSTERS */}
      {viewMode === 'clusters' && (
        <div className="space-y-4">
          {summary.syndicateClusters.map((cluster) => (
            <div
              key={cluster.clusterId}
              className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1322] shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 font-bold">
                      {cluster.clusterId}
                    </span>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white">{cluster.clusterName}</h3>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Operating Region: <strong className="text-slate-700 dark:text-slate-300">{cluster.primaryZone}</strong> • Central Consolidation Hub:{' '}
                    <strong className="text-blue-600 dark:text-blue-400">{cluster.centralHubAccountName} ({cluster.centralHubAccountId})</strong>
                  </p>
                </div>

                <div className="text-right">
                  <div className="font-mono text-lg font-bold text-slate-900 dark:text-white">
                    ₹{cluster.totalVolumeINR.toLocaleString('en-IN')}
                  </div>
                  <span className="text-[10px] text-slate-400">Total Syndicate Footprint</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Total Interlinked Accounts</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                    {cluster.totalAccountsCount} nodes
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Identified Mule Candidates</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                    {cluster.totalMuleAccountsCount} accounts
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Average Risk Score</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400 text-sm">
                    {cluster.averageRiskScore}%
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {cluster.identifiedPatterns.map((pat) => (
                    <span
                      key={pat}
                      className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium"
                    >
                      {pat.replace('_', ' ').toUpperCase()}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => onNavigateTab('network')}
                  className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-1"
                >
                  View Syndicate on Graph Analyzer <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slide-Over Investigation Drawer */}
      <MuleDetailDrawer
        profile={selectedProfile}
        onClose={() => setSelectedProfile(null)}
        onInitiateFreeze={handleInitiateFreeze}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  );
};
