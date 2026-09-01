import React, { useState, useRef } from 'react';
import { LifeCurveResult, LifeCurvePoint, LifeCurveScores } from '../../types/analytics';
import { LifeCurveTooltip } from './LifeCurveTooltip';
import { Badge } from '../common/Badge';
import { TrendingUp, Info } from 'lucide-react';

interface LifeCurveChartProps {
  data: LifeCurveResult;
  onPointSelect?: (point: LifeCurvePoint) => void;
}

type DimensionKey = keyof LifeCurveScores;

const DIMENSION_CONFIG: Record<
  DimensionKey,
  { label: string; color: string; strokeDash?: string }
> = {
  overall: { label: 'Overall Trajectory', color: 'var(--accent-gold)' },
  career: { label: 'Career', color: '#FDE047' },
  finance: { label: 'Finance', color: '#86EFAC' },
  relationships: { label: 'Relationships', color: '#F472B6' },
  education: { label: 'Learning', color: '#60A5FA' },
  healthAwareness: { label: 'Vitality', color: '#F97316' },
  spirituality: { label: 'Spirituality', color: '#C084FC' },
};

const DASHA_COLORS: Record<string, string> = {
  Sun: 'rgba(245, 158, 11, 0.08)',
  Moon: 'rgba(217, 249, 157, 0.08)',
  Mars: 'rgba(239, 68, 68, 0.08)',
  Rahu: 'rgba(99, 102, 241, 0.08)',
  Jupiter: 'rgba(245, 208, 97, 0.12)',
  Saturn: 'rgba(148, 163, 184, 0.08)',
  Mercury: 'rgba(16, 185, 129, 0.08)',
  Ketu: 'rgba(168, 85, 247, 0.08)',
  Venus: 'rgba(236, 72, 153, 0.08)',
};

export const LifeCurveChart: React.FC<LifeCurveChartProps> = ({ data, onPointSelect }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedDimension, setSelectedDimension] = useState<DimensionKey>('overall');
  const [hoveredPoint, setHoveredPoint] = useState<LifeCurvePoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const points = data.points;
  if (points.length === 0) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>No timeline points available.</div>;
  }

  // Chart dimensions in SVG coordinate space
  const svgWidth = 900;
  const svgHeight = 360;
  const padding = { top: 30, right: 30, bottom: 45, left: 45 };

  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const minAge = points[0].age;
  const maxAge = points[points.length - 1].age || 80;

  // Coordinate mappers
  const getX = (age: number) => padding.left + ((age - minAge) / (maxAge - minAge || 1)) * chartW;
  const getY = (score: number) => padding.top + chartH - (score / 100) * chartH;

  // Calculate current age
  const birthTime = new Date(data.birthDate).getTime();
  const currentAge = Math.max(0, parseFloat(((Date.now() - birthTime) / (365.2425 * 24 * 3600 * 1000)).toFixed(1)));
  const currentAgeX = getX(currentAge);

  // Generate SVG path for the selected dimension
  const pathD = points.reduce((acc, pt, i) => {
    const x = getX(pt.age);
    const y = getY(pt.scores[selectedDimension]);
    return i === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
  }, '');

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Convert mouseX to normalized chart space
    const relativeX = mouseX - padding.left;
    const ratio = Math.max(0, Math.min(1, relativeX / chartW));
    const targetIndex = Math.min(points.length - 1, Math.max(0, Math.round(ratio * (points.length - 1))));

    const closestPoint = points[targetIndex];
    setHoveredPoint(closestPoint);
    setTooltipPos({ x: mouseX, y: mouseY });
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
    setTooltipPos(null);
  };

  return (
    <div style={{ position: 'relative', width: '100%' }} ref={containerRef}>
      {/* Controls & Dimensions Filter */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TrendingUp size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1.15rem' }}>Life Trajectory Curve</h3>
          <Badge variant="gold">Deterministic 80-Yr Model</Badge>
        </div>

        {/* Dimension Pill Selectors */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          {(Object.keys(DIMENSION_CONFIG) as DimensionKey[]).map((dimKey) => {
            const config = DIMENSION_CONFIG[dimKey];
            const isSelected = selectedDimension === dimKey;
            return (
              <button
                key={dimKey}
                onClick={() => setSelectedDimension(dimKey)}
                style={{
                  padding: '5px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? `1px solid ${config.color}` : '1px solid var(--border-medium)',
                  background: isSelected ? 'rgba(245, 208, 97, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? config.color : 'var(--text-secondary)',
                  transition: 'all 0.2s ease',
                }}
              >
                {config.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* SVG Canvas Container */}
      <div
        className="glass-panel"
        style={{
          position: 'relative',
          borderRadius: '16px',
          padding: '12px',
          border: '1px solid var(--border-medium)',
          overflow: 'hidden',
          background: 'linear-gradient(180deg, rgba(13, 17, 24, 0.95) 0%, rgba(7, 9, 14, 0.98) 100%)',
        }}
      >
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          style={{ width: '100%', height: 'auto', display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onClick={() => hoveredPoint && onPointSelect?.(hoveredPoint)}
        >
          <defs>
            {/* Gradient under overall curve */}
            <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-gold)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-gold)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* 1. Mahadasha Background Color Bands */}
          {data.mahadashaTransitions.map((maha, idx) => {
            const x1 = Math.max(padding.left, getX(maha.ageStart));
            const x2 = Math.min(padding.left + chartW, getX(maha.ageEnd));
            const bandW = Math.max(0, x2 - x1);
            const bandColor = DASHA_COLORS[maha.lord] || 'rgba(255, 255, 255, 0.03)';

            return (
              <g key={`dasha-band-${idx}`}>
                <rect x={x1} y={padding.top} width={bandW} height={chartH} fill={bandColor} />
                <text
                  x={x1 + bandW / 2}
                  y={padding.top + 14}
                  fill="rgba(255, 255, 255, 0.35)"
                  fontSize="10"
                  textAnchor="middle"
                  fontWeight="600"
                >
                  {maha.lord.toUpperCase()}
                </text>
              </g>
            );
          })}

          {/* 2. Grid Horizontal Guidelines (0, 25, 50, 75, 100) */}
          {[25, 50, 75].map((level) => (
            <g key={`grid-${level}`}>
              <line
                x1={padding.left}
                y1={getY(level)}
                x2={padding.left + chartW}
                y2={getY(level)}
                stroke="rgba(255, 255, 255, 0.06)"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left - 8}
                y={getY(level) + 3}
                fill="rgba(255, 255, 255, 0.3)"
                fontSize="9"
                textAnchor="end"
              >
                {level}
              </text>
            </g>
          ))}

          {/* 3. X-Axis Age Labels */}
          {points
            .filter((_, idx) => idx % (data.resolution === 'month' ? 120 : data.resolution === 'quarter' ? 40 : 10) === 0)
            .map((pt, idx) => (
              <text
                key={`x-label-${idx}`}
                x={getX(pt.age)}
                y={padding.top + chartH + 20}
                fill="rgba(255, 255, 255, 0.4)"
                fontSize="10"
                textAnchor="middle"
              >
                Age {Math.round(pt.age)}
              </text>
            ))}

          {/* 4. Area fill under curve */}
          <path
            d={`${pathD} L ${getX(points[points.length - 1].age)} ${padding.top + chartH} L ${getX(points[0].age)} ${padding.top + chartH} Z`}
            fill="url(#curveGradient)"
          />

          {/* 5. Main Trajectory Curve */}
          <path
            d={pathD}
            fill="none"
            stroke={DIMENSION_CONFIG[selectedDimension].color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* 6. Current Age Marker */}
          {currentAge >= minAge && currentAge <= maxAge && (
            <g>
              <line
                x1={currentAgeX}
                y1={padding.top}
                x2={currentAgeX}
                y2={padding.top + chartH}
                stroke="#60A5FA"
                strokeWidth="1.5"
                strokeDasharray="3 3"
              />
              <circle
                cx={currentAgeX}
                cy={padding.top + 6}
                r="4"
                fill="#60A5FA"
              />
              <text
                x={currentAgeX}
                y={padding.top - 8}
                fill="#60A5FA"
                fontSize="9"
                textAnchor="middle"
                fontWeight="700"
              >
                TODAY (Age {currentAge})
              </text>
            </g>
          )}

          {/* 7. Hover Indicator */}
          {hoveredPoint && (
            <g>
              <line
                x1={getX(hoveredPoint.age)}
                y1={padding.top}
                x2={getX(hoveredPoint.age)}
                y2={padding.top + chartH}
                stroke="rgba(255, 255, 255, 0.5)"
                strokeWidth="1"
              />
              <circle
                cx={getX(hoveredPoint.age)}
                cy={getY(hoveredPoint.scores[selectedDimension])}
                r="5"
                fill={DIMENSION_CONFIG[selectedDimension].color}
                stroke="#FFF"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Floating Tooltip */}
        <LifeCurveTooltip point={hoveredPoint} position={tooltipPos} />
      </div>

      {/* Mandatory Disclaimer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px', padding: '0 4px' }}>
        <Info size={13} flex-shrink="0" />
        <span>{data.scoreDisclaimer}</span>
      </div>
    </div>
  );
};
