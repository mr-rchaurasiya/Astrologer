import { AstrologyChartOutput } from '../types/astrology';
import { CorrelatedInsight } from './insight.types';

export class InsightCorrelationRules {
  public static correlate(chart: AstrologyChartOutput): CorrelatedInsight[] {
    const insights: CorrelatedInsight[] = [];
    const ascendant = chart.ascendant;
    const moon = chart.planets.find((p) => p.name === 'Moon');
    const sun = chart.planets.find((p) => p.name === 'Sun');
    const jupiter = chart.planets.find((p) => p.name === 'Jupiter');
    const saturn = chart.planets.find((p) => p.name === 'Saturn');

    // 1. Lagna & Moon Harmonic Synthesis
    if (moon) {
      insights.push({
        id: `ins_lagna_moon_${ascendant.sign}_${moon.sign}`,
        category: 'core_personality',
        title: `${ascendant.sign} Ascendant with ${moon.sign} Moon Archetype`,
        observation: `External persona is structured through ${ascendant.sign} vitality while internal mental processing operates through ${moon.sign} emotional resonance.`,
        supportingFactors: [
          { dimension: 'D1 Lagna', detail: `Ascendant in ${ascendant.sign} at ${ascendant.signDegree.toFixed(2)}°` },
          { dimension: 'D1 Moon', detail: `Moon in ${moon.sign} in ${moon.nakshatra} (Pada ${moon.pada})` },
        ],
        strength: 'strong',
        explanation: 'In Vedic Astrology, the Lagna represents physical incarnation and conscious action, while the Moon represents the subconscious mind and instinctual responses.',
      });
    }

    // 2. Career & 10th House Correlation
    const house10 = chart.houses.find((h) => h.houseNumber === 10);
    if (house10) {
      const d10Placements = chart.divisionalCharts.d10.placements.filter((p) => p.house === 10 || p.house === 1);
      insights.push({
        id: `ins_career_10th_${house10.sign}`,
        category: 'career_dharma',
        title: `Karmasthana Influenced by ${house10.sign} & ${house10.lord}`,
        observation: `Professional initiatives resonate strongly with the energetic domain of ${house10.lord}, supported by D10 vocational potential.`,
        supportingFactors: [
          { dimension: 'D1 10th House', detail: `10th house cusp in ${house10.sign}, ruled by ${house10.lord}` },
          { dimension: 'D10 Dashamsha', detail: `Key career drivers in D10: ${d10Placements.map((p) => `${p.planet} in House ${p.house}`).join(', ') || 'Aligned'}` },
        ],
        strength: 'strong',
        explanation: 'The 10th house is the zenith of the chart, revealing societal contribution and leadership capacity.',
      });
    }

    // 3. Spiritual & Philosophical Evolution (9th House / Jupiter / D9)
    if (jupiter) {
      insights.push({
        id: `ins_dharma_jupiter_${jupiter.sign}`,
        category: 'spiritual_evolution',
        title: `Guru & Higher Discernment in ${jupiter.sign}`,
        observation: `Moral intellect (Buddhi) and quest for wisdom are guided by Jupiter's placement in ${jupiter.sign} (${jupiter.house ? `House ${jupiter.house}` : 'Natal Position'}).`,
        supportingFactors: [
          { dimension: 'D1 Jupiter', detail: `Jupiter seated in ${jupiter.sign} at ${jupiter.signDegree?.toFixed(2) || '0.00'}°` },
          { dimension: 'D9 Navamsha', detail: `Navamsha planetary dignity strengthens internal values` },
        ],
        strength: 'moderate',
        explanation: 'Jupiter is the natural significator (Karaka) of Dharma, higher learning, spirituality, and divine grace.',
      });
    }

    // 4. Current Vimshottari Timing Correlation
    const now = new Date();
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
      insights.push({
        id: `ins_timing_${activeMaha}`,
        category: 'planetary_timing',
        title: `Vimshottari Dasha Phase: ${activeMaha}-${activeAntar || activeMaha}`,
        observation: `The current planetary lifecycle triggers the archetypal portfolio of ${activeMaha}, activating corresponding natal house domains.`,
        supportingFactors: [
          { dimension: 'Vimshottari Mahadasha', detail: `Active Lord: ${activeMaha}` },
          { dimension: 'Vimshottari Antardasha', detail: `Sub-period Lord: ${activeAntar || 'Active'}` },
        ],
        currentTimingFactor: `${activeMaha} Mahadasha active currently`,
        strength: 'strong',
        explanation: 'Vimshottari Dasha reveals when specific natal potentials ripen into experience across the lifespan.',
      });
    }

    return insights;
  }
}
