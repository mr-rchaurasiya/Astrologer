import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Moon, Star, Sparkles } from 'lucide-react';
import { PlanetPosition } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface NakshatraCardProps {
  moon: PlanetPosition | undefined;
  profileId?: string;
}

export const NakshatraCard: React.FC<NakshatraCardProps> = ({ moon, profileId }) => {
  const navigate = useNavigate();
  if (!moon) return null;

  const handleAskAI = () => {
    const query = new URLSearchParams({
      pointType: 'nakshatra',
      pointId: moon.nakshatra,
      pointLabel: `Birth Nakshatra: ${moon.nakshatra} (Pada ${moon.pada})`,
    });
    if (profileId) {
      query.append('profile', profileId);
    }
    navigate(`/chat?${query.toString()}`);
  };

  return (
    <Card glow style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 208, 97, 0.15)', color: 'var(--accent-gold)' }}>
              <Moon size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Birth Nakshatra (Janma Tara)</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Moon's Astrological Constellation</span>
            </div>
          </div>
          <Badge variant="gold">
            <Star size={12} fill="var(--accent-gold)" style={{ marginRight: '4px' }} />
            Pada {moon.pada}
          </Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Cinzel', serif", color: 'var(--accent-gold)' }}>
            {moon.nakshatra}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            in {moon.sign} ({moon.signDegree.toFixed(2)}°)
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Nakshatra Lord:</span>
            <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{moon.nakshatraLord}</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Moon Dignity:</span>
            <div style={{ fontWeight: 600, color: '#E2E8F0', textTransform: 'capitalize' }}>{moon.dignity}</div>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }}
        icon={<Sparkles size={13} />}
        onClick={handleAskAI}
      >
        Ask AI about Nakshatra
      </Button>
    </Card>
  );
};
