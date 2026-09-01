import React from 'react';
import { ShieldCheck, Compass, Sparkles } from 'lucide-react';

interface AIContextIndicatorProps {
  intent?: string;
  groundingScore?: number;
  confidence?: string;
  activeDasha?: string;
  divisionalCharts?: string[];
}

export const AIContextIndicator: React.FC<AIContextIndicatorProps> = ({
  intent = 'GENERAL',
  groundingScore = 1.0,
  confidence = 'HIGH',
  activeDasha,
  divisionalCharts = ['D1', 'D9'],
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 font-semibold text-amber-300">
          <Compass className="w-3.5 h-3.5 text-amber-400" />
          Intent: <span className="text-white font-mono uppercase">{intent}</span>
        </span>

        {activeDasha && (
          <span className="hidden sm:inline-flex items-center gap-1 bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
            Dasha: <strong className="text-amber-300">{activeDasha}</strong>
          </span>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Vargas:</span>
          <span className="font-mono text-slate-200">{divisionalCharts.join(', ')}</span>
        </div>

        <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded-full font-medium">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          Fact Grounding: {(groundingScore * 100).toFixed(0)}% ({confidence})
        </span>
      </div>
    </div>
  );
};
