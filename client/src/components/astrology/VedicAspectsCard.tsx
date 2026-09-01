import React from 'react';
import { Eye } from 'lucide-react';
import { VedicAspect } from '../../types';
import { Card } from '../common/Card';

interface VedicAspectsCardProps {
  aspects: VedicAspect[];
}

export const VedicAspectsCard: React.FC<VedicAspectsCardProps> = ({ aspects }) => {
  // Group aspects by source planet
  const grouped: Record<string, VedicAspect[]> = {};
  aspects.forEach((asp) => {
    if (!grouped[asp.fromPlanet]) {
      grouped[asp.fromPlanet] = [];
    }
    grouped[asp.fromPlanet].push(asp);
  });

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(168, 85, 247, 0.15)', color: '#C084FC' }}>
          <Eye size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '1.15rem' }}>Planetary Aspects (Vedic Drishti)</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Deterministic Graha Drishti influence across Houses and Planets</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {Object.entries(grouped).map(([planet, list]) => (
          <div
            key={planet}
            className="glass-panel"
            style={{ padding: '12px 14px', border: '1px solid var(--border-subtle)' }}
          >
            <div style={{ fontWeight: 600, color: 'var(--accent-gold)', marginBottom: '8px', fontSize: '0.9rem' }}>
              {planet} Aspects:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem' }}>
              {list.map((asp, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', borderBottom: idx < list.length - 1 ? '1px dashed rgba(255, 255, 255, 0.05)' : 'none' }}>
                  <span style={{ color: '#E2E8F0' }}>
                    <strong>{asp.aspectType} Aspect</strong> → House {asp.toHouse} ({asp.toSign})
                  </span>
                  {asp.targetPlanet && (
                    <span style={{ color: '#60A5FA', fontSize: '0.75rem', fontWeight: 500 }}>
                      on {asp.targetPlanet}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
