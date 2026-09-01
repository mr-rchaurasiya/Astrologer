import React from 'react';
import { HouseInfo } from '../../types';

interface HouseTableProps {
  houses: HouseInfo[];
}

export const HouseTable: React.FC<HouseTableProps> = ({ houses }) => {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
            <th style={{ padding: '10px 14px' }}>House</th>
            <th style={{ padding: '10px 14px' }}>Sign (Rashi)</th>
            <th style={{ padding: '10px 14px' }}>House Lord</th>
            <th style={{ padding: '10px 14px' }}>Occupants</th>
          </tr>
        </thead>
        <tbody>
          {houses.map((h) => (
            <tr key={h.houseNumber} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td style={{ padding: '10px 14px', fontWeight: 600, color: 'var(--accent-gold)' }}>
                House {h.houseNumber}
              </td>
              <td style={{ padding: '10px 14px' }}>{h.sign}</td>
              <td style={{ padding: '10px 14px', color: 'var(--text-secondary)' }}>{h.lord}</td>
              <td style={{ padding: '10px 14px' }}>
                {h.occupants.length > 0 ? (
                  <span style={{ fontWeight: 500, color: '#E2E8F0' }}>{h.occupants.join(', ')}</span>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
