import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  UserCheck,
  BookOpen,
  RefreshCw,
} from 'lucide-react';
import { SEOHead } from '../../components/seo/SEOHead';
import { Button } from '../../components/common/Button';

interface GrowthMetrics {
  overview: {
    totalUsers: number;
    activeSubscriptions: number;
    mrrINR: number;
    arrINR: number;
    totalRevenueINR: number;
    arpuINR: number;
    churnRatePct: number;
  };
  funnel: {
    stages: Array<{
      name: string;
      count: number;
      conversionRatePct: number;
    }>;
  };
  retention: {
    day1Pct: number;
    day7Pct: number;
    day30Pct: number;
  };
  growthChannels: {
    couponsRedeemed: number;
    referralsRewarded: number;
    publishedArticles: number;
    affiliatePartners: number;
  };
}

export const AdminGrowthPage: React.FC = () => {
  const [metrics, setMetrics] = useState<GrowthMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchMetrics = () => {
    setLoading(true);
    fetch('/api/v1/admin/analytics/growth', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        if (res?.data) {
          setMetrics(res.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="container" style={{ padding: '32px 16px', maxWidth: '1100px' }}>
      <SEOHead title="Admin Growth & Revenue Telemetry" noindex={true} />

      {/* Admin Nav Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ color: '#FFF', fontSize: '1.8rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            <TrendingUp color="var(--accent-gold)" /> Growth & Revenue Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '4px 0 0 0' }}>
            Authoritative conversion funnels, retention cohorts, and recurring subscription metrics
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={fetchMetrics}>
            <RefreshCw size={14} /> Refresh
          </Button>
          <Link to="/admin">
            <Button variant="outline" size="sm">
              Overview
            </Button>
          </Link>
          <Link to="/admin/articles">
            <Button variant="gold" size="sm">
              <BookOpen size={14} /> Manage Articles
            </Button>
          </Link>
        </div>
      </div>

      {loading && !metrics ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-secondary)' }}>Loading growth telemetry...</div>
      ) : metrics ? (
        <>
          {/* Revenue KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '28px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Monthly Recurring (MRR)</span>
              <h2 style={{ fontSize: '1.6rem', color: 'var(--accent-gold)', margin: '6px 0 0 0' }}>
                ₹{metrics.overview.mrrINR.toLocaleString()}
              </h2>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Annual Recurring (ARR)</span>
              <h2 style={{ fontSize: '1.6rem', color: '#10B981', margin: '6px 0 0 0' }}>
                ₹{metrics.overview.arrINR.toLocaleString()}
              </h2>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Active Subscriptions</span>
              <h2 style={{ fontSize: '1.6rem', color: '#FFF', margin: '6px 0 0 0' }}>
                {metrics.overview.activeSubscriptions}
              </h2>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Avg Revenue / User (ARPU)</span>
              <h2 style={{ fontSize: '1.6rem', color: '#60A5FA', margin: '6px 0 0 0' }}>
                ₹{metrics.overview.arpuINR}
              </h2>
            </div>
          </div>

          {/* Funnel & Retention Section */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px', marginBottom: '28px' }}>
            {/* Conversion Funnel */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={16} color="var(--accent-gold)" /> User Conversion Funnel
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {metrics.funnel.stages.map((stage, idx) => (
                  <div key={stage.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '4px' }}>
                      <span style={{ color: '#FFF' }}>{idx + 1}. {stage.name}</span>
                      <span style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{stage.count} ({stage.conversionRatePct}%)</span>
                    </div>
                    <div style={{ height: '6px', width: '100%', background: 'rgba(255, 255, 255, 0.08)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div
                        style={{
                          height: '100%',
                          width: `${Math.min(100, Math.max(8, stage.conversionRatePct))}%`,
                          background: 'linear-gradient(90deg, #F59E0B, #10B981)',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Retention Milestones */}
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ color: '#FFF', fontSize: '1.1rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={16} color="#10B981" /> Retention Cohort Benchmarks
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center', marginTop: '20px' }}>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day 1</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10B981', marginTop: '6px' }}>
                    {metrics.retention.day1Pct}%
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day 7</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#60A5FA', marginTop: '6px' }}>
                    {metrics.retention.day7Pct}%
                  </div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Day 30</span>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent-gold)', marginTop: '6px' }}>
                    {metrics.retention.day30Pct}%
                  </div>
                </div>
              </div>

              {/* Growth Channels Summary */}
              <div style={{ marginTop: '24px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
                <h4 style={{ color: '#FFF', fontSize: '0.9rem', marginBottom: '12px' }}>Organic & Growth Acquisition</h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Coupons Redeemed: <strong style={{ color: '#FFF' }}>{metrics.growthChannels.couponsRedeemed}</strong>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Referrals Rewarded: <strong style={{ color: '#FFF' }}>{metrics.growthChannels.referralsRewarded}</strong>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    SEO Articles: <strong style={{ color: '#FFF' }}>{metrics.growthChannels.publishedArticles}</strong>
                  </div>
                  <div style={{ color: 'var(--text-secondary)' }}>
                    Affiliate Partners: <strong style={{ color: '#FFF' }}>{metrics.growthChannels.affiliatePartners}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
