import React from 'react';
import {
  X,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Shield,
  Layers,
  BarChart3,
  Check,
} from 'lucide-react';
import { ModelBenchmarkMetrics } from '../types';

interface ModelBenchmarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  models: ModelBenchmarkMetrics[];
  leakageProtection: string;
  scientificDisclaimer: string;
}

export const ModelBenchmarkModal: React.FC<ModelBenchmarkModalProps> = ({
  isOpen,
  onClose,
  models,
  leakageProtection,
  scientificDisclaimer,
}) => {
  if (!isOpen) return null;

  const productionModel = models.find((m) => m.model_name.includes('Production') || m.model_name.includes('Hybrid')) || models[models.length - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0c1322] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-[#090f1d]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Elliptic ML Classification Benchmark
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Rigorous Out-of-Time Chronological Walk-Forward Benchmark (Time Steps 35–49)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Scientific Disclaimer */}
          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-900 dark:text-amber-300 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
              Scientific Non-Claim Notice
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              {scientificDisclaimer}
            </p>
          </div>

          {/* Leakage Protection Protocol */}
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 space-y-1 text-slate-700 dark:text-slate-300">
            <h4 className="font-bold text-blue-900 dark:text-blue-300 text-xs flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-blue-500" />
              Data Leakage Prevention Protocol
            </h4>
            <p className="text-[11px] leading-relaxed">
              {leakageProtection} Models are trained on early history (timesteps 1 to 34) and evaluated strictly on future out-of-time transactions (timesteps 35 to 49). Random cross-validation is explicitly forbidden to prevent temporal look-ahead data leakage.
            </p>
          </div>

          {/* Model Comparison Table */}
          <div>
            <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
              Comparative Model Benchmarks
            </h4>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-[#070b14] border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold text-[10px] uppercase">
                  <tr>
                    <th className="px-3.5 py-2.5">Algorithm Architecture</th>
                    <th className="px-3.5 py-2.5">Precision</th>
                    <th className="px-3.5 py-2.5">Recall</th>
                    <th className="px-3.5 py-2.5">F1 (Illicit)</th>
                    <th className="px-3.5 py-2.5">ROC-AUC</th>
                    <th className="px-3.5 py-2.5">PR-AUC</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {models.map((m, idx) => {
                    const isProd = m.model_name === productionModel?.model_name;
                    return (
                      <tr
                        key={idx}
                        className={isProd ? 'bg-blue-50/50 dark:bg-blue-950/20 font-bold text-blue-900 dark:text-blue-300' : 'text-slate-700 dark:text-slate-300'}
                      >
                        <td className="px-3.5 py-2.5 font-sans font-medium flex items-center gap-1.5">
                          {isProd && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />}
                          {m.model_name}
                        </td>
                        <td className="px-3.5 py-2.5">{m.precision.toFixed(3)}</td>
                        <td className="px-3.5 py-2.5">{m.recall.toFixed(3)}</td>
                        <td className="px-3.5 py-2.5 text-rose-600 dark:text-rose-400">{m.f1_score.toFixed(3)}</td>
                        <td className="px-3.5 py-2.5">{m.roc_auc.toFixed(3)}</td>
                        <td className="px-3.5 py-2.5 text-emerald-600 dark:text-emerald-400">{m.pr_auc.toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Confusion Matrix (Production Model) */}
          {productionModel && (
            <div>
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-2.5">
                Confusion Matrix: {productionModel.model_name} (13,060 Test Txns)
              </h4>
              <div className="grid grid-cols-2 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">True Positives (TP)</span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    {productionModel.confusion_matrix.true_positives.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">Correctly caught illicit</p>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">False Positives (FP)</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    {productionModel.confusion_matrix.false_positives.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">Licit incorrectly flagged</p>
                </div>

                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">False Negatives (FN)</span>
                  <span className="text-xl font-bold text-rose-600 dark:text-rose-400">
                    {productionModel.confusion_matrix.false_negatives.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">Missed illicit transfers</p>
                </div>

                <div className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/5">
                  <span className="text-[10px] text-slate-400 uppercase block font-sans">True Negatives (TN)</span>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {productionModel.confusion_matrix.true_negatives.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">Correctly identified licit</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0b1222] flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors"
          >
            Close Benchmark
          </button>
        </div>
      </div>
    </div>
  );
};

