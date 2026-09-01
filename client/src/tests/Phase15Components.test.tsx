import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SEOHead } from '../components/seo/SEOHead';
import { KundliOnlinePage } from '../pages/public/KundliOnlinePage';
import { BlogIndexPage } from '../pages/public/BlogIndexPage';
import { sanitizeAnalyticsProperties } from '../utils/analytics';
import { ExperimentManager } from '../utils/experimentation';
import { sanitizeParam } from '../utils/attribution';

// Mock Auth and Subscription context
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: 'Admin User', email: 'admin@vedic.com', role: 'admin' },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
  }),
}));

vi.mock('../context/SubscriptionContext', () => ({
  useSubscription: () => ({
    subscription: { plan: 'premium', status: 'active' },
    isPremium: true,
    refreshSubscription: vi.fn(),
  }),
}));

describe('Phase 15: Frontend SEO, Analytics & Growth Components Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders SEOHead and updates document title', () => {
    render(
      <SEOHead
        title="Vedic Astrology Intelligence"
        description="High precision calculations"
        canonical="https://astrologer.app/test"
      />
    );

    expect(document.title).toContain('Vedic Astrology Intelligence');
  });

  it('renders KundliOnlinePage with explanatory headlines and CTAs', () => {
    render(
      <MemoryRouter>
        <KundliOnlinePage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Free Online/i)).toBeDefined();
    expect(screen.getAllByText(/Vedic Kundli/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/3 Regional Chart Styles/i)).toBeDefined();
  });

  it('renders BlogIndexPage with search bar and category filters', () => {
    render(
      <MemoryRouter>
        <BlogIndexPage />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/Search articles.../i)).toBeDefined();
    expect(screen.getByText(/All Topics/i)).toBeDefined();
  });

  it('sanitizeAnalyticsProperties discards passwords and tokens while keeping safe metadata', () => {
    const raw = {
      plan: 'premium',
      password: 'SuperSecretPassword!',
      jwt: 'header.payload.sig',
      source: 'marketing_cta',
    };

    const sanitized = sanitizeAnalyticsProperties(raw);
    expect(sanitized.plan).toBe('premium');
    expect(sanitized.source).toBe('marketing_cta');
    expect(sanitized.password).toBeUndefined();
    expect(sanitized.jwt).toBeUndefined();
  });

  it('ExperimentManager returns deterministic variant for identical subject ID', () => {
    const config = {
      id: 'cta_button_color',
      name: 'CTA Button Color Experiment',
      variants: ['gold', 'emerald'],
    };

    const variant1 = ExperimentManager.getVariant(config, 'user_12345');
    const variant2 = ExperimentManager.getVariant(config, 'user_12345');
    expect(variant1).toBe(variant2);
  });

  it('sanitizeParam safely strips script injection tags', () => {
    expect(sanitizeParam('<script>alert(1)</script>')).toBe('scriptalert1script');
    expect(sanitizeParam('diwali_promo')).toBe('diwali_promo');
  });
});
