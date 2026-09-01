import React from 'react';
import { Calendar, Clock, MapPin, Globe } from 'lucide-react';
import { AstrologyChartOutput } from '../../types';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';

interface BirthDetailsCardProps {
  profileName?: string;
  relationship?: string;
  birthInput: AstrologyChartOutput['birthInput'];
  ayanamsa: AstrologyChartOutput['ayanamsa'];
}

export const BirthDetailsCard: React.FC<BirthDetailsCardProps> = ({
  profileName,
  relationship,
  birthInput,
  ayanamsa,
}) => {
  return (
    <Card style={{ height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div>
          <h3 style={{ fontSize: '1.15rem' }}>{profileName || 'Birth Parameters'}</h3>
          {relationship && (
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
              Relationship: {relationship}
            </span>
          )}
        </div>
        <Badge variant="gold">Lahiri {ayanamsa.formatted}</Badge>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Calendar size={15} color="var(--accent-gold)" />
          <span>{birthInput.dateOfBirth}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
          <Clock size={15} color="var(--accent-gold)" />
          <span>{birthInput.timeOfBirth}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', gridColumn: '1 / -1' }}>
          <MapPin size={15} color="var(--accent-gold)" flex-shrink="0" />
          <span>
            Lat: {birthInput.latitude.toFixed(4)}°, Lon: {birthInput.longitude.toFixed(4)}° ({birthInput.timezone}, UTC {birthInput.timezoneOffset >= 0 ? `+${birthInput.timezoneOffset}` : birthInput.timezoneOffset})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.78rem', gridColumn: '1 / -1' }}>
          <Globe size={13} />
          <span>Julian Day: {birthInput.julianDay.toFixed(4)} | UTC: {new Date(birthInput.utcDateTime).toUTCString()}</span>
        </div>
      </div>
    </Card>
  );
};
