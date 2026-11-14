import React, { useState } from 'react';
import {
  Clock,
  Building2,
  Coins,
  ArrowRightLeft,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  FileText,
  Filter,
} from 'lucide-react';
import { UnifiedTimelineEvent, RailType } from '../types';

interface CrossRailTimelineProps {
  timeline: UnifiedTimelineEvent[];
  onSelectEvent: (event: UnifiedTimelineEvent) => void;
}

export const CrossRailTimeline: React.FC<CrossRailTimelineProps> = ({
  timeline,
  onSelectEvent,
}) => {
  const [filterRail, setFilterRail] = useState<'ALL' | RailType>('ALL');
  const [showSuspiciousOnly, setShowSuspiciousOnly] = useState(false);

  const filteredEvents = timeline.filter(event => {
    if (filterRail !== 'ALL' && event.railType !== filterRail) return false;
    if (showSuspiciousOnly && !event.isFlaggedOrSuspicious) return false;
    return true;
  });

  const getRailBadge = (railType: RailType) => {
    switch (railType) {
      case 'Banking':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Building2 className="w-3 h-3" /> Banking Rail
          </span>
        );
      case 'Cross-Rail Bridge':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <ArrowRightLeft className="w-3 h-3" /> Cross-Rail Bridge
          </span>
        );
      case 'Crypto':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Coins className="w-3 h-3" /> Bitcoin Blockchain
          </span>
        );
    }
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case 'Confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Confirmed
          </span>
        );
      case 'Probable':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
            <CheckCircle2 className="w-3 h-3 text-blue-600 dark:text-blue-400" /> Probable
          </span>
        );
      case 'Inferred':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-950/60 dark:text-yellow-300">
            <AlertTriangle className="w-3 h-3 text-yellow-600 dark:text-yellow-400" /> Inferred
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
            <HelpCircle className="w-3 h-3 text-rose-600 dark:text-rose-400" /> {confidence}
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Filter Rail:
          </span>
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs">
            {(['ALL', 'Banking', 'Cross-Rail Bridge', 'Crypto'] as const).map(rail => (
              <button
                key={rail}
                onClick={() => setFilterRail(rail)}
                className={`px-3 py-1 rounded-md font-medium transition-all ${
                  filterRail === rail
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                {rail === 'ALL' ? 'All Rails' : rail}
              </button>
            ))}
          </div>
        </div>

        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700 dark:text-slate-300">
          <input
            type="checkbox"
            checked={showSuspiciousOnly}
            onChange={e => setShowSuspiciousOnly(e.target.checked)}
            className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Show Flagged / Suspicious Only
        </label>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
        {filteredEvents.map(event => {
          const dt = new Date(event.timestamp);
          const formattedDate = dt.toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          });
          const formattedTime = dt.toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false,
          });

          return (
            <div
              key={event.eventId}
              onClick={() => onSelectEvent(event)}
              className="relative group cursor-pointer transition-all"
            >
              {/* Timeline Dot Indicator */}
              <div
                className={`absolute -left-6 top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-transform group-hover:scale-110 ${
                  event.railType === 'Banking'
                    ? 'bg-blue-500 border-white dark:border-slate-950 text-white'
                    : event.railType === 'Cross-Rail Bridge'
                    ? 'bg-purple-600 border-white dark:border-slate-950 text-white'
                    : 'bg-amber-500 border-white dark:border-slate-950 text-white'
                }`}
              >
                {event.railType === 'Banking' && <Building2 className="w-3 h-3" />}
                {event.railType === 'Cross-Rail Bridge' && <ArrowRightLeft className="w-3 h-3" />}
                {event.railType === 'Crypto' && <Coins className="w-3 h-3" />}
              </div>

              {/* Event Card */}
              <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs group-hover:border-blue-400 dark:group-hover:border-blue-600 transition-all">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {getRailBadge(event.railType)}
                    {getConfidenceBadge(event.confidence)}
                    {event.isFlaggedOrSuspicious && (
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300">
                        Flagged
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-mono text-slate-500 dark:text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{formattedDate} {formattedTime}</span>
                  </div>
                </div>

                <div className="flex items-baseline justify-between gap-4">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                    {event.eventTitle}
                  </h4>
                  <span className="font-mono font-bold text-sm text-slate-900 dark:text-slate-100 whitespace-nowrap">
                    {event.amountFormatted}
                  </span>
                </div>

                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
                  {event.description}
                </p>

                <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
                  <span className="flex items-center gap-1">
                    <span className="font-medium text-slate-700 dark:text-slate-300">Source:</span> {event.sourceSystem}
                  </span>
                  {event.evidenceReference && (
                    <span className="flex items-center gap-1 font-mono text-slate-600 dark:text-slate-400">
                      <FileText className="w-3 h-3 text-slate-400" /> Ref: {event.evidenceReference}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
