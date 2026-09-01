import React from 'react';
import { Sparkles } from 'lucide-react';

export interface YogaItem {
  yogaId: string;
  name: string;
  category: string;
  strength: string;
  conditions: string[];
  explanation: string;
  supportingPlanets: string[];
  supportingHouses: number[];
}

interface YogaListProps {
  yogas: YogaItem[];
}

export const YogaList: React.FC<YogaListProps> = ({ yogas }) => {
  if (!yogas || yogas.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 text-center text-slate-400">
        No prominent classical Yogas detected in the current chart configuration.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-amber-300 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-400" />
          Classical Vedic Yogas ({yogas.length} Detected)
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {yogas.map((yoga) => (
          <div
            key={yoga.yogaId}
            className="bg-slate-900/90 border border-amber-500/20 rounded-xl p-5 hover:border-amber-500/40 transition-colors shadow-lg"
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  {yoga.category}
                </span>
                <h4 className="text-base font-bold text-white mt-1.5">{yoga.name}</h4>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  yoga.strength === 'High'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                }`}
              >
                {yoga.strength} Strength
              </span>
            </div>

            <p className="text-sm text-slate-300 mb-3">{yoga.explanation}</p>

            <div className="border-t border-slate-800/80 pt-3 text-xs text-slate-400 space-y-1">
              <div>
                <span className="font-semibold text-slate-300">Planets:</span>{' '}
                {yoga.supportingPlanets.join(', ')}
              </div>
              <div>
                <span className="font-semibold text-slate-300">Houses:</span>{' '}
                {yoga.supportingHouses.map((h) => `H${h}`).join(', ')}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
