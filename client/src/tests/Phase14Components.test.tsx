import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { MobileBottomNav } from '../components/layout/MobileBottomNav';
import { MobileDrawer } from '../components/layout/MobileDrawer';
import { DeepLinkManager } from '../utils/deepLinks';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Mobile User', email: 'mobile@vedic.com', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

// Mock useSubscription
vi.mock('../context/SubscriptionContext', () => ({
  useSubscription: () => ({
    subscription: { plan: 'free', status: 'active' },
    isPremium: false,
    refreshSubscription: vi.fn(),
  }),
}));

describe('Phase 14: Mobile Navigation & Deep Link Suite', () => {
  it('renders MobileBottomNav with primary touch navigation buttons', () => {
    render(
      <MemoryRouter>
        <MobileBottomNav onOpenDrawer={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText('Home')).toBeDefined();
    expect(screen.getByText('Kundli')).toBeDefined();
    expect(screen.getByText('AI Chat')).toBeDefined();
    expect(screen.getByText('Reports')).toBeDefined();
    expect(screen.getByText('More')).toBeDefined();
  });

  it('renders MobileDrawer with secondary navigation links when open', () => {
    const handleClose = () => {};
    render(
      <MemoryRouter>
        <MobileDrawer isOpen={true} onClose={handleClose} />
      </MemoryRouter>
    );

    expect(screen.getByText('Life Curve Analytics')).toBeDefined();
    expect(screen.getByText('Saved Consultations')).toBeDefined();
    expect(screen.getByText('Referrals & Rewards')).toBeDefined();
    expect(screen.getByText('Settings & Preferences')).toBeDefined();
  });

  it('DeepLinkManager validates safe internal URLs and rejects external/script targets', () => {
    expect(DeepLinkManager.isSafeRedirectPath('/kundli')).toBe(true);
    expect(DeepLinkManager.isSafeRedirectPath('/chat')).toBe(true);
    expect(DeepLinkManager.isSafeRedirectPath('https://malicious.com')).toBe(false);
    expect(DeepLinkManager.isSafeRedirectPath('javascript:void(0)')).toBe(false);
  });
});
