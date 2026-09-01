import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, FileText, Zap, Loader2, ArrowRight } from 'lucide-react';
import { AdminApi } from '../../services/adminApi';
import { AdminOverviewData } from '../../types/admin';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminDashboardPage: React.FC = () => {
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOverview = async () => {
      setLoading(true);
      try {
        const res = await AdminApi.getOverview();
        if (res.success && res.data) {
          setOverview(res.data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load admin analytics');
      } finally {
        setLoading(false);
      }
    };

    loadOverview();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Admin Platform Control Hub</h1>
            <Badge variant="gold">System Administrator</Badge>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
            Platform metrics, revenue summaries, user management, and security audit trails
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link to="/admin/users" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Manage Users
          </Link>
          <Link to="/admin/subscriptions" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Subscriptions
          </Link>
          <Link to="/admin/audit-logs" className="btn btn-gold" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Audit Logs
          </Link>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '80px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 16px auto', color: 'var(--accent-gold)' }} />
          <div>Aggregating platform metrics & telemetry...</div>
        </div>
      ) : error ? (
        <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', color: '#FCA5A5' }}>
          {error}
        </div>
      ) : overview ? (
        <div>
          {/* Key Metrics Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            {/* Users */}
            <Card glow>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Accounts</span>
                <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(96, 165, 250, 0.15)', color: '#60A5FA' }}>
                  <Users size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>{overview.users.total}</div>
              <div style={{ fontSize: '0.75rem', color: '#34D399', marginTop: '4px' }}>
                {overview.users.active} Active • {overview.users.deactivated} Deactivated
              </div>
            </Card>

            {/* Subscriptions */}
            <Card glow>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Cosmic Premium</span>
                <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(245, 208, 97, 0.15)', color: 'var(--accent-gold)' }}>
                  <Zap size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--accent-gold)' }}>{overview.subscriptions.premiumActive}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {overview.subscriptions.free} Free Tier Users
              </div>
            </Card>

            {/* Revenue */}
            <Card glow>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Captured Revenue</span>
                <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(16, 185, 129, 0.15)', color: '#10B981' }}>
                  <DollarSign size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>
                ${overview.payments.totalRevenueUSD}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                {overview.payments.successfulOrders} successful / {overview.payments.totalOrders} total orders
              </div>
            </Card>

            {/* Reports */}
            <Card glow>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Dossiers Generated</span>
                <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(192, 132, 252, 0.15)', color: '#C084FC' }}>
                  <FileText size={18} />
                </div>
              </div>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: '#FFF' }}>{overview.reports.totalGenerated}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Deterministic Vector PDFs
              </div>
            </Card>
          </div>

          {/* Quick Management Navigation Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>User Management</h3>
                <Badge variant="indigo">Accounts</Badge>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Search registered seekers, inspect active subscription plans, and toggle account activation status.
              </p>
              <Link to="/admin/users" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
                Open User Registry <ArrowRight size={14} />
              </Link>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Subscriptions & Plans</h3>
                <Badge variant="gold">Billing</Badge>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Inspect real-time subscription states, expiration schedules, and active tier assignments.
              </p>
              <Link to="/admin/subscriptions" className="btn btn-outline" style={{ width: '100%', fontSize: '0.85rem' }}>
                Open Subscription Registry <ArrowRight size={14} />
              </Link>
            </Card>

            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>Security Audit Trail</h3>
                <Badge variant="emerald">Security</Badge>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                Trace critical administrative actions, payment verifications, report generations, and auth events.
              </p>
              <Link to="/admin/audit-logs" className="btn btn-gold" style={{ width: '100%', fontSize: '0.85rem' }}>
                View Audit Trail <ArrowRight size={14} />
              </Link>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
};
