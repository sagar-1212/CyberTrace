import React from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Clock,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  FileText,
  Lock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { SuspiciousAccountProfile } from '../types';

interface MuleScoreCardProps {
  profile: SuspiciousAccountProfile;
  isSelected?: boolean;
  onSelect?: () => void;
  onInitiateFreeze?: (accountRef: string, holderName?: string, bankName?: string) => void;
}

export const MuleScoreCard: React.FC<MuleScoreCardProps> = ({
  profile,
  isSelected,
  onSelect,
  onInitiateFreeze,
}) => {
  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Critical':
        return 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'High':
        return 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Medium':
        return 'text-yellow-600 dark:text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      default:
        return 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
    }
  };

  const getScoreBadgeBg = (score: number) => {
    if (score >= 80) return 'from-rose-500 to-red-600';
    if (score >= 60) return 'from-amber-500 to-orange-600';
    if (score >= 40) return 'from-yellow-500 to-amber-600';
    return 'from-emerald-500 to-teal-600';
  };

  return (
    <div
      onClick={onSelect}
      className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-500 shadow-md ring-1 ring-blue-500/30'
          : 'bg-white dark:bg-[#0c1322] border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Left: Account info & Archetype */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-mono text-sm font-semibold text-slate-900 dark:text-white">
              {profile.accountReference}
            </span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getRiskColor(
                profile.riskLevel
              )}`}
            >
              {profile.riskLevel} Risk
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {profile.primaryArchetype}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium truncate">
            {profile.holderName} • <span className="text-slate-500 dark:text-slate-400">{profile.bankName}</span>
          </p>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            KYC: <span className="font-medium text-slate-700 dark:text-slate-300">{profile.kycStatus}</span> • Branch: {profile.branch}
          </p>
        </div>

        {/* Right: Risk score gauge */}
        <div className="flex flex-col items-end flex-shrink-0">
          <div
            className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getScoreBadgeBg(
              profile.overallRiskScore
            )} text-white flex flex-col items-center justify-center shadow-sm`}
          >
            <span className="text-base font-bold leading-none">{profile.overallRiskScore}</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold opacity-80 leading-tight">Risk</span>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 mt-3 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-[11px]">
        <div>
          <span className="text-slate-400 block text-[10px]">Inflow</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
            ₹{profile.totalInflow.toLocaleString('en-IN')}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Turnover</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
            {(profile.turnoverRatio * 100).toFixed(0)}%
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Dwell Time</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
            {profile.averageHoldingTimeMinutes > 0 ? `${profile.averageHoldingTimeMinutes}m` : '<10m'}
          </span>
        </div>
        <div>
          <span className="text-slate-400 block text-[10px]">Hops</span>
          <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
            Tier {profile.layerIndex}
          </span>
        </div>
      </div>

      {/* Detected Pattern Badges */}
      {profile.detectedPatterns.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2">
          {profile.detectedPatterns.slice(0, 3).map((pat) => (
            <span
              key={pat.id}
              className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1"
            >
              <AlertTriangle className="w-2.5 h-2.5 flex-shrink-0" />
              {pat.title}
            </span>
          ))}
          {profile.detectedPatterns.length > 3 && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              +{profile.detectedPatterns.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Verification status footer */}
      <div className="flex items-center justify-between mt-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              profile.verificationStatus.includes('Confirmed')
                ? 'bg-rose-500'
                : profile.verificationStatus.includes('Review')
                ? 'bg-amber-500 animate-pulse'
                : 'bg-blue-400'
            }`}
          />
          {profile.verificationStatus}
        </span>

        <span className="text-blue-600 dark:text-blue-400 font-medium flex items-center gap-0.5 hover:underline">
          Investigate
          <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
