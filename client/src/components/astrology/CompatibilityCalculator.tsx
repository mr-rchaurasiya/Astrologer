import React from 'react';
import { Heart, CheckCircle2, AlertTriangle } from 'lucide-react';

export interface CompatibilityData {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  grade: string;
  factors: Array<{
    name: string;
    maxScore: number;
    obtainedScore: number;
    description: string;
    status: 'excellent' | 'good' | 'average' | 'dosha';
  }>;
  mangalDosha: {
    profile1Manglik: boolean;
    profile2Manglik: boolean;
    isCancelled: boolean;
    summary: string;
  };
  recommendation: string;
}

interface CompatibilityCalculatorProps {
  compatibility: CompatibilityData;
}

export const CompatibilityCalculator: React.FC<CompatibilityCalculatorProps> = ({ compatibility }) => {
  if (!compatibility) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-950/40 via-purple-950/40 to-slate-900 border border-rose-500/20 rounded-xl p-5">
        <div>
          <span className="text-xs font-semibold text-rose-300 uppercase tracking-wider flex items-center gap-1.5 mb-1">
            <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
            Ashtakoota Guna Milan (36-Point Compatibility)
          </span>
          <h3 className="text-xl font-bold text-white">{compatibility.grade} Match</h3>
        </div>
        <div className="text-right flex items-center sm:flex-col sm:items-end gap-3 sm:gap-0">
          <div className="text-3xl font-extrabold font-mono text-amber-300">
            {compatibility.totalScore} <span className="text-lg text-slate-400 font-sans">/ 36</span>
          </div>
          <span className="text-xs text-emerald-400 font-semibold">
            {compatibility.percentage}% Compatibility
          </span>
        </div>
      </div>

      {/* Manglik (Kuja Dosha) Assessment */}
      <div className="bg-slate-950/60 border border-slate-800 rounded-lg p-4 flex items-start gap-3">
        {compatibility.mangalDosha.isCancelled ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        ) : (
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        )}
        <div className="text-xs">
          <h4 className="font-bold text-white mb-0.5">Kuja (Mangal) Dosha Evaluation</h4>
          <p className="text-slate-300">{compatibility.mangalDosha.summary}</p>
        </div>
      </div>

      {/* 8 Kootas Factor Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {compatibility.factors.map((factor) => (
          <div
            key={factor.name}
            className="bg-slate-950/40 border border-slate-800/80 rounded-lg p-3.5 flex items-center justify-between gap-2"
          >
            <div>
              <span className="text-xs font-bold text-slate-200 block">{factor.name}</span>
              <span className="text-[11px] text-slate-400">{factor.description}</span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-sm font-bold font-mono text-amber-300">
                {factor.obtainedScore} / {factor.maxScore}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Traditional Recommendation Note */}
      <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4 text-xs text-slate-300">
        <strong className="text-amber-300 block mb-1">Traditional Astrological Guidance:</strong>
        {compatibility.recommendation}
      </div>
    </div>
  );
};
