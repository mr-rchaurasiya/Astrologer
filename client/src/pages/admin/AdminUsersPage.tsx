import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, ArrowLeft } from 'lucide-react';
import { AdminApi } from '../../services/adminApi';
import { AdminUser } from '../../types/admin';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);

  const fetchUsers = async (p = 1, s = '') => {
    setLoading(true);
    try {
      const res = await AdminApi.getUsers(p, 20, s);
      if (res.success && res.data) {
        setUsers(res.data.users);
        setTotalPages(res.data.totalPages);
        setPage(res.data.page);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchUsers(1, search);
  };

  const handleToggleStatus = async (user: AdminUser) => {
    const newStatus = !user.isActive;
    if (!window.confirm(`Are you sure you want to ${newStatus ? 'activate' : 'deactivate'} user ${user.name}?`)) {
      return;
    }

    try {
      const res = await AdminApi.updateUserStatus(user.id, newStatus);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, isActive: newStatus } : u))
        );
      }
    } catch {
      // Handle error
    }
  };

  return (
    <div className="container" style={{ paddingTop: '32px', paddingBottom: '60px' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link to="/admin" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', textDecoration: 'none', fontSize: '0.85rem', marginBottom: '12px' }}>
          <ArrowLeft size={14} /> Back to Admin Hub
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: 700 }}>User Accounts Registry</h1>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', marginBottom: '24px', maxWidth: '500px' }}>
        <input
          type="text"
          className="input-field"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: '10px 14px' }}
        />
        <button type="submit" className="btn btn-gold" style={{ padding: '10px 18px' }}>
          <Search size={16} /> Search
        </button>
      </form>

      <Card>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px auto', color: 'var(--accent-gold)' }} />
            <div>Loading users...</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-medium)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '12px 16px' }}>User</th>
                  <th style={{ padding: '12px 16px' }}>Role</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Joined Date</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, color: '#FFF' }}>{u.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={u.role === 'admin' ? 'gold' : 'indigo'}>
                        {u.role.toUpperCase()}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <Badge variant={u.isActive ? 'emerald' : 'rose'}>
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </Badge>
                    </td>
                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                      {new Date(u.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleStatus(u)}
                          className="btn btn-outline"
                          style={{
                            padding: '6px 12px',
                            fontSize: '0.75rem',
                            color: u.isActive ? '#FCA5A5' : '#86EFAC',
                            borderColor: u.isActive ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                          }}
                        >
                          {u.isActive ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-subtle)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'right' }}>
          Page {page} of {totalPages}
        </div>
      </Card>
    </div>
  );
};
