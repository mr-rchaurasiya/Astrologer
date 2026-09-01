import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TransitEvent } from '../../types/analytics';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Compass, Calendar, Sparkles, Filter } from 'lucide-react';

interface TransitTimelineProps {
  events: TransitEvent[];
  profileId: string;
}

export const TransitTimeline: React.FC<TransitTimelineProps> = ({ events, profileId }) => {
  const [selectedPlanet, setSelectedPlanet] = useState<string>('all');

  const filteredEvents =
    selectedPlanet === 'all'
      ? events
      : events.filter((e) => e.planet.toLowerCase() === selectedPlanet.toLowerCase());

  const planets = ['all', 'Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Mars'];

  return (
    <Card>
      {/* Header & Filter Chips */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="var(--accent-gold)" />
          <h3 style={{ fontSize: '1.15rem' }}>Major Planetary Transit Events</h3>
          <Badge variant="indigo">{events.length} Events Detected</Badge>
        </div>

        {/* Filter Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-muted)" />
          {planets.map((p) => {
            const isSelected = selectedPlanet === p;
            return (
              <button
                key={p}
                onClick={() => setSelectedPlanet(p)}
                style={{
                  padding: '4px 10px',
                  borderRadius: '14px',
                  fontSize: '0.725rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                  background: isSelected ? 'rgba(245, 208, 97, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                  color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
                  textTransform: 'capitalize',
                }}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          No major transit events detected for this selection.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredEvents.map((evt) => (
            <div
              key={evt.id}
              className="glass-panel"
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                border: '1px solid var(--border-medium)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                transition: 'border-color 0.2s ease',
              }}
            >
              {/* Left Details */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background:
                      evt.planet === 'Jupiter'
                        ? 'rgba(245, 208, 97, 0.15)'
                        : evt.planet === 'Saturn'
                        ? 'rgba(148, 163, 184, 0.15)'
                        : evt.planet === 'Mars'
                        ? 'rgba(239, 68, 68, 0.15)'
                        : 'rgba(168, 85, 247, 0.15)',
                    color:
                      evt.planet === 'Jupiter'
                        ? 'var(--accent-gold)'
                        : evt.planet === 'Saturn'
                        ? '#94A3B8'
                        : evt.planet === 'Mars'
                        ? '#EF4444'
                        : '#C084FC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    flexShrink: 0,
                  }}
                >
                  {evt.planet.slice(0, 2).toUpperCase()}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 600, color: '#FFF', fontSize: '0.9rem' }}>{evt.title}</span>
                    <Badge variant={evt.significance === 'high' ? 'gold' : 'indigo'}>
                      {evt.eventType.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '2px', lineHeight: 1.4 }}>
                    {evt.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    <Calendar size={12} />
                    <span>{evt.date}</span>
                    {evt.natalTarget && (
                      <>
                        <span>•</span>
                        <span style={{ color: '#60A5FA' }}>Target: {evt.natalTarget}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Point & Ask Action */}
              <Link
                to={`/chat?profile=${profileId}&pointType=planet&pointId=${evt.planet}&pointLabel=${encodeURIComponent(
                  `${evt.planet} transit: ${evt.title}`
                )}`}
                className="btn btn-outline"
                style={{ padding: '6px 12px', fontSize: '0.75rem', whiteSpace: 'nowrap' }}
              >
                <Sparkles size={13} /> Ask AI about this
              </Link>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
