import React from 'react';
import { Grid } from 'lucide-react';

export interface AshtakavargaData {
  bhinnashtakavarga: Array<{
    planet: string;
    bindus: number[];
    totalBindus: number;
  }>;
  sarvashtakavarga: number[];
  houseBindus: number[];
  totalSavBindus: number;
}

interface AshtakavargaTableProps {
  ashtakavarga: AshtakavargaData;
}

const SIGNS = [
  'Aries', 'Taurus', 'Gemini', 'Cancer',
  'Leo', 'Virgo', 'Libra', 'Scorpio',
  'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces',
];

export const AshtakavargaTable: React.FC<AshtakavargaTableProps> = ({ ashtakavarga }) => {
  if (!ashtakavarga || !ashtakavarga.sarvashtakavarga) return null;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Grid className="w-5 h-5 text-emerald-400" />
            Ashtakavarga (BAV & SAV System)
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Total Sarvashtakavarga: <strong className="text-emerald-300 font-mono">337 Bindus</strong>
          </p>
        </div>
      </div>

      {/* SAV House Bindu Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
        {ashtakavarga.houseBindus.map((bindus, idx) => {
          const isAuspicious = bindus >= 30;
          const isVulnerable = bindus < 25;

          return (
            <div
              key={idx}
              className={`p-3 rounded-lg border text-center transition-all ${
                isAuspicious
                  ? 'bg-emerald-950/40 border-emerald-500/30'
                  : isVulnerable
                  ? 'bg-rose-950/40 border-rose-500/30'
                  : 'bg-slate-950/60 border-slate-800'
              }`}
            >
              <span className="text-[11px] font-semibold text-slate-400 block">
                House {idx + 1}
              </span>
              <span
                className={`text-base font-bold font-mono ${
                  isAuspicious
                    ? 'text-emerald-400'
                    : isVulnerable
                    ? 'text-rose-400'
                    : 'text-amber-300'
                }`}
              >
                {bindus}
              </span>
              <span className="text-[10px] text-slate-500 block">bindus</span>
            </div>
          );
        })}
      </div>

      {/* BAV Planetary Matrix Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/50">
              <th className="p-2.5 font-semibold">Planet</th>
              {SIGNS.map((s) => (
                <th key={s} className="p-2 text-center font-semibold">
                  {s.slice(0, 3)}
                </th>
              ))}
              <th className="p-2.5 text-center font-bold text-amber-300">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {ashtakavarga.bhinnashtakavarga.map((row) => (
              <tr key={row.planet} className="hover:bg-slate-800/30">
                <td className="p-2.5 font-sans font-bold text-white">{row.planet}</td>
                {row.bindus.map((b, i) => (
                  <td
                    key={i}
                    className={`p-2 text-center ${
                      b >= 5 ? 'text-emerald-400 font-bold' : b <= 2 ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    {b}
                  </td>
                ))}
                <td className="p-2.5 text-center font-bold text-amber-400 bg-amber-500/5">
                  {row.totalBindus}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
