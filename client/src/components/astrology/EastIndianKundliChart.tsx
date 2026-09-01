import React from 'react';
import { DivisionalChart, PlanetPosition, PlanetName } from '../../types';

interface EastIndianKundliChartProps {
  chart: DivisionalChart;
  planetsInfo?: PlanetPosition[];
  selectedPlanet?: PlanetName | null;
  selectedHouse?: number | null;
  onSelectPlanet?: (planetName: PlanetName) => void;
  onSelectHouse?: (houseNumber: number) => void;
}

const PLANET_ABBREVIATIONS: Record<string, string> = {
  Ascendant: 'Asc',
  Sun: 'Su',
  Moon: 'Mo',
  Mars: 'Ma',
  Mercury: 'Me',
  Jupiter: 'Ju',
  Venus: 'Ve',
  Saturn: 'Sa',
  Rahu: 'Ra',
  Ketu: 'Ke',
};

// East Indian fixed sign compartment centroids (400x400)
// Aries is top-center, proceeding counter-clockwise:
// 1: Top Center, 2: Top-Left Diamond, 3: Left-Top, 4: Left Center, 5: Left-Bottom, 6: Bottom-Left Diamond,
// 7: Bottom Center, 8: Bottom-Right Diamond, 9: Right-Bottom, 10: Right Center, 11: Right-Top, 12: Top-Right Diamond
const EAST_SIGN_CENTROIDS: Record<number, { cx: number; cy: number; labelX: number; labelY: number }> = {
  1: { cx: 200, cy: 90, labelX: 200, labelY: 45 },    // Aries (Top Center)
  2: { cx: 100, cy: 90, labelX: 70, labelY: 60 },     // Taurus
  3: { cx: 90, cy: 150, labelX: 50, labelY: 135 },    // Gemini
  4: { cx: 90, cy: 200, labelX: 45, labelY: 200 },    // Cancer (Left Center)
  5: { cx: 90, cy: 260, labelX: 50, labelY: 275 },    // Leo
  6: { cx: 100, cy: 310, labelX: 70, labelY: 345 },   // Virgo
  7: { cx: 200, cy: 310, labelX: 200, labelY: 360 },  // Libra (Bottom Center)
  8: { cx: 300, cy: 310, labelX: 330, labelY: 345 },  // Scorpio
  9: { cx: 310, cy: 260, labelX: 350, labelY: 275 },  // Sagittarius
  10: { cx: 310, cy: 200, labelX: 355, labelY: 200 }, // Capricorn (Right Center)
  11: { cx: 310, cy: 150, labelX: 350, labelY: 135 }, // Aquarius
  12: { cx: 300, cy: 90, labelX: 330, labelY: 60 },   // Pisces
};

export const EastIndianKundliChart: React.FC<EastIndianKundliChartProps> = ({
  chart,
  planetsInfo = [],
  selectedPlanet,
  selectedHouse,
  onSelectPlanet,
  onSelectHouse,
}) => {
  const signOccupants: Record<number, { name: string; isRetro?: boolean; isCombust?: boolean }[]> = {};
  const signToHouse: Record<number, number> = {};

  for (let s = 1; s <= 12; s++) {
    signOccupants[s] = [];
    const houseNum = (((s - chart.ascendantSignNumber + 12) % 12) + 1);
    signToHouse[s] = houseNum;
  }

  chart.placements.forEach((p) => {
    const pInfo = planetsInfo.find((pi) => pi.name === p.planet);
    if (p.signNumber >= 1 && p.signNumber <= 12) {
      signOccupants[p.signNumber].push({
        name: p.planet,
        isRetro: pInfo?.retrograde,
        isCombust: pInfo?.combust,
      });
    }
  });

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '440px',
        margin: '0 auto',
        userSelect: 'none',
      }}
    >
      <svg
        viewBox="0 0 400 400"
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: 'rgba(7, 9, 14, 0.95)',
          borderRadius: '12px',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
        }}
      >
        <defs>
          <radialGradient id="eastGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200, 157, 60, 0.08)" />
            <stop offset="100%" stopColor="rgba(7, 9, 14, 0.95)" />
          </radialGradient>
        </defs>

        {/* Outer Frame */}
        <rect x="10" y="10" width="380" height="380" fill="url(#eastGlow)" stroke="#3B2E1E" strokeWidth="2" />

        {/* Diagonal X Lines */}
        <line x1="10" y1="10" x2="390" y2="390" stroke="#3B2E1E" strokeWidth="1.5" />
        <line x1="10" y1="390" x2="390" y2="10" stroke="#3B2E1E" strokeWidth="1.5" />

        {/* Inner Diamond Lines */}
        <line x1="200" y1="10" x2="10" y2="200" stroke="#3B2E1E" strokeWidth="1.5" />
        <line x1="10" y1="200" x2="200" y2="390" stroke="#3B2E1E" strokeWidth="1.5" />
        <line x1="200" y1="390" x2="390" y2="200" stroke="#3B2E1E" strokeWidth="1.5" />
        <line x1="390" y1="200" x2="200" y2="10" stroke="#3B2E1E" strokeWidth="1.5" />

        {/* Inner Cross Lines for East Indian Division */}
        <line x1="105" y1="105" x2="295" y2="105" stroke="#3B2E1E" strokeWidth="1.2" />
        <line x1="105" y1="295" x2="295" y2="295" stroke="#3B2E1E" strokeWidth="1.2" />
        <line x1="105" y1="105" x2="105" y2="295" stroke="#3B2E1E" strokeWidth="1.2" />
        <line x1="295" y1="105" x2="295" y2="295" stroke="#3B2E1E" strokeWidth="1.2" />

        {/* Center Label */}
        <text
          x="200"
          y="195"
          fill="var(--gold-primary)"
          fontSize="17"
          fontWeight="bold"
          textAnchor="middle"
          fontFamily="Cinzel, serif"
        >
          {chart.name}
        </text>
        <text
          x="200"
          y="215"
          fill="var(--text-muted)"
          fontSize="10"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          letterSpacing="1px"
        >
          EAST INDIAN
        </text>

        {/* Sign Compartments */}
        {Object.entries(EAST_SIGN_CENTROIDS).map(([signStr, coords]) => {
          const signNum = parseInt(signStr, 10);
          const houseNum = signToHouse[signNum];
          const isLagna = signNum === chart.ascendantSignNumber;
          const isSelectedH = selectedHouse === houseNum;
          const occupants = signOccupants[signNum] || [];

          return (
            <g
              key={signNum}
              onClick={() => onSelectHouse && onSelectHouse(houseNum)}
              style={{ cursor: 'pointer' }}
            >
              {/* Highlight Circle / Indicator */}
              {isSelectedH && (
                <circle
                  cx={coords.cx}
                  cy={coords.cy}
                  r="28"
                  fill="rgba(200, 157, 60, 0.2)"
                  stroke="var(--gold-primary)"
                  strokeWidth="1.5"
                />
              )}

              {/* Sign label */}
              <text
                x={coords.labelX}
                y={coords.labelY}
                fill={isLagna ? '#FCD34D' : '#6B7280'}
                fontSize="10"
                fontWeight="700"
                textAnchor="middle"
                fontFamily="Cinzel, serif"
              >
                {isLagna ? `Asc (H${houseNum})` : `H${houseNum}`}
              </text>

              {/* Occupants */}
              <g transform={`translate(${coords.cx - 20}, ${coords.cy - 10})`}>
                {occupants.map((occ, idx) => {
                  const isSelected = selectedPlanet === occ.name;
                  const xOffset = (idx % 2) * 26;
                  const yOffset = Math.floor(idx / 2) * 14;

                  return (
                    <text
                      key={occ.name}
                      x={xOffset}
                      y={yOffset}
                      fill={
                        isSelected
                          ? '#FCD34D'
                          : occ.name === 'Ascendant'
                          ? '#E5E7EB'
                          : occ.isRetro
                          ? '#F87171'
                          : occ.isCombust
                          ? '#FBBF24'
                          : '#E2E8F0'
                      }
                      fontSize="10"
                      fontWeight={isSelected || occ.name === 'Ascendant' ? 'bold' : 'normal'}
                      fontFamily="Inter, sans-serif"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onSelectPlanet && occ.name !== 'Ascendant') {
                          onSelectPlanet(occ.name as PlanetName);
                        }
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {PLANET_ABBREVIATIONS[occ.name] || occ.name.slice(0, 2)}
                      {occ.isRetro ? '*' : ''}
                    </text>
                  );
                })}
              </g>
            </g>
          );
        })}
      </svg>
    </div>
  );
};
