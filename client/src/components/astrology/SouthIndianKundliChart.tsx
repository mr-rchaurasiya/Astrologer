import React from 'react';
import { DivisionalChart, PlanetPosition, PlanetName } from '../../types';

interface SouthIndianKundliChartProps {
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

const ZODIAC_NAMES: Record<number, string> = {
  1: 'Aries',
  2: 'Taurus',
  3: 'Gemini',
  4: 'Cancer',
  5: 'Leo',
  6: 'Virgo',
  7: 'Libra',
  8: 'Scorpio',
  9: 'Sagittarius',
  10: 'Capricorn',
  11: 'Aquarius',
  12: 'Pisces',
};

// South Indian 4x4 Grid Fixed Sign Coordinates (x, y in 400x400 viewBox)
// 100x100 cells
const SIGN_GRID_COORDINATES: Record<number, { x: number; y: number; width: number; height: number }> = {
  12: { x: 0, y: 0, width: 100, height: 100 },      // Pisces (Top-left)
  1: { x: 100, y: 0, width: 100, height: 100 },     // Aries
  2: { x: 200, y: 0, width: 100, height: 100 },     // Taurus
  3: { x: 300, y: 0, width: 100, height: 100 },     // Gemini (Top-right)
  4: { x: 300, y: 100, width: 100, height: 100 },   // Cancer
  5: { x: 300, y: 200, width: 100, height: 100 },   // Leo
  6: { x: 300, y: 300, width: 100, height: 100 },   // Virgo (Bottom-right)
  7: { x: 200, y: 300, width: 100, height: 100 },   // Libra
  8: { x: 100, y: 300, width: 100, height: 100 },   // Scorpio
  9: { x: 0, y: 300, width: 100, height: 100 },     // Sagittarius (Bottom-left)
  10: { x: 0, y: 200, width: 100, height: 100 },    // Capricorn
  11: { x: 0, y: 100, width: 100, height: 100 },    // Aquarius
};

export const SouthIndianKundliChart: React.FC<SouthIndianKundliChartProps> = ({
  chart,
  planetsInfo = [],
  selectedPlanet,
  selectedHouse,
  onSelectPlanet,
  onSelectHouse,
}) => {
  // Map sign number (1..12) to list of planets
  const signOccupants: Record<number, { name: string; isRetro?: boolean; isCombust?: boolean }[]> = {};
  // Map sign number to house number
  const signToHouse: Record<number, number> = {};

  for (let s = 1; s <= 12; s++) {
    signOccupants[s] = [];
    // House number calculation: (sign - ascendantSign + 12) % 12 + 1
    const houseNum = (((s - chart.ascendantSignNumber + 12) % 12) + 1);
    signToHouse[s] = houseNum;
  }

  // Populate occupants
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
          <radialGradient id="southCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(200, 157, 60, 0.12)" />
            <stop offset="100%" stopColor="rgba(7, 9, 14, 0.95)" />
          </radialGradient>
        </defs>

        {/* Central 2x2 Empty Space */}
        <rect x="100" y="100" width="200" height="200" fill="url(#southCenterGlow)" stroke="#3B2E1E" strokeWidth="1.5" />
        <text
          x="200"
          y="190"
          fill="var(--gold-primary)"
          fontSize="18"
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
          fontSize="11"
          textAnchor="middle"
          fontFamily="Inter, sans-serif"
          letterSpacing="1px"
        >
          SOUTH INDIAN
        </text>

        {/* 12 Outer Perimeter Sign Boxes */}
        {Object.entries(SIGN_GRID_COORDINATES).map(([signStr, coords]) => {
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
              <rect
                x={coords.x}
                y={coords.y}
                width={coords.width}
                height={coords.height}
                fill={
                  isSelectedH
                    ? 'rgba(200, 157, 60, 0.25)'
                    : isLagna
                    ? 'rgba(200, 157, 60, 0.10)'
                    : 'rgba(13, 17, 24, 0.6)'
                }
                stroke={isSelectedH ? 'var(--gold-primary)' : '#3B2E1E'}
                strokeWidth={isSelectedH ? 2 : 1}
              />

              {/* Sign Label (e.g. Ar, Ta, Ge) & House Number */}
              <text
                x={coords.x + 8}
                y={coords.y + 16}
                fill="#C89D3C"
                fontSize="10"
                fontWeight="700"
                fontFamily="Cinzel, serif"
                opacity={0.8}
              >
                {ZODIAC_NAMES[signNum]?.slice(0, 3)}
              </text>

              <text
                x={coords.x + coords.width - 8}
                y={coords.y + 16}
                fill="#6B7280"
                fontSize="10"
                fontWeight="600"
                textAnchor="end"
                fontFamily="Inter, sans-serif"
              >
                H{houseNum}
              </text>

              {/* Lagna indicator line across box if Lagna */}
              {isLagna && (
                <line
                  x1={coords.x}
                  y1={coords.y}
                  x2={coords.x + coords.width}
                  y2={coords.y + coords.height}
                  stroke="rgba(200, 157, 60, 0.35)"
                  strokeWidth="1.5"
                  strokeDasharray="3 3"
                />
              )}

              {/* Planet Occupants */}
              <g transform={`translate(${coords.x + 10}, ${coords.y + 35})`}>
                {occupants.map((occ, idx) => {
                  const isSelected = selectedPlanet === occ.name;
                  const xOffset = (idx % 2) * 44;
                  const yOffset = Math.floor(idx / 2) * 20;

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
                      fontSize="11"
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
                      {occ.isRetro ? '(R)' : ''}
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
