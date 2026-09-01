import React, { useState, useEffect } from 'react';
import { RefreshCw, Globe, Loader2 } from 'lucide-react';
import { TransitOutput } from '../../types';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { ApiClient } from '../../services/api';

export const TransitCard: React.FC = () => {
  const [transits, setTransits] = useState<TransitOutput | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchTransits = async () => {
    try {
      const res = await ApiClient.getCurrentTransits();
      if (res.success && res.data) {
        setTransits(res.data.transits);
      }
    } catch {
      // Handle gracefully
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransits();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTransits();
  };

  return (
    <Card>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ padding: '8px', borderRadius: '8px', background: 'rgba(6, 182, 212, 0.15)', color: '#22D3EE' }}>
            <Globe size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.2rem' }}>Current Planetary Transits (Gochar)</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time Sidereal Coordinates in the Sky Right Now
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          <span>Refresh</span>
        </Button>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 8px auto', color: 'var(--accent-gold)' }} />
          <div>Calculating current sky transits...</div>
        </div>
      ) : transits ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '10px 12px' }}>Planet</th>
                <th style={{ padding: '10px 12px' }}>Transit Sign</th>
                <th style={{ padding: '10px 12px' }}>Degree</th>
                <th style={{ padding: '10px 12px' }}>Nakshatra</th>
                <th style={{ padding: '10px 12px' }}>Pada</th>
                <th style={{ padding: '10px 12px' }}>Motion</th>
              </tr>
            </thead>
            <tbody>
              {transits.planets.map((p) => (
                <tr key={p.name} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--accent-gold)' }}>{p.name}</td>
                  <td style={{ padding: '10px 12px' }}>{p.sign}</td>
                  <td style={{ padding: '10px 12px', fontFamily: 'monospace' }}>{p.signDegree.toFixed(2)}°</td>
                  <td style={{ padding: '10px 12px' }}>{p.nakshatra}</td>
                  <td style={{ padding: '10px 12px' }}>{p.pada}</td>
                  <td style={{ padding: '10px 12px' }}>
                    {p.retrograde ? (
                      <span style={{ color: '#F472B6', fontWeight: 500 }}>↺ Retro</span>
                    ) : (
                      <span style={{ color: 'var(--text-muted)' }}>Direct</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Transit data currently unavailable.
        </div>
      )}
    </Card>
  );
};
