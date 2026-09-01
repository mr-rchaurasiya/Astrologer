import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Compass, Orbit, Moon, ArrowRight, Activity } from 'lucide-react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { useHealth } from '../hooks/useHealth';

export const HomePage: React.FC = () => {
  const { healthData, loading, error, refetch } = useHealth();

  return (
    <div style={{ paddingTop: '40px' }}>
      <div className="container">
        {/* Hero Section */}
        <section style={{ textAlign: 'center', maxWidth: '840px', margin: '0 auto 60px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
            <Badge variant="gold" icon={<Sparkles size={14} />}>
              Vedic Astronomical Calculation Layer + AI Reasoning
            </Badge>
          </div>

          <h1 style={{ fontSize: '3rem', lineHeight: 1.15, marginBottom: '20px', fontWeight: 700 }}>
            Precision Vedic Astrology Grounded in <span className="text-gradient-gold">Astronomical Truth</span>
          </h1>

          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '32px' }}>
            An original, production-grade Vedic Astrology platform. All planetary positions, Bhavas, Dashas, and Panchang are computed deterministically before being reasoned upon by AI.
          </p>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <Link to="/register" className="btn btn-gold">
              Create Birth Profile <ArrowRight size={16} />
            </Link>
            <Link to="/dashboard" className="btn btn-outline">
              Explore Dashboard
            </Link>
          </div>
        </section>

        {/* Live Backend Telemetry Card */}
        <section style={{ marginBottom: '60px' }}>
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Activity size={20} color="var(--accent-gold)" />
                <h3 style={{ fontSize: '1.15rem', color: '#FFF' }}>Core API Health Status</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  (<code>GET /api/v1/health</code>)
                </span>
              </div>
              <Button variant="outline" style={{ padding: '4px 10px', fontSize: '0.75rem' }} onClick={refetch} disabled={loading}>
                {loading ? 'Refreshing...' : 'Refresh Status'}
              </Button>
            </div>

            {error ? (
              <div style={{ padding: '12px 16px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#FCA5A5', fontSize: '0.875rem' }}>
                ⚠️ Backend connection error: {error}
              </div>
            ) : healthData ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--color-success)', marginTop: '4px' }}>
                    ● {healthData.status.toUpperCase()}
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Server Uptime</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFF', marginTop: '4px' }}>
                    {healthData.uptime}s
                  </div>
                </div>
                <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Timestamp</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', marginTop: '6px' }}>
                    {new Date(healthData.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* Feature Overview Grid */}
        <section style={{ marginBottom: '60px' }}>
          <div style={{ textAlign: 'center', marginBottom: '36px' }}>
            <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Architecture & Feature Pillars</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Designed for mathematical precision and rigorous Vedic traditions</p>
          </div>

          <div className="grid-cols-3">
            <Card glow>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(245, 208, 97, 0.15)', border: '1px solid var(--border-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)', marginBottom: '16px' }}>
                <Compass size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Deterministic Charts</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Ephemeris-grade calculation engine delivering D1 Rashi, D9 Navamsha, and D10 Dashamsha charts with exact Lahiri Ayanamsa.
              </p>
            </Card>

            <Card>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818CF8', marginBottom: '16px' }}>
                <Orbit size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Vimshottari Dasha Tree</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Complete 120-year hierarchical timeline calculating Maha Dasha, Antar Dasha, and Pratyantar Dasha transition periods.
              </p>
            </Card>

            <Card>
              <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34D399', marginBottom: '16px' }}>
                <Moon size={22} />
              </div>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Panchang & Muhurtas</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                Real-time Tithi, Vara, Nakshatra, Yoga, Karana, alongside Rahu Kaal, Gulika, and Abhijit Muhurta calculations.
              </p>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
};
