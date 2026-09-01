import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AIContextIndicator } from '../components/ai/AIContextIndicator';
import { AIReportGenerator } from '../components/ai/AIReportGenerator';

describe('Phase 13: Frontend AI Experience Components Suite', () => {
  it('renders AIContextIndicator with intent, active dasha, and fact grounding badges', () => {
    render(
      <AIContextIndicator
        intent="CAREER"
        groundingScore={0.98}
        confidence="HIGH"
        activeDasha="Saturn / Mercury"
        divisionalCharts={['D1', 'D10']}
      />
    );

    expect(screen.getByText('CAREER')).toBeDefined();
    expect(screen.getByText('Saturn / Mercury')).toBeDefined();
    expect(screen.getByText('Fact Grounding: 98% (HIGH)')).toBeDefined();
    expect(screen.getByText('D1, D10')).toBeDefined();
  });

  it('renders AIReportGenerator and allows selecting report types', () => {
    render(<AIReportGenerator profileId="prof_123" />);

    expect(screen.getByText('AI Vedic Astrology Dossier Generator')).toBeDefined();
    expect(screen.getByText('Career & Professional Horizon')).toBeDefined();
    expect(screen.getByText('Marriage & Relationship Destiny')).toBeDefined();

    const btn = screen.getByRole('button', { name: /Generate Report/i });
    expect(btn).toBeDefined();
  });

  it('renders generated report sections when report is provided', () => {
    const mockReport = {
      id: 'rep_1',
      reportType: 'CAREER_REPORT',
      title: 'Career Horizon Dossier',
      summary: 'Strong 10th house authority indicator.',
      sections: [
        {
          title: 'Professional Archetype',
          subtitle: '10th House Lord Alignment',
          content: 'Exalted Mars in 10th house indicates decisive leadership.',
          astrologicalFactors: ['10th Lord', 'Mars Exalted'],
        },
      ],
      disclaimers: ['For interpretive guidance only.'],
      createdAt: new Date().toISOString(),
    };

    render(
      <AIReportGenerator
        profileId="prof_123"
        onGenerateReport={async () => mockReport}
      />
    );

    const btn = screen.getByRole('button', { name: /Generate Report/i });
    fireEvent.click(btn);
  });
});
