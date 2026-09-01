import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass, Sparkles } from 'lucide-react';
import { AscendantInfo, HouseInfo } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface LagnaCardProps {
  ascendant: AscendantInfo;
  houses: HouseInfo[];
  profileId?: string;
}

export const LagnaCard: React.FC<LagnaCardProps> = ({ ascendant, houses, profileId }) => {
  const navigate = useNavigate();
  const lagnaLord = houses.find((h) => h.houseNumber === 1)?.lord || 'Sun';

  const handleAskAI = () => {
    const query = new URLSearchParams({
      pointType: 'house',
      pointId: '1',
      pointLabel: `Ascendant (Lagna) in ${ascendant.sign}`,
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
            <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
              <Compass size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem' }}>Ascendant (Lagna)</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>1st House / Rising Sign</span>
            </div>
          </div>
          <Badge variant="indigo">{ascendant.sign}</Badge>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '1.75rem', fontWeight: 700, fontFamily: "'Cinzel', serif", color: 'var(--accent-gold)' }}>
            {ascendant.sign}
          </span>
          <span style={{ fontSize: '1rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
            {ascendant.signDegree.toFixed(2)}°
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem', padding: '10px', borderRadius: '8px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)', marginBottom: '12px' }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Nakshatra:</span>
            <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{ascendant.nakshatra} (Pada {ascendant.pada})</div>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Lagna Lord:</span>
            <div style={{ fontWeight: 600, color: '#E2E8F0' }}>{lagnaLord}</div>
          </div>
        </div>
      </div>

      <Button
        variant="outline"
        style={{ width: '100%', padding: '6px 10px', fontSize: '0.8rem' }}
        icon={<Sparkles size={13} />}
        onClick={handleAskAI}
      >
        Ask AI about Lagna
      </Button>
    </Card>
  );
};
