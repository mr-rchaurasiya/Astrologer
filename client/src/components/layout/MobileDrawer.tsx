import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  TrendingUp,
  Bookmark,
  Gift,
  Zap,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { isPremium } = useSubscription();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    navigate('/login');
  };

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div className="mobile-drawer-overlay" onClick={onClose}>
      {/* Drawer Panel */}
      <aside
        aria-label="Mobile Navigation Menu"
        className="mobile-drawer-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'rgba(245, 208, 97, 0.15)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--accent-gold)',
                }}
              >
                <Sparkles size={18} />
              </div>
              <div>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
                  Menu
                </h4>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Menu"
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                padding: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <button
              type="button"
              onClick={() => handleNav('/analytics')}
              className="drawer-link"
            >
              <TrendingUp size={18} style={{ color: 'var(--color-success)' }} />
              <span>Life Curve Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/saved-consultations')}
              className="drawer-link"
            >
              <Bookmark size={18} style={{ color: 'var(--accent-cyan)' }} />
              <span>Saved Consultations</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/referrals')}
              className="drawer-link"
            >
              <Gift size={18} style={{ color: 'var(--accent-purple)' }} />
              <span>Referrals & Rewards</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/subscription')}
              className="drawer-link"
              style={{ color: 'var(--accent-gold)' }}
            >
              <Zap size={18} style={{ color: 'var(--accent-gold)' }} />
              <span>{isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/settings')}
              className="drawer-link"
            >
              <Settings size={18} style={{ color: 'var(--text-muted)' }} />
              <span>Settings & Preferences</span>
            </button>

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className="drawer-link"
                style={{ color: '#FCA5A5' }}
              >
                <ShieldCheck size={18} style={{ color: '#EF4444' }} />
                <span>Admin Dashboard</span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer with Logout */}
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <button
            type="button"
            onClick={handleLogout}
            className="drawer-link"
            style={{ color: '#F87171' }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
