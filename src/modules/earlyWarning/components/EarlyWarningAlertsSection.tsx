import React, { useState } from 'react';
import {
  ShieldAlert,
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
  Filter,
  Search,
} from 'lucide-react';
import { EarlyWarningAlert, EarlyWarningStatus, EarlyWarningCategory } from '../types';
import { EarlyWarningInspectionModal } from './EarlyWarningInspectionModal';

interface EarlyWarningAlertsSectionProps {
  alerts: EarlyWarningAlert[];
  onUpdateAlertStatus: (alertId: string, status: EarlyWarningStatus, notes?: string) => void;
  onNavigateTab?: (tab: any) => void;
}

export const EarlyWarningAlertsSection: React.FC<EarlyWarningAlertsSectionProps> = ({
  alerts,
  onUpdateAlertStatus,
  onNavigateTab,
}) => {
  const [selectedAlert, setSelectedAlert] = useState<EarlyWarningAlert | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredAlerts = alerts.filter(a => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (categoryFilter !== 'ALL' && a.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        a.title.toLowerCase().includes(q) ||
        a.relatedEntity.toLowerCase().includes(q) ||
        a.alertId.toLowerCase().includes(q) ||
        a.detectionReason.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = alerts.filter(a => a.riskLevel === 'High' && (a.status === 'New' || a.status === 'Under Review')).length;

  return (
    <div className="space-y-5">
      {/* Human-in-the-Loop Prevention Banner */}
      <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl flex items-start gap-3">
        <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <span className="font-bold text-purple-900 dark:text-purple-300 block">
            PREVENTION PRINCIPLE GUARANTEE (HUMAN AUTHORIZATION REQUIRED)
          </span>
          <p className="text-purple-800/90 dark:text-purple-300/90 leading-relaxed">
            The Early Warning System monitors newly ingested transactions, mule candidates, on-chain crypto taint, and physical cashout kiosks to provide proactive intelligence. <strong>FinTrace does not automatically freeze bank accounts, block transactions, contact institutions, or dispatch police units.</strong> All consequential interventions require authorized human officer verification.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-2 flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search warnings by entity, title, or ID..."
            className="w-full text-xs bg-transparent border-none focus:outline-hidden text-slate-900 dark:text-slate-100 placeholder-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap text-xs">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="New">New</option>
            <option value="Acknowledged">Acknowledged</option>
            <option value="Under Review">Under Review</option>
            <option value="Resolved">Resolved</option>
            <option value="Dismissed">Dismissed</option>
          </select>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium"
          >
            <option value="ALL">All Warning Types</option>
            <option value="RAPID_MONEY_MOVEMENT">Rapid Velocity Movement</option>
            <option value="POTENTIAL_MULE_ACCOUNT">Potential Mule Account</option>
            <option value="CRYPTO_FORENSICS_WARNING">Crypto On-Chain Taint</option>
            <option value="POTENTIAL_CASHOUT_ACTIVITY">ATM Cashout Imminent</option>
            <option value="SUSPICIOUS_NETWORK">Suspicious Network Ring</option>
          </select>
        </div>
      </div>

      {/* Warnings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredAlerts.map(alert => {
          const isHigh = alert.riskLevel === 'High';
          return (
            <div
              key={alert.alertId}
              onClick={() => setSelectedAlert(alert)}
              className={`p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 shadow-xs transition-all flex flex-col justify-between space-y-4 cursor-pointer hover:border-purple-400 dark:hover:border-purple-600 ${
                alert.status === 'New'
                  ? 'border-rose-400 dark:border-rose-700/80 bg-rose-50/10 dark:bg-rose-950/20'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full uppercase ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                      }`}
                    >
                      {alert.riskScore}% {alert.riskLevel} Risk
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">{alert.alertId}</span>
                  </div>

                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      alert.status === 'New'
                        ? 'bg-rose-600 text-white animate-pulse'
                        : alert.status === 'Under Review'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300'
                        : alert.status === 'Acknowledged'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300'
                    }`}
                  >
                    {alert.status}
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                  {alert.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">
                  {alert.detectionReason}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                    <span className="font-medium text-slate-500">Entity:</span>
                    <span className="font-mono truncate">{alert.relatedEntity}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-500">Confidence:</span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{alert.confidenceScore}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[11px] font-medium text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  Inspect Supporting Evidence <ChevronRight className="w-3.5 h-3.5" />
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(alert.detectionTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Inspection Modal */}
      <EarlyWarningInspectionModal
        alert={selectedAlert}
        onClose={() => setSelectedAlert(null)}
        onUpdateStatus={(id, status, notes) => {
          onUpdateAlertStatus(id, status, notes);
          if (selectedAlert && selectedAlert.alertId === id) {
            setSelectedAlert({
              ...selectedAlert,
              status,
              auditHistory: [
                {
                  auditId: `AUD-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  action: 'Status Changed',
                  actorName: 'Investigator',
                  actorRole: 'Reviewing Officer',
                  notes: notes || `Status changed to ${status}`,
                },
                ...selectedAlert.auditHistory,
              ],
            });
          }
        }}
      />
    </div>
  );
};
