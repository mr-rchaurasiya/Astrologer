import React from 'react';
import { Clock, ShieldAlert, Sparkles } from 'lucide-react';
import { MuhurtaInfo } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface MuhurtaCardProps {
  muhurta: MuhurtaInfo;
}

export const MuhurtaCard: React.FC<MuhurtaCardProps> = ({ muhurta }) => {
  const windows = [
    { key: 'rahu', data: muhurta.rahuKaal, isAuspicious: false },
    { key: 'gulika', data: muhurta.gulikaKaal, isAuspicious: false },
    { key: 'yamaganda', data: muhurta.yamagandaKaal, isAuspicious: false },
    { key: 'abhijit', data: muhurta.abhijitMuhurta, isAuspicious: true },
    { key: 'brahma', data: muhurta.brahmaMuhurta, isAuspicious: true },
  ];

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(245, 208, 97, 0.15)', color: 'var(--accent-gold)' }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Auspicious & Inauspicious Muhurtas</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Traditional Time Octants for {muhurta.date}</span>
          </div>
        </div>
        <Badge variant="gold">Vedic Timing</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {windows.map(({ key, data, isAuspicious }) => (
          <div
            key={key}
            className="glass-panel"
            style={{
              padding: '14px',
              border: isAuspicious ? '1px solid rgba(52, 211, 153, 0.3)' : '1px solid rgba(239, 68, 68, 0.25)',
              background: isAuspicious ? 'rgba(16, 185, 129, 0.03)' : 'rgba(239, 68, 68, 0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600, color: isAuspicious ? '#34D399' : '#FCA5A5', fontSize: '0.95rem' }}>
                {isAuspicious ? <Sparkles size={14} /> : <ShieldAlert size={14} />}
                {data.name}
              </div>
              <Badge variant={isAuspicious ? 'emerald' : 'rose'}>
                {isAuspicious ? 'Auspicious' : 'Inauspicious'}
              </Badge>
            </div>

            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#FFF', margin: '4px 0' }}>
              {new Date(data.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} —{' '}
              {new Date(data.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4, marginTop: '4px' }}>
              {data.description}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
