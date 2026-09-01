import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Filter } from 'lucide-react';
import { AdminApi } from '../../services/adminApi';
import { AdminAuditLog } from '../../types/admin';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminAuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAction, setSelectedAction] = useState<string>('');

  const fetchLogs = async (act = '') => {
    setLoading(true);
    try {
      const res = await AdminApi.getAuditLogs(1, 40, act);
      if (res.success && res.data) {
        setLogs(res.data.auditLogs);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(selectedAction);
  }, [selectedAction]);

  const actions = [
    '',
    'PAYMENT_ORDER_CREATED',
    'PAYMENT_CAPTURED',
    'REPORT_GENERATED',
    'REPORT_DOWNLOADED',
    'ADMIN_USER_DEACTIVATED',
    'ADMIN_USER_REACTIVATED',
  ];

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Admin Hub
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>Security Audit Trail</h1>
      </div>

      {/* Action Filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <Filter size={14} color="var(--text-muted)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Filter Action:</span>
        {actions.map((act) => {
          const isSelected = selectedAction === act;
          return (
            <button
              key={act || 'all'}
              onClick={() => setSelectedAction(act)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: isSelected ? '1px solid var(--accent-gold)' : '1px solid var(--border-medium)',
                background: isSelected ? 'rgba(245, 208, 97, 0.15)' : 'transparent',
                color: isSelected ? 'var(--accent-gold)' : 'var(--text-secondary)',
              }}
            >
              {act || 'ALL ACTIONS'}
            </button>
          );
        })}
      </div>

      <Card>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-gold)' }} />
            <div>Loading audit records...</div>
          </div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
            No audit records matching criteria.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 14px' }}>Timestamp</th>
                  <th style={{ padding: '12px 14px' }}>Action</th>
                  <th style={{ padding: '12px 14px' }}>Resource</th>
                  <th style={{ padding: '12px 14px' }}>User ID</th>
                  <th style={{ padding: '12px 14px' }}>Metadata Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={l.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                      {new Date(l.createdAt).toLocaleString()}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <Badge variant="gold">{l.action}</Badge>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#FFF' }}>
                      {l.resource || 'System'} {l.resourceId ? `(${l.resourceId})` : ''}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                      {l.userId}
                    </td>
                    <td style={{ padding: '10px 14px', color: 'var(--text-secondary)', fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {l.metadata ? JSON.stringify(l.metadata).slice(0, 80) : '—'}
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
