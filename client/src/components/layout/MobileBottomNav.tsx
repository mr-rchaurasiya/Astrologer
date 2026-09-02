import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Compass, MessageSquare, FileText, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  onOpenDrawer: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ onOpenDrawer }) => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return null;

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav aria-label="Mobile Bottom Navigation" className="mobile-bottom-nav">
      <Link
        to="/dashboard"
        aria-label="Dashboard"
        className={`mobile-nav-item ${isActive('/dashboard') ? 'active' : ''}`}
      >
        <LayoutDashboard size={20} />
        <span>Home</span>
      </Link>

      <Link
        to="/kundli"
        aria-label="Kundli Chart"
        className={`mobile-nav-item ${isActive('/kundli') ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Kundli</span>
      </Link>

      <Link
        to="/chat"
        aria-label="AI Astrologer Chat"
        className={`mobile-nav-item ${isActive('/chat') ? 'active' : ''}`}
      >
        <div style={{ position: 'relative', display: 'inline-flex' }}>
          <MessageSquare size={20} />
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '-4px',
              width: '7px',
              height: '7px',
              backgroundColor: 'var(--accent-gold)',
              borderRadius: '50%',
            }}
          />
        </div>
        <span>AI Chat</span>
      </Link>

      <Link
        to="/reports"
        aria-label="Astrology Reports"
        className={`mobile-nav-item ${isActive('/reports') ? 'active' : ''}`}
      >
        <FileText size={20} />
        <span>Reports</span>
      </Link>

      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open More Menu"
        className="mobile-nav-item"
      >
        <Menu size={20} />
        <span>More</span>
      </button>
    </nav>
  );
};
