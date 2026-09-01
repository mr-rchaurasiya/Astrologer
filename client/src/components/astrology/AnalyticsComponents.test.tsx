import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { LifeCurveChart } from './LifeCurveChart';
import { TransitTimeline } from './TransitTimeline';
import { PremiumGuard } from '../subscription/PremiumGuard';
import { LifeCurveResult, TransitTimelineResult } from '../../types/analytics';
import * as SubscriptionContext from '../../context/SubscriptionContext';

describe('Advanced Analytics & Subscription UI Components', () => {
  const mockLifeCurve: LifeCurveResult = {
    profileId: 'p1',
    birthDate: '1995-05-15T03:00:00.000Z',
    startDate: '1995-01-01T00:00:00.000Z',
    endDate: '2075-12-31T00:00:00.000Z',
    totalPoints: 81,
    resolution: 'year',
    points: [
      {
        date: '1995-01-01T00:00:00.000Z',
        age: 0,
        year: 1995,
        scores: {
          overall: 65,
          career: 55,
          finance: 60,
          relationships: 70,
          education: 68,
          healthAwareness: 60,
          spirituality: 50,
        },
        mahadasha: 'Saturn',
        majorTransits: [],
      },
      {
        date: '2025-01-01T00:00:00.000Z',
        age: 30,
        year: 2025,
        scores: {
          overall: 78,
          career: 82,
          finance: 80,
          relationships: 75,
          education: 72,
          healthAwareness: 70,
          spirituality: 65,
        },
        mahadasha: 'Mercury',
        majorTransits: [
          {
            planet: 'Jupiter',
            transitSign: 'Taurus',
            transitHouse: 1,
            relationToNatalMoon: 'Auspicious Gochara Transit',
            description: 'Jupiter transiting 1st house',
          },
        ],
      },
    ],
    mahadashaTransitions: [
      {
        lord: 'Saturn',
        startDate: '1995-01-01T00:00:00.000Z',
        endDate: '2005-01-01T00:00:00.000Z',
        ageStart: 0,
        ageEnd: 10,
      },
      {
        lord: 'Mercury',
        startDate: '2005-01-01T00:00:00.000Z',
        endDate: '2022-01-01T00:00:00.000Z',
        ageStart: 10,
        ageEnd: 27,
      },
    ],
    scoreDisclaimer: 'Visualization score disclaimer',
  };

  const mockTimelineEvents: TransitTimelineResult['events'] = [
    {
      id: 'e1',
      date: '2025-05-15',
      planet: 'Jupiter',
      eventType: 'ingress',
      fromSign: 'Taurus',
      toSign: 'Gemini',
      title: 'Jupiter enters Gemini',
      description: 'Jupiter transits into Gemini',
      significance: 'high',
    },
    {
      id: 'e2',
      date: '2025-07-20',
      planet: 'Saturn',
      eventType: 'retrograde',
      title: 'Saturn turns Retrograde in Pisces',
      description: 'Saturn begins retrograde cycle',
      significance: 'high',
    },
  ];

  it('LifeCurveChart renders SVG curve and handles dimension selection', () => {
    render(<LifeCurveChart data={mockLifeCurve} />);
    expect(screen.getByText('Life Trajectory Curve')).toBeDefined();
    expect(screen.getByText('Career')).toBeDefined();

    const careerBtn = screen.getByText('Career');
    fireEvent.click(careerBtn);
    expect(screen.getByText('Visualization score disclaimer')).toBeDefined();
  });

  it('TransitTimeline renders events and filters by planet', () => {
    render(
      <MemoryRouter>
        <TransitTimeline events={mockTimelineEvents} profileId="p1" />
      </MemoryRouter>
    );

    expect(screen.getByText('Jupiter enters Gemini')).toBeDefined();
    expect(screen.getByText('Saturn turns Retrograde in Pisces')).toBeDefined();

    // Filter to Jupiter only
    const jupiterBtn = screen.getByText('Jupiter');
    fireEvent.click(jupiterBtn);
    expect(screen.getByText('Jupiter enters Gemini')).toBeDefined();
  });

  it('PremiumGuard unlocks content when user is premium', () => {
    vi.spyOn(SubscriptionContext, 'useSubscription').mockReturnValue({
      subscription: null,
      isPremium: true,
      loading: false,
      refreshSubscription: vi.fn(),
      upgradeToPremium: vi.fn(),
    });

    render(
      <PremiumGuard featureName="High Res Life Curve">
        <div>Unlocked Premium Content</div>
      </PremiumGuard>
    );

    expect(screen.getByText('Unlocked Premium Content')).toBeDefined();
  });

  it('PremiumGuard displays lock screen and upgrade prompt when not premium', () => {
    vi.spyOn(SubscriptionContext, 'useSubscription').mockReturnValue({
      subscription: null,
      isPremium: false,
      loading: false,
      refreshSubscription: vi.fn(),
      upgradeToPremium: vi.fn(),
    });

    render(
      <MemoryRouter>
        <PremiumGuard featureName="High Res Life Curve">
          <div>Unlocked Premium Content</div>
        </PremiumGuard>
      </MemoryRouter>
    );

    expect(screen.getByText('High Res Life Curve')).toBeDefined();
    expect(screen.getByText('Premium Tier')).toBeDefined();
    expect(screen.getByText(/View Subscription Plans/i)).toBeDefined();
  });
});
