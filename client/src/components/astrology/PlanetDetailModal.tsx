import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { PlanetPosition, VedicAspect } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

interface PlanetDetailModalProps {
  planet: PlanetPosition | null;
  aspects?: VedicAspect[];
  profileId?: string;
  onClose: () => void;
}

export const PlanetDetailModal: React.FC<PlanetDetailModalProps> = ({
  planet,
  aspects = [],
  profileId,
  onClose,
}) => {
  const navigate = useNavigate();
  if (!planet) return null;

  const relevantAspects = aspects.filter((a) => a.fromPlanet === planet.name);

  const handleAskAI = () => {
    onClose();
    const query = new URLSearchParams({
      pointType: 'planet',
      pointId: planet.name,
      pointLabel: `${planet.name} in ${planet.sign} (House ${planet.house})`,
    });
    if (profileId) {
      query.append('profile', profileId);
    }
    navigate(`/chat?${query.toString()}`);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 250,
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '520px',
          border: '1px solid var(--border-gold)',
          boxShadow: 'var(--shadow-gold)',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem' }}>{planet.name} Parameters</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Factual Ephemeris & Vedic Astrological Attributes</span>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '1.2rem', cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', fontSize: '0.85rem' }}>
          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>ZODIAC SIGN</span>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '2px' }}>{planet.sign} (House {planet.house})</div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>SIGN DEGREE</span>
            <div style={{ fontWeight: 600, fontSize: '1rem', marginTop: '2px' }}>{planet.signDegree.toFixed(4)}°</div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>SIDEREAL LONGITUDE</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{planet.longitude.toFixed(4)}°</div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>TROPICAL LONGITUDE</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{planet.tropicalLongitude.toFixed(4)}°</div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>NAKSHATRA & PADA</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>{planet.nakshatra} (Pada {planet.pada})</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Lord: {planet.nakshatraLord}</div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>DIGNITY</span>
            <div style={{ marginTop: '4px' }}>
              <Badge variant={planet.dignity === 'exalted' || planet.dignity === 'own' || planet.dignity === 'moolatrikona' ? 'gold' : planet.dignity === 'debilitated' ? 'rose' : 'indigo'}>
                {planet.dignity.toUpperCase()}
              </Badge>
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>MOTION / SPEED</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {planet.retrograde ? '↺ Retrograde' : 'Direct'} ({planet.speed.toFixed(4)}°/day)
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '10px 14px' }}>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>COMBUSTION</span>
            <div style={{ fontWeight: 600, marginTop: '2px' }}>
              {planet.combust ? `Combust (${planet.distanceFromSun?.toFixed(2)}° from Sun)` : 'Not Combust'}
            </div>
          </div>
        </div>

        {/* Aspects Section */}
        {relevantAspects.length > 0 && (
          <div style={{ marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>VEDIC ASPECTS (DRISHTI) CAST:</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px' }}>
              {relevantAspects.map((asp, i) => (
                <div key={i} style={{ fontSize: '0.8rem', padding: '6px 10px', borderRadius: '6px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-subtle)' }}>
                  <strong>{asp.aspectType} Aspect</strong> on <strong>House {asp.toHouse} ({asp.toSign})</strong>
                  {asp.targetPlanet ? ` impacting ${asp.targetPlanet}` : ''}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>

          <Button variant="gold" icon={<Sparkles size={15} />} onClick={handleAskAI}>
            Ask AI about {planet.name}
          </Button>
        </div>
      </div>
    </div>
  );
};
