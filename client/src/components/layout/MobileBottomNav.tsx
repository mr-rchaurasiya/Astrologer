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
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-slate-950/95 backdrop-blur-lg border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around shadow-2xl safe-area-pb"
      style={{ minHeight: '56px' }}
    >
      <Link
        to="/dashboard"
        aria-label="Dashboard"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
          isActive('/dashboard') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <LayoutDashboard className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Home</span>
      </Link>

      <Link
        to="/kundli"
        aria-label="Kundli Chart"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
          isActive('/kundli') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Compass className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Kundli</span>
      </Link>

      <Link
        to="/chat"
        aria-label="AI Astrologer Chat"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
          isActive('/chat') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
        </div>
        <span className="text-[10px] tracking-tight">AI Chat</span>
      </Link>

      <Link
        to="/reports"
        aria-label="Astrology Reports"
        className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg transition-colors ${
          isActive('/reports') ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <FileText className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">Reports</span>
      </Link>

      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open More Menu"
        className="flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Menu className="w-5 h-5 mb-0.5" />
        <span className="text-[10px] tracking-tight">More</span>
      </button>
    </nav>
  );
};
