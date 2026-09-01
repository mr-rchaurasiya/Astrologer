import { AstrologyChartOutput } from '../astrology/types/astrology';
import { RecommendationItem } from './recommendation.types';

export class RecommendationRulesEngine {
  public static evaluateChartRecommendations(
    profileId: string,
    profileName: string,
    chart: AstrologyChartOutput
  ): RecommendationItem[] {
    const recommendations: RecommendationItem[] = [];
    const now = new Date();
    const expiresTomorrow = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const createdAt = now.toISOString();

    // 1. Active Dasha Recommendation
    let activeMaha = '';
    let activeAntar = '';
    for (const m of chart.dashas.mahadashas) {
      const mStart = new Date(m.startDate);
      const mEnd = new Date(m.endDate);
      if (now >= mStart && now <= mEnd) {
        activeMaha = m.lord;
        if (m.subPeriods) {
          for (const a of m.subPeriods) {
            const aStart = new Date(a.startDate);
            const aEnd = new Date(a.endDate);
            if (now >= aStart && now <= aEnd) {
              activeAntar = a.lord;
              break;
            }
          }
        }
        break;
      }
    }

    if (activeMaha) {
      recommendations.push({
        id: `rec_dasha_${profileId}_${activeMaha}`,
        type: 'dasha_transition',
        title: `Explore Active ${activeMaha} Mahadasha`,
        description: `${profileName} is currently experiencing the ${activeMaha} Mahadasha${activeAntar ? ` (${activeAntar} Antardasha)` : ''}. Discover key themes and planetary alignments.`,
        reason: `Deterministic Vimshottari Dasha period ruled by ${activeMaha}.`,
        priority: 'high',
        relatedProfileId: profileId,
        relatedAstrologyObject: { type: 'dasha', name: activeMaha },
        action: {
          route: '/chat',
          label: `Ask about ${activeMaha} Dasha`,
          params: { prompt: `What should I expect during my active ${activeMaha} Mahadasha and ${activeAntar} Antardasha?` },
        },
        expiresAt: expiresTomorrow,
        createdAt,
      });
    }

    // 2. Career & Dharma House (10th House Placement)
    const house10 = chart.houses.find((h) => h.houseNumber === 10);
    if (house10) {
      recommendations.push({
        id: `rec_house10_${profileId}`,
        type: 'house_focus',
        title: 'Review 10th House Karma & Career',
        description: `Your 10th house is in ${house10.sign} ruled by ${house10.lord}. Analyze professional potential in your D10 Dashamsha chart.`,
        reason: '10th House Karmasthana represents profession, status, and life purpose.',
        priority: 'medium',
        relatedProfileId: profileId,
        relatedAstrologyObject: { type: 'house', name: 'House 10' },
        action: {
          route: '/kundli',
          label: 'View D10 Chart',
          params: { chartType: 'd10' },
        },
        expiresAt: expiresTomorrow,
        createdAt,
      });
    }

    // 3. Nakshatra Deep Dive
    const moon = chart.planets.find((p) => p.name === 'Moon');
    if (moon) {
      recommendations.push({
        id: `rec_nakshatra_${profileId}`,
        type: 'nakshatra_deepdive',
        title: `Janma Nakshatra: ${moon.nakshatra}`,
        description: `Your Moon is seated in ${moon.nakshatra} (Pada ${moon.pada}). Reflect on emotional instincts and innate lunar tendencies.`,
        reason: `Janma Nakshatra defines cognitive mind (Manas) and core karmic inclinations.`,
        priority: 'medium',
        relatedProfileId: profileId,
        relatedAstrologyObject: { type: 'planet', name: 'Moon' },
        action: {
          route: '/chat',
          label: 'Explore Nakshatra',
          params: { prompt: `Explain the deeper psychological archetype of my Moon in ${moon.nakshatra} Nakshatra.` },
        },
        expiresAt: expiresTomorrow,
        createdAt,
      });
    }

    // 4. Life Curve Analytics Recommendation
    recommendations.push({
      id: `rec_lifecurve_${profileId}`,
      type: 'life_curve_milestone',
      title: 'Analyze Multi-Decade Life Curve',
      description: 'Track overarching vitality, prosperity, and career trends across multiple decades with deterministic scoring.',
      reason: 'Algorithmic multi-factor harmonic synthesis across all 12 houses.',
      priority: 'low',
      relatedProfileId: profileId,
      action: {
        route: '/analytics',
        label: 'Open Life Curve',
      },
      expiresAt: expiresTomorrow,
      createdAt,
    });

    return recommendations;
  }
}
