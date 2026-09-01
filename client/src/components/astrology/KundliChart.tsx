import React, { useState } from 'react';
import { DivisionalChart, PlanetPosition, PlanetName } from '../../types';
import { ZoomIn, ZoomOut, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';

interface KundliChartProps {
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

// Center coordinate positions for North Indian 12 houses on a 400x400 SVG canvas
const HOUSE_COORDINATES: Record<number, { textX: number; textY: number; signX: number; signY: number }> = {
  1: { textX: 200, textY: 130, signX: 200, signY: 165 },   // Top diamond (Lagna)
  2: { textX: 100, textY: 55, signX: 140, signY: 85 },     // Top-left upper triangle
  3: { textX: 55, textY: 100, signX: 85, signY: 140 },     // Top-left lower triangle
  4: { textX: 130, textY: 200, signX: 165, signY: 200 },   // Left diamond
  5: { textX: 55, textY: 300, signX: 85, signY: 260 },     // Bottom-left upper triangle
  6: { textX: 100, textY: 345, signX: 140, signY: 315 },   // Bottom-left lower triangle
  7: { textX: 200, textY: 270, signX: 200, signY: 235 },   // Bottom diamond
  8: { textX: 300, textY: 345, signX: 260, signY: 315 },   // Bottom-right lower triangle
  9: { textX: 345, textY: 300, signX: 315, signY: 260 },   // Bottom-right upper triangle
  10: { textX: 270, textY: 200, signX: 235, signY: 200 },  // Right diamond
  11: { textX: 345, textY: 100, signX: 315, signY: 140 },  // Top-right lower triangle
  12: { textX: 300, textY: 55, signX: 260, signY: 85 },    // Top-right upper triangle
};

// SVG Polygon points for each of the 12 houses to support interactive hover & selection
const HOUSE_POLYGONS: Record<number, string> = {
  1: '200,0 300,100 200,200 100,100',     // H1 top diamond
  2: '0,0 200,0 100,100',                 // H2 top-left upper triangle
  3: '0,0 100,100 0,200',                 // H3 top-left lower triangle
  4: '0,200 100,100 200,200 100,300',     // H4 left diamond
  5: '0,200 100,300 0,400',               // H5 bottom-left upper triangle
  6: '0,400 100,300 200,400',             // H6 bottom-left lower triangle
  7: '200,200 300,300 200,400 100,300',   // H7 bottom diamond
  8: '200,400 300,300 400,400',           // H8 bottom-right lower triangle
  9: '400,200 300,300 400,400',           // H9 bottom-right upper triangle
  10: '200,200 300,100 400,200 300,300',  // H10 right diamond
  11: '400,0 400,200 300,100',            // H11 top-right lower triangle
  12: '200,0 400,0 300,100',              // H12 top-right upper triangle
};

export const KundliChart: React.FC<KundliChartProps> = ({
  chart,
  planetsInfo = [],
  selectedPlanet,
  selectedHouse,
  onSelectPlanet,
  onSelectHouse,
}) => {
  const [zoomScale, setZoomScale] = useState<number>(1);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  const houseOccupants: Record<number, { name: string; isRetro?: boolean; isCombust?: boolean }[]> = {};
  const houseSigns: Record<number, number> = {};

  for (let h = 1; h <= 12; h++) {
    houseOccupants[h] = [];
    houseSigns[h] = (((chart.ascendantSignNumber - 1 + (h - 1)) % 12) + 1);
  }

  chart.placements.forEach((p) => {
    const pInfo = planetsInfo.find((pi) => pi.name === p.planet);
    if (p.house >= 1 && p.house <= 12) {
      houseOccupants[p.house].push({
        name: p.planet,
        isRetro: pInfo?.retrograde,
        isCombust: pInfo?.combust,
      });
    }
  });

  const zoomIn = () => setZoomScale((prev) => Math.min(prev + 0.15, 1.6));
  const zoomOut = () => setZoomScale((prev) => Math.max(prev - 0.15, 0.8));
  const resetZoom = () => setZoomScale(1);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
        position: isFullscreen ? 'fixed' : 'relative',
        inset: isFullscreen ? 0 : 'auto',
        background: isFullscreen ? 'rgba(7, 9, 14, 0.98)' : 'transparent',
        zIndex: isFullscreen ? 10000 : 'auto',
        justifyContent: isFullscreen ? 'center' : 'flex-start',
        padding: isFullscreen ? '20px' : 0,
      }}
    >
      {/* Interactive Controls Bar (Zoom, Reset, Fullscreen) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          maxWidth: '460px',
          marginBottom: '8px',
          padding: '0 4px',
        }}
      >
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
          North Indian Diamond
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={zoomIn}
            title="Zoom In"
            aria-label="Zoom In"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={zoomOut}
            title="Zoom Out"
            aria-label="Zoom Out"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            <ZoomOut size={14} />
          </button>
          <button
            onClick={resetZoom}
            title="Reset Zoom"
            aria-label="Reset Zoom"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} />
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            aria-label={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              borderRadius: '6px',
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: isFullscreen ? '600px' : '460px',
          aspectRatio: '1 / 1',
          position: 'relative',
          background: 'linear-gradient(145deg, rgba(13, 17, 24, 0.95) 0%, rgba(7, 9, 14, 0.98) 100%)',
          borderRadius: '16px',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          padding: '12px',
          overflow: 'hidden',
        }}
      >
        <svg
          viewBox="0 0 400 400"
          style={{
            width: '100%',
            height: '100%',
            transform: `scale(${zoomScale})`,
            transformOrigin: 'center center',
            transition: 'transform 0.2s ease',
          }}
          role="img"
          aria-label={`North Indian ${chart.title} Kundli Chart`}
        >
          <defs>
            <linearGradient id="chartLineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D061" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#D4AF37" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#F5D061" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="lagnaBg" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 208, 97, 0.08)" />
              <stop offset="100%" stopColor="rgba(99, 102, 241, 0.05)" />
            </linearGradient>
          </defs>

          {/* Render 12 Interactive House Polygons for Selection and Highlighting */}
          {Object.entries(HOUSE_POLYGONS).map(([hStr, points]) => {
            const hNum = parseInt(hStr, 10);
            const isSelected = selectedHouse === hNum;
            return (
              <polygon
                key={hNum}
                points={points}
                fill={isSelected ? 'rgba(200, 157, 60, 0.25)' : hNum === 1 ? 'url(#lagnaBg)' : 'transparent'}
                stroke={isSelected ? 'var(--gold-primary)' : 'none'}
                strokeWidth={isSelected ? 2 : 0}
                onClick={() => onSelectHouse && onSelectHouse(hNum)}
                style={{ cursor: 'pointer', transition: 'fill 0.2s ease' }}
              />
            );
          })}

          {/* Outer Square Border */}
          <rect x="0" y="0" width="400" height="400" fill="none" stroke="url(#chartLineGrad)" strokeWidth="2" pointerEvents="none" />

          {/* Major Diagonals */}
          <line x1="0" y1="0" x2="400" y2="400" stroke="url(#chartLineGrad)" strokeWidth="1.5" pointerEvents="none" />
          <line x1="0" y1="400" x2="400" y2="0" stroke="url(#chartLineGrad)" strokeWidth="1.5" pointerEvents="none" />

          {/* Inner Diamond */}
          <polygon points="200,0 400,200 200,400 0,200" fill="none" stroke="url(#chartLineGrad)" strokeWidth="1.5" pointerEvents="none" />

          {/* Render 12 Houses: Sign Numbers & Occupant Planets */}
          {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const).map((h) => {
            const coords = HOUSE_COORDINATES[h];
            const signNumber = houseSigns[h];
            const occupants = houseOccupants[h] || [];

            return (
              <g key={h} onClick={() => onSelectHouse && onSelectHouse(h)} style={{ cursor: 'pointer' }}>
                {/* Zodiac Sign Number */}
                <text
                  x={coords.signX}
                  y={coords.signY}
                  fill="#9CA3AF"
                  fontSize="12"
                  fontWeight="600"
                  fontFamily="Cinzel, serif"
                  textAnchor="middle"
                  dominantBaseline="central"
                  opacity={0.7}
                >
                  {signNumber}
                </text>

                {/* Occupant Planets in this house */}
                {occupants.map((occ, idx) => {
                  const isSelected = selectedPlanet === occ.name;
                  const total = occupants.length;
                  const yOffset = (idx - (total - 1) / 2) * 16;

                  return (
                    <text
                      key={occ.name}
                      x={coords.textX}
                      y={coords.textY + yOffset}
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
                      fontSize={isSelected ? '13' : '11.5'}
                      fontWeight={isSelected || occ.name === 'Ascendant' ? '700' : '500'}
                      fontFamily="Inter, sans-serif"
                      textAnchor="middle"
                      dominantBaseline="central"
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
            );
          })}
        </svg>
      </div>
    </div>
  );
};
