import React, { useState } from 'react';
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Clock,
  User,
  Building2,
  Coins,
  ArrowRightLeft,
  FileText,
  Lock,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Send,
  Check,
} from 'lucide-react';
import { EarlyWarningAlert, EarlyWarningStatus } from '../types';

interface EarlyWarningInspectionModalProps {
  alert: EarlyWarningAlert | null;
  onClose: () => void;
  onUpdateStatus: (alertId: string, status: EarlyWarningStatus, notes?: string) => void;
  onNavigateToCase?: (caseId: string) => void;
}

export const EarlyWarningInspectionModal: React.FC<EarlyWarningInspectionModalProps> = ({
  alert,
  onClose,
  onUpdateStatus,
  onNavigateToCase,
}) => {
  const [reviewNote, setReviewNote] = useState('');
  const [updating, setUpdating] = useState(false);

  if (!alert) return null;

  const handleStatusChange = (newStatus: EarlyWarningStatus) => {
    setUpdating(true);
    setTimeout(() => {
      onUpdateStatus(alert.alertId, newStatus, reviewNote);
      setUpdating(false);
      setReviewNote('');
    }, 400);
  };

  const getCategoryBadge = () => {
    switch (alert.category) {
      case 'RAPID_MONEY_MOVEMENT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300">Rapid Velocity Layering</span>;
      case 'POTENTIAL_MULE_ACCOUNT':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">Potential Mule Account</span>;
      case 'CRYPTO_FORENSICS_WARNING':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300">Crypto On-Chain Taint</span>;
      case 'POTENTIAL_CASHOUT_ACTIVITY':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300">ATM Cashout Imminent</span>;
      case 'SUSPICIOUS_NETWORK':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300">Syndicate Ring</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">Suspicious Transaction</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/50 dark:bg-slate-950/40">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-slate-400">{alert.alertId}</span>
              {getCategoryBadge()}
              <span
                className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                  alert.riskLevel === 'High'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                }`}
              >
                {alert.riskScore}% {alert.riskLevel} Risk
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {alert.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Prevention Principle Guarantee */}
          <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2.5">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="text-amber-900 dark:text-amber-300 space-y-0.5">
              <span className="font-bold block">Human-in-the-Loop Prevention Guarantee:</span>
              <p className="leading-relaxed opacity-90">
                FinTrace does not execute autonomous bank account freezes, transaction blocking, or police dispatches. Consequential legal actions require authorized human officer verification.
              </p>
            </div>
          </div>

          {/* Explainable Detection Reason */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Detection Reasoning & Explainability
            </span>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {alert.detectionReason}
            </p>
          </div>

          {/* Entity & Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Related Entity</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white truncate block">
                {alert.relatedEntity}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Entity Type</span>
              <span className="font-semibold text-slate-900 dark:text-white block">
                {alert.entityType}
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Model Confidence</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                {alert.confidenceScore}% (Uncertainty: {alert.uncertaintyLevel})
              </span>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg">
              <span className="text-slate-500 block text-[11px]">Current Status</span>
              <span className="font-bold text-purple-600 dark:text-purple-400 block">
                {alert.status}
              </span>
            </div>
          </div>

          {/* Supporting Evidence List */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Supporting Factual Evidence
            </span>
            <ul className="space-y-1.5">
              {alert.supportingEvidence.map((ev, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-md border border-slate-200 dark:border-slate-800 font-mono text-slate-700 dark:text-slate-300"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                  <span>{ev}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Action */}
          <div className="p-4 bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-xl space-y-1">
            <span className="font-bold text-purple-900 dark:text-purple-300 text-[11px] uppercase tracking-wider block">
              Recommended Law Enforcement Action
            </span>
            <p className="text-purple-950 dark:text-purple-200 text-xs">
              {alert.recommendedAction}
            </p>
          </div>

          {/* Audit History Log */}
          <div className="space-y-2">
            <span className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] block">
              Alert Audit History & Chain of Custody
            </span>
            <div className="divide-y divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-800 p-3">
              {alert.auditHistory.map(entry => (
                <div key={entry.auditId} className="py-2 text-[11px] flex items-start justify-between gap-4">
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {entry.action} by {entry.actorName} ({entry.actorRole})
                    </span>
                    <p className="text-slate-500 dark:text-slate-400 mt-0.5">{entry.notes}</p>
                  </div>
                  <span className="font-mono text-slate-400 text-[10px] whitespace-nowrap">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Review Action Form */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3">
            <span className="font-bold text-slate-900 dark:text-white text-[11px] uppercase tracking-wider block">
              Officer Action & Status Transition
            </span>
            <textarea
              value={reviewNote}
              onChange={e => setReviewNote(e.target.value)}
              placeholder="Enter investigative assessment notes before updating alert status..."
              rows={2}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-purple-500"
            />
            <div className="flex flex-wrap items-center gap-2">
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Acknowledged')}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all disabled:opacity-50"
              >
                Acknowledge Alert
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Under Review')}
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold transition-all disabled:opacity-50"
              >
                Mark Under Review
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Resolved')}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition-all disabled:opacity-50"
              >
                Resolve Alert
              </button>
              <button
                disabled={updating}
                onClick={() => handleStatusChange('Dismissed')}
                className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-300 font-semibold transition-all disabled:opacity-50"
              >
                Dismiss (False Positive)
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs">
          <span className="text-slate-500">Case Association: {alert.associatedCaseId || 'Unlinked'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
