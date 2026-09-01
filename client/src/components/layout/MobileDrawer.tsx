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
    <div className="fixed inset-0 z-[110] flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Panel */}
      <aside
        aria-label="Mobile Navigation Menu"
        className="relative w-[280px] max-w-[80vw] h-full bg-slate-950 border-l border-slate-800 p-5 flex flex-col justify-between shadow-2xl z-10 overflow-y-auto"
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white leading-none">Menu</h4>
                <span className="text-[11px] text-slate-400 truncate max-w-[140px] block mt-0.5">
                  {user?.email}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Menu"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Links */}
          <nav className="space-y-1">
            <button
              type="button"
              onClick={() => handleNav('/analytics')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Life Curve Analytics</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/saved-consultations')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
            >
              <Bookmark className="w-4 h-4 text-sky-400" />
              <span>Saved Consultations</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/referrals')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
            >
              <Gift className="w-4 h-4 text-purple-400" />
              <span>Referrals & Rewards</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/subscription')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-amber-300 hover:bg-amber-500/10 transition-colors text-left font-medium"
            >
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}</span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('/settings')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-slate-900 transition-colors text-left"
            >
              <Settings className="w-4 h-4 text-slate-400" />
              <span>Settings & Preferences</span>
            </button>

            {user?.role === 'admin' && (
              <button
                type="button"
                onClick={() => handleNav('/admin')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-rose-300 hover:bg-rose-950/30 transition-colors text-left font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-rose-400" />
                <span>Admin Dashboard</span>
              </button>
            )}
          </nav>
        </div>

        {/* Footer with Logout */}
        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-rose-400 hover:bg-rose-950/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </div>
  );
};
