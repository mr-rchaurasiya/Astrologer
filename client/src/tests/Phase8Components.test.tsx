import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { SettingsPage } from '../pages/SettingsPage';

// Mock useAuth
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Devotee Native', email: 'native@vedic.com', role: 'user' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    updatePassword: vi.fn(),
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

// Mock AccountApi
vi.mock('../services/accountApi', () => ({
  AccountApi: {
    getAccountDetails: vi.fn().mockResolvedValue({
      success: true,
      data: {
        user: { id: 'u1', name: 'Devotee Native', email: 'native@vedic.com', role: 'user' },
        stats: { profileCount: 2, sessionCount: 5, reportCount: 1 },
        subscription: { plan: 'free', status: 'active' },
        preferences: { emailEnabled: true, inAppEnabled: true, dailyInsight: true, transitEvents: true },
      },
    }),
    exportData: vi.fn().mockResolvedValue(undefined),
    deleteAccount: vi.fn().mockResolvedValue({ success: true, data: { deleted: true } }),
  },
}));

describe('Phase 8: Frontend UI Components & Error Resilience', () => {
  describe('ErrorBoundary', () => {
    const ProblematicChild = () => {
      throw new Error('Simulation of catastrophic render failure');
    };

    it('catches render error and displays Vedic fallback UI', () => {
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ProblematicChild />
        </ErrorBoundary>
      );

      expect(screen.getByText('Cosmic Alignment Interrupted')).toBeDefined();
      expect(screen.getByText('Reload Application')).toBeDefined();

      spy.mockRestore();
    });
  });

  describe('SettingsPage', () => {
    it('renders Account Settings with profile data and navigation tabs', async () => {
      render(
        <BrowserRouter>
          <SettingsPage />
        </BrowserRouter>
      );

      expect(await screen.findByText('Account Settings')).toBeDefined();
      expect(screen.getByText('Profile & Overview')).toBeDefined();
      expect(screen.getByText('Security & Password')).toBeDefined();
      expect(screen.getByText('Notifications & Alerts')).toBeDefined();
      expect(screen.getByText('Privacy & Data Export')).toBeDefined();
    });
  });
});
