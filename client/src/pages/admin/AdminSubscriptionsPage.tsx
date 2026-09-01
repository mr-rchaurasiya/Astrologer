import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { AdminApi } from '../../services/adminApi';
import { AdminSubscription } from '../../types/admin';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminSubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<AdminSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      setLoading(true);
      try {
        const res = await AdminApi.getSubscriptions(1, 30);
        if (res.success && res.data) {
          setSubscriptions(res.data.subscriptions);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Admin Hub
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Subscription Ledger</h1>
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-gold)' }} />
            <div>Loading subscription records...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>User</th>
                  <th style={{ padding: '12px 16px' }}>Plan Tier</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Started At</th>
                  <th style={{ padding: '12px 16px' }}>Expires At</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => (
                  <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>{sub.userId?.name || 'User'}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{sub.userId?.email || '—'}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={sub.plan === 'premium' ? 'gold' : 'indigo'}>
                        {sub.plan.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={sub.status === 'active' ? 'emerald' : 'rose'}>
                        {sub.status}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(sub.startedAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>
                      {sub.expiresAt ? new Date(sub.expiresAt).toLocaleDateString() : 'Never (Perpetual Free)'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
