import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { RecommendationCard } from '../components/recommendations/RecommendationCard';
import { RecommendationList } from '../components/recommendations/RecommendationList';
import { UsageSummaryCard } from '../components/analytics/UsageSummaryCard';
import { AIUsageCard } from '../components/analytics/AIUsageCard';
import { ActivityTimeline } from '../components/analytics/ActivityTimeline';

describe('Phase 9: Personalization & Analytics Frontend Components', () => {
  const mockRecommendation = {
    id: 'rec_1',
    type: 'dasha_transition' as const,
    title: 'Explore Jupiter Mahadasha',
    description: 'Native is currently under the expansive influence of Guru Mahadasha.',
    reason: 'Active Vimshottari period',
    priority: 'high' as const,
    action: {
      route: '/chat',
      label: 'Ask about Jupiter',
    },
    expiresAt: '2026-09-02T00:00:00.000Z',
    createdAt: '2026-09-01T00:00:00.000Z',
  };

  it('RecommendationCard renders title, description, badge, and action button', () => {
    render(
      <BrowserRouter>
        <RecommendationCard recommendation={mockRecommendation} />
      </BrowserRouter>
    );

    expect(screen.getByText('Explore Jupiter Mahadasha')).toBeDefined();
    expect(screen.getByText(/Guru Mahadasha/)).toBeDefined();
    expect(screen.getByText('HIGH')).toBeDefined();
    expect(screen.getByText('Ask about Jupiter')).toBeDefined();
  });

  it('RecommendationList renders list of recommendations with header', () => {
    render(
      <BrowserRouter>
        <RecommendationList recommendations={[mockRecommendation]} />
      </BrowserRouter>
    );

    expect(screen.getByText('Suggested Jyotish Insights')).toBeDefined();
    expect(screen.getByText('Explore Jupiter Mahadasha')).toBeDefined();
  });

  it('UsageSummaryCard renders quota progress bars for AI, reports, and profiles', () => {
    render(
      <UsageSummaryCard
        chatUsage={{ used: 3, total: 10 }}
        reportUsage={{ used: 1, total: 5 }}
        profileUsage={{ used: 2, total: 3 }}
        tier="Cosmic Pro"
      />
    );

    expect(screen.getByText('Subscription Resource Quotas')).toBeDefined();
    expect(screen.getByText('3 / 10')).toBeDefined();
    expect(screen.getByText('1 / 5')).toBeDefined();
    expect(screen.getByText('2 / 3')).toBeDefined();
  });

  it('AIUsageCard renders token metrics and estimated cost', () => {
    render(
      <AIUsageCard
        stats={{
          totalRequests: 42,
          successfulRequests: 42,
          failedRequests: 0,
          totalTokens: 125000,
          totalCostUsd: 0.0452,
          avgLatencyMs: 650,
        }}
      />
    );

    expect(screen.getByText('AI Intelligence & Token Telemetry')).toBeDefined();
    expect(screen.getByText('42')).toBeDefined();
    expect(screen.getByText('125,000')).toBeDefined();
    expect(screen.getByText('$0.0452')).toBeDefined();
  });

  it('ActivityTimeline renders recent activity events', () => {
    const activities = [
      {
        id: 'act_1',
        event: 'ai_chat_message',
        timestamp: new Date().toISOString(),
        metadata: { model: 'gpt-4o-mini' },
      },
    ];

    render(<ActivityTimeline activities={activities} />);

    expect(screen.getByText('Recent Platform Activity')).toBeDefined();
    expect(screen.getByText('Ai Chat Message')).toBeDefined();
  });
});
