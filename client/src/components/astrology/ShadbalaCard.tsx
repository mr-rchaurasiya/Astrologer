import React from 'react';
import { Activity } from 'lucide-react';

export interface ShadbalaData {
  scores: Record<
    string,
    {
      sthanaBala: number;
      digBala: number;
      kalaBala: number;
      cheshtaBala: number;
      naisargikaBala: number;
      drikBala: number;
      totalVirupas: number;
      totalRupas: number;
      requiredRupas: number;
      relativeStrengthRatio: number;
      rank: number;
    }
  >;
  strongestPlanet: string;
  weakestPlanet: string;
}

interface ShadbalaCardProps {
  shadbala: ShadbalaData;
}

export const ShadbalaCard: React.FC<ShadbalaCardProps> = ({ shadbala }) => {
  if (!shadbala || !shadbala.scores) return null;

  const planets = Object.keys(shadbala.scores).sort(
    (a, b) => shadbala.scores[a].rank - shadbala.scores[b].rank
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            Shadbala (Six-Fold Planetary Strength)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Quantified planetary potency according to classical Brihat Parashara Hora Shastra
          </p>
        </div>
        <div className="text-right">
          <span className="text-xs bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full">
            Rank #1: <strong className="text-white">{shadbala.strongestPlanet}</strong>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {planets.map((planet) => {
          const s = shadbala.scores[planet];
          const isPotent = s.relativeStrengthRatio >= 1.0;

          return (
            <div
              key={planet}
              className="bg-slate-950/60 border border-slate-800/80 rounded-lg p-4 space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center">
                    #{s.rank}
                  </span>
                  <span className="font-bold text-white text-sm">{planet}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-amber-300">
                    {s.totalRupas} Rupas
                  </span>
                  <span className="text-[10px] text-slate-400 ml-1.5">
                    ({s.totalVirupas} Virupas)
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isPotent ? 'bg-gradient-to-r from-indigo-500 to-emerald-400' : 'bg-amber-500'
                  }`}
                  style={{ width: `${Math.min(100, s.relativeStrengthRatio * 75)}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Required: {s.requiredRupas} Rupas</span>
                <span className={isPotent ? 'text-emerald-400 font-semibold' : 'text-amber-400'}>
                  Ratio: {(s.relativeStrengthRatio * 100).toFixed(0)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
