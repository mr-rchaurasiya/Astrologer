import React from 'react';
import { LifeCurvePoint } from '../../types/analytics';
import { Sparkles, Orbit } from 'lucide-react';

interface LifeCurveTooltipProps {
  point: LifeCurvePoint | null;
  position: { x: number; y: number } | null;
}

export const LifeCurveTooltip: React.FC<LifeCurveTooltipProps> = ({ point, position }) => {
  if (!point || !position) return null;

  return (
    <div
      className="glass-panel"
      style={{
        position: 'absolute',
        left: `${Math.min(window.innerWidth - 280, Math.max(10, position.x - 120))}px`,
        top: `${Math.max(10, position.y - 220)}px`,
        width: '260px',
        padding: '14px',
        borderRadius: '12px',
        border: '1px solid var(--border-gold)',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 15px rgba(245, 208, 97, 0.2)',
        background: 'rgba(13, 17, 24, 0.95)',
        backdropFilter: 'blur(12px)',
        zIndex: 50,
        pointerEvents: 'none',
        fontSize: '0.8rem',
      }}
    >
      {/* Header: Age & Year */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '8px' }}>
        <div style={{ fontWeight: 700, color: '#FFF', fontSize: '0.9rem' }}>
          Age {point.age.toFixed(1)} <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({point.year})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontWeight: 700 }}>
          <Sparkles size={13} />
          <span>{point.scores.overall}/100</span>
        </div>
      </div>

      {/* Dasha Period */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', color: '#93C5FD' }}>
        <Orbit size={13} />
        <span>
          <strong>{point.mahadasha}</strong> MD {point.antardasha ? `• ${point.antardasha} AD` : ''}
        </span>
      </div>

      {/* Dimensional Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 12px', marginBottom: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Career:</span>
          <strong style={{ color: '#FDE047' }}>{point.scores.career}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Finance:</span>
          <strong style={{ color: '#86EFAC' }}>{point.scores.finance}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Relations:</span>
          <strong style={{ color: '#F472B6' }}>{point.scores.relationships}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: 'var(--text-muted)' }}>Spirit:</span>
          <strong style={{ color: '#C084FC' }}>{point.scores.spirituality}</strong>
        </div>
      </div>

      {/* Major Transit Influence Highlight */}
      {point.majorTransits.length > 0 && (
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '6px', color: '#E2E8F0', fontSize: '0.725rem' }}>
          <div style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{point.majorTransits[0].relationToNatalMoon}</div>
          <div style={{ color: 'var(--text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
            {point.majorTransits[0].description.slice(0, 90)}...
          </div>
        </div>
      )}
    </div>
  );
};
