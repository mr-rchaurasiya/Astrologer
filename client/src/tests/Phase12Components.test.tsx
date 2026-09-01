import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { YogaList } from '../components/astrology/YogaList';
import { ShadbalaCard } from '../components/astrology/ShadbalaCard';
import { AshtakavargaTable } from '../components/astrology/AshtakavargaTable';
import { CompatibilityCalculator } from '../components/astrology/CompatibilityCalculator';

describe('Phase 12: Advanced Astrology Frontend Components Suite', () => {
  it('renders YogaList with detected classical yogas and strength badges', () => {
    const mockYogas = [
      {
        yogaId: 'gaja_kesari_yoga',
        name: 'Gaja Kesari Yoga',
        category: 'Raja Yoga',
        strength: 'High',
        conditions: ['Jupiter in Kendra from Moon'],
        explanation: 'Bestows wisdom, leadership, and public respect.',
        supportingPlanets: ['Jupiter', 'Moon'],
        supportingHouses: [1, 4],
      },
    ];

    render(<YogaList yogas={mockYogas} />);
    expect(screen.getByText('Classical Vedic Yogas (1 Detected)')).toBeDefined();
    expect(screen.getByText('Gaja Kesari Yoga')).toBeDefined();
    expect(screen.getByText('High Strength')).toBeDefined();
  });

  it('renders ShadbalaCard with ranked planetary strength scores', () => {
    const mockShadbala = {
      scores: {
        Jupiter: {
          sthanaBala: 150,
          digBala: 60,
          kalaBala: 75,
          cheshtaBala: 30,
          naisargikaBala: 34.29,
          drikBala: 25,
          totalVirupas: 374.29,
          totalRupas: 6.24,
          requiredRupas: 6.5,
          relativeStrengthRatio: 0.96,
          rank: 1,
        },
      },
      strongestPlanet: 'Jupiter',
      weakestPlanet: 'Saturn',
    };

    render(<ShadbalaCard shadbala={mockShadbala as any} />);
    expect(screen.getByText('Shadbala (Six-Fold Planetary Strength)')).toBeDefined();
    expect(screen.getAllByText('Jupiter').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('6.24 Rupas')).toBeDefined();
  });

  it('renders AshtakavargaTable with BAV planetary rows and SAV 337 totals', () => {
    const mockAshtakavarga = {
      bhinnashtakavarga: [
        {
          planet: 'Sun',
          bindus: [4, 5, 3, 4, 4, 5, 4, 3, 4, 5, 4, 3],
          totalBindus: 48,
        },
      ],
      sarvashtakavarga: [28, 29, 30, 27, 28, 29, 28, 27, 28, 29, 28, 27],
      houseBindus: [28, 29, 30, 27, 28, 29, 28, 27, 28, 29, 28, 27],
      totalSavBindus: 337,
    };

    render(<AshtakavargaTable ashtakavarga={mockAshtakavarga as any} />);
    expect(screen.getByText('Ashtakavarga (BAV & SAV System)')).toBeDefined();
    expect(screen.getByText('337 Bindus')).toBeDefined();
  });

  it('renders CompatibilityCalculator with 36-point score and Kuja Dosha check', () => {
    const mockCompatibility = {
      totalScore: 28,
      maxScore: 36 as const,
      percentage: 77.8,
      grade: 'Highly Auspicious',
      factors: [
        {
          name: 'Nadi (Physiological & Genetic Harmony)',
          maxScore: 8,
          obtainedScore: 8,
          description: 'Complete constitutional balance',
          status: 'excellent' as const,
        },
      ],
      kootas: {} as any,
      mangalDosha: {
        profile1Manglik: false,
        profile2Manglik: false,
        isCancelled: true,
        summary: 'Neither chart shows Kuja Dosha.',
      },
      recommendation: 'Strong mutual foundation.',
    };

    render(<CompatibilityCalculator compatibility={mockCompatibility as any} />);
    expect(screen.getByText('Highly Auspicious Match')).toBeDefined();
    expect(screen.getByText('77.8% Compatibility')).toBeDefined();
    expect(screen.getByText('Neither chart shows Kuja Dosha.')).toBeDefined();
  });
});
