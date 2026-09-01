import React from 'react';
import { PlanetPosition, AscendantInfo, PlanetName } from '../../types';
import { Badge } from '../common/Badge';

interface PlanetaryTableProps {
  planets: PlanetPosition[];
  ascendant: AscendantInfo;
  onSelectPlanet: (planetName: PlanetName) => void;
}

export const PlanetaryTable: React.FC<PlanetaryTableProps> = ({ planets, ascendant, onSelectPlanet }) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
            <th style={{ padding: '12px 14px' }}>Planet</th>
            <th style={{ padding: '12px 14px' }}>Sign</th>
            <th style={{ padding: '12px 14px' }}>Degree</th>
            <th style={{ padding: '12px 14px' }}>House</th>
            <th style={{ padding: '12px 14px' }}>Nakshatra</th>
            <th style={{ padding: '12px 14px' }}>Pada</th>
            <th style={{ padding: '12px 14px' }}>Motion</th>
            <th style={{ padding: '12px 14px' }}>Combust</th>
            <th style={{ padding: '12px 14px' }}>Dignity</th>
          </tr>
        </thead>
        <tbody>
          {/* Ascendant Row */}
          <tr style={{ borderBottom: '1px solid var(--border-subtle)', background: 'rgba(99, 102, 241, 0.04)' }}>
            <td style={{ padding: '12px 14px', fontWeight: 600, color: '#60A5FA' }}>Ascendant (Lagna)</td>
            <td style={{ padding: '12px 14px' }}>{ascendant.sign}</td>
            <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>{ascendant.signDegree.toFixed(2)}°</td>
            <td style={{ padding: '12px 14px', fontWeight: 600 }}>1</td>
            <td style={{ padding: '12px 14px' }}>{ascendant.nakshatra}</td>
            <td style={{ padding: '12px 14px' }}>{ascendant.pada}</td>
            <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>Direct</td>
            <td style={{ padding: '12px 14px', color: 'var(--text-muted)' }}>—</td>
            <td style={{ padding: '12px 14px' }}>
              <Badge variant="indigo">Lagna</Badge>
            </td>
          </tr>

          {/* 9 Planets */}
          {planets.map((p) => {
            const isExaltedOrOwn = p.dignity === 'exalted' || p.dignity === 'own' || p.dignity === 'moolatrikona';
            const isDebilitated = p.dignity === 'debilitated';

            return (
              <tr
                key={p.name}
                style={{
                  borderBottom: '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
                className="hover-row"
                onClick={() => onSelectPlanet(p.name)}
              >
                <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--accent-gold)' }}>{p.name}</td>
                <td style={{ padding: '12px 14px' }}>{p.sign}</td>
                <td style={{ padding: '12px 14px', fontFamily: 'monospace' }}>{p.signDegree.toFixed(2)}°</td>
                <td style={{ padding: '12px 14px', fontWeight: 600 }}>{p.house}</td>
                <td style={{ padding: '12px 14px' }}>{p.nakshatra}</td>
                <td style={{ padding: '12px 14px' }}>{p.pada}</td>
                <td style={{ padding: '12px 14px' }}>
                  {p.retrograde ? (
                    <span style={{ color: '#F472B6', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      ↺ Retro
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  {p.combust ? (
                    <span style={{ color: '#FB923C', fontWeight: 500 }}>🔥 Yes</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>No</span>
                  )}
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <Badge variant={isExaltedOrOwn ? 'gold' : isDebilitated ? 'rose' : 'emerald'}>
                    {p.dignity.replace('_', ' ')}
                  </Badge>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <style>{`
        .hover-row:hover {
          background: rgba(255, 255, 255, 0.03);
        }
      `}</style>
    </div>
  );
};
