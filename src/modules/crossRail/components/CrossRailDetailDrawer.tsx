import React from 'react';
import {
  X,
  Building2,
  Coins,
  ArrowRightLeft,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Lock,
  ExternalLink,
  HelpCircle,
  Copy,
  Check,
  Send,
} from 'lucide-react';
import {
  CrossRailPathwayCase,
  BankingAccountEntity,
  CryptoWalletEntity,
  CrossRailBridgeLink,
  IncompletePathwaySegment,
} from '../types';

interface CrossRailDetailDrawerProps {
  selectedEntity: {
    id: string;
    type: 'BANK_ACCOUNT' | 'CRYPTO_WALLET' | 'BRIDGE' | 'GAP';
  } | null;
  crossRailCase: CrossRailPathwayCase;
  onClose: () => void;
}

export const CrossRailDetailDrawer: React.FC<CrossRailDetailDrawerProps> = ({
  selectedEntity,
  crossRailCase,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!selectedEntity) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const renderContent = () => {
    switch (selectedEntity.type) {
      case 'BANK_ACCOUNT': {
        const account = crossRailCase.bankingAccounts.find(a => a.accountId === selectedEntity.id);
        if (!account) return <p className="text-slate-500">Account not found.</p>;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                <Building2 className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {account.holderName}
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {account.accountReference} ({account.bankName})
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Account Role</span>
                <span className="font-semibold text-slate-900 dark:text-white">{account.accountType}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">KYC Status</span>
                <span className="font-semibold text-slate-900 dark:text-white">{account.kycStatus}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Branch City</span>
                <span className="font-semibold text-slate-900 dark:text-white">{account.branchCity}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Total Inflow</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  ₹{account.totalInflowINR.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-blue-900 dark:text-blue-300">Banking Rail Isolation Notice:</span>
              <p className="text-blue-800/80 dark:text-blue-300/80">
                Entity strictly maintained within Core Banking System (CBS) registers. Account records remain segregated from blockchain addresses.
              </p>
            </div>
          </div>
        );
      }

      case 'CRYPTO_WALLET': {
        const wallet = crossRailCase.cryptoWallets.find(w => w.walletId === selectedEntity.id);
        if (!wallet) return <p className="text-slate-500">Wallet not found.</p>;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                <Coins className="w-5 h-5" />
              </span>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  {wallet.knownEntityTag || 'Bitcoin Entity'}
                </h3>
                <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {wallet.blockchain} ({wallet.clusterLabel})
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
              <span className="text-slate-500 block mb-1">On-Chain Identifier / Hash:</span>
              <div className="flex items-center justify-between gap-2 font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700">
                <span className="truncate">{wallet.addressOrClusterId}</span>
                <button
                  onClick={() => handleCopy(wallet.addressOrClusterId)}
                  className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-500"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">In-Degree / Out-Degree</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {wallet.inDegree} in / {wallet.outDegree} out
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800">
                <span className="text-slate-500 block">Estimated Volume</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {wallet.estimatedVolumeBtc} BTC
                </span>
              </div>
            </div>

            {wallet.researchDatasetId && (
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <span className="text-slate-500 block">Elliptic Research Node Mapping:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">
                  Tx ID #{wallet.researchDatasetId}
                </span>
              </div>
            )}
          </div>
        );
      }

      case 'GAP': {
        const gap = crossRailCase.incompleteSegments.find(g => g.gapId === selectedEntity.id);
        if (!gap) return <p className="text-slate-500">Pathway gap not found.</p>;

        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </span>
              <div>
                <h3 className="font-bold text-base text-rose-900 dark:text-rose-300">
                  {gap.gapType}
                </h3>
                <span className="text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                  {gap.status}
                </span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs space-y-2">
              <span className="font-semibold text-rose-900 dark:text-rose-200 block">
                Missing Evidentiary Proof:
              </span>
              <p className="text-rose-800/90 dark:text-rose-300">
                {gap.missingEvidenceDescription}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs space-y-2">
              <span className="font-semibold text-slate-900 dark:text-white block">
                Recommended Law Enforcement Action:
              </span>
              <p className="text-slate-600 dark:text-slate-400">
                {gap.recommendedAction}
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
              <span className="text-slate-500">Estimated Funds at Risk:</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">
                ₹{gap.estimatedFundsAtRiskINR.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-96 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-all">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Investigative Inspection
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 p-5 overflow-y-auto">
        {renderContent()}
      </div>

      {/* Drawer Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 flex items-center justify-between text-xs text-slate-500">
        <span>FinTrace Case: {crossRailCase.complaintNumber}</span>
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium hover:bg-slate-300"
        >
          Close Drawer
        </button>
      </div>
    </div>
  );
};
