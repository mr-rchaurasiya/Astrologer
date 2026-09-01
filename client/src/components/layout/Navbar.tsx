import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  MessageSquare,
  LayoutDashboard,
  LogOut,
  TrendingUp,
  Zap,
  FileText,
  ShieldCheck,
  Settings,
  Bookmark,
  Gift,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { useAuth } from '../../context/AuthContext';
import { useSubscription } from '../../context/SubscriptionContext';
import { NotificationBell } from '../notifications/NotificationBell';
import { ServerStatus } from '../../types';

interface NavbarProps {
  serverStatus?: ServerStatus;
  onOpenDrawer?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ serverStatus = 'checking', onOpenDrawer }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { isPremium } = useSubscription();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(7, 9, 14, 0.88)', backdropFilter: 'blur(16px)', borderBottom: '1px solid var(--border-subtle)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '70px' }}>
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.2) 0%, rgba(99, 102, 241, 0.2) 100%)',
            border: '1px solid var(--border-gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-gold)',
          }}>
            <Sparkles size={20} />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '0.04em', color: '#FFF' }}>
              ASTROLOGER<span style={{ color: 'var(--accent-gold)' }}> AI</span>
            </div>
            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Vedic Astrology Platform
            </div>
          </div>
        </Link>

        {/* Navigation Items (Only when authenticated) */}
        {isAuthenticated ? (
          <nav style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <Link
              to="/dashboard"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/dashboard') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/dashboard') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <LayoutDashboard size={14} /> Dashboard
            </Link>
            <Link
              to="/kundli"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/kundli') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/kundli') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <Compass size={14} /> Kundli
            </Link>
            <Link
              to="/analytics"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/analytics') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/analytics') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <TrendingUp size={14} /> Analytics
            </Link>
            <Link
              to="/reports"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/reports') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/reports') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <FileText size={14} /> Reports
            </Link>
            <Link
              to="/chat"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/chat') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/chat') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <MessageSquare size={14} /> AI Chat
            </Link>
            <Link
              to="/saved-consultations"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/saved-consultations') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/saved-consultations') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <Bookmark size={14} /> Saved
            </Link>
            <Link
              to="/referrals"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/referrals') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/referrals') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <Gift size={14} /> Invite
            </Link>
            <Link
              to="/subscription"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                color: isActive('/subscription') ? 'var(--accent-gold)' : 'var(--text-secondary)',
                textDecoration: 'none',
                fontSize: '0.825rem',
                fontWeight: 500,
                padding: '6px 8px',
                borderRadius: '6px',
                background: isActive('/subscription') ? 'rgba(245, 208, 97, 0.1)' : 'transparent',
              }}
            >
              <Zap size={14} color={isPremium ? 'var(--accent-gold)' : 'currentColor'} />
              {isPremium ? 'Premium' : 'Upgrade'}
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  color: isActive('/admin') ? 'var(--accent-gold)' : '#FDE047',
                  textDecoration: 'none',
                  fontSize: '0.825rem',
                  fontWeight: 600,
                  padding: '6px 8px',
                  borderRadius: '6px',
                  background: isActive('/admin') ? 'rgba(245, 208, 97, 0.15)' : 'rgba(245, 208, 97, 0.05)',
                  border: '1px solid rgba(245, 208, 97, 0.3)',
                }}
              >
                <ShieldCheck size={14} /> Admin
              </Link>
            )}
          </nav>
        ) : null}

        {/* Status, Notification Bell & Auth Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {serverStatus === 'healthy' && (
            <Badge variant="emerald" icon={<span className="live-dot" />}>
              API Live
            </Badge>
          )}

          {/* In-App Notification Bell */}
          {isAuthenticated && <NotificationBell />}

          {isAuthenticated && user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: '#FFF' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, rgba(245, 208, 97, 0.25) 0%, rgba(99, 102, 241, 0.25) 100%)',
                  border: '1px solid var(--border-gold)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--accent-gold)',
                }}>
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{user.name}</span>
              </Link>
              <Link
                to="/settings"
                className="btn btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}
                title="Account Settings"
              >
                <Settings size={14} />
              </Link>
              <button
                onClick={handleLogout}
                className="hidden md:inline-flex btn btn-outline"
                style={{ padding: '6px 10px', fontSize: '0.8rem', color: '#FCA5A5', borderColor: 'rgba(239, 68, 68, 0.3)' }}
                title="Sign Out"
              >
                <LogOut size={14} />
              </button>
              {onOpenDrawer && (
                <button
                  type="button"
                  onClick={onOpenDrawer}
                  className="md:hidden btn btn-outline"
                  style={{ padding: '6px 10px', fontSize: '0.8rem', color: 'var(--accent-gold)' }}
                  aria-label="Open Menu Drawer"
                >
                  <Settings size={14} />
                </button>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Link to="/login" className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                Sign In
              </Link>
              <Link to="/register" className="btn btn-gold" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
