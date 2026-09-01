import { PlanetName, AstrologyChartOutput } from '../types/astrology';
import { calculateTransits } from './transits';
import { ZODIAC_SIGNS } from '../zodiac/signs';

export type TransitEventType =
  | 'ingress'
  | 'retrograde'
  | 'direct'
  | 'natal_conjunction'
  | 'sade_sati'
  | 'aspect';

export interface TransitEvent {
  id: string;
  date: string; // ISO string
  planet: PlanetName;
  eventType: TransitEventType;
  fromSign?: string;
  toSign?: string;
  natalTarget?: string; // e.g. "Natal Moon", "Natal Lagna", "Natal Sun"
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

export interface TransitTimelineOptions {
  startDate?: Date;
  endDate?: Date;
  daysAhead?: number; // default 365 days
}

export interface TransitTimelineResult {
  profileId: string;
  startDate: string;
  endDate: string;
  events: TransitEvent[];
}

/**
 * Calculates a timeline of major astronomical transit events and natal comparisons
 */
export const calculateTransitTimeline = (
  profileId: string,
  natalChart: AstrologyChartOutput,
  options: TransitTimelineOptions = {}
): TransitTimelineResult => {
  const start = options.startDate || new Date();
  const daysAhead = options.daysAhead || 365;
  const end = options.endDate || new Date(start.getTime() + daysAhead * 24 * 3600 * 1000);

  const events: TransitEvent[] = [];

  const natalMoon = natalChart.planets.find((p) => p.name === 'Moon');
  const natalSun = natalChart.planets.find((p) => p.name === 'Sun');
  const natalLagnaSign = natalChart.ascendant.sign;

  // Sample intervals: Every 7 days across the window to detect major ingresses and stationing
  const stepDays = 7;
  let currentDate = new Date(start.getTime());

  // Track previous planetary signs and retrograde status for slow moving planets
  const trackedPlanets: PlanetName[] = ['Jupiter', 'Saturn', 'Rahu', 'Ketu', 'Mars'];
  let prevPositions: Map<PlanetName, { sign: string; signNumber: number; retrograde: boolean }> = new Map();

  while (currentDate <= end) {
    try {
      const transitData = calculateTransits(
        currentDate,
        natalChart.birthInput.latitude,
        natalChart.birthInput.longitude
      );

      for (const planet of transitData.planets) {
        if (!trackedPlanets.includes(planet.name)) continue;

        const prev = prevPositions.get(planet.name);
        const isoDate = currentDate.toISOString().split('T')[0];

        if (prev) {
          // 1. Sign Ingress Detection
          if (prev.sign !== planet.sign) {
            events.push({
              id: `ingress-${planet.name}-${isoDate}`,
              date: isoDate,
              planet: planet.name,
              eventType: 'ingress',
              fromSign: prev.sign,
              toSign: planet.sign,
              title: `${planet.name} enters ${planet.sign}`,
              description: `${planet.name} transits from ${prev.sign} into ${planet.sign}, shifting house influences.`,
              significance: ['Jupiter', 'Saturn', 'Rahu', 'Ketu'].includes(planet.name) ? 'high' : 'medium',
            });
          }

          // 2. Retrograde Stationing Detection
          if (!prev.retrograde && planet.retrograde) {
            events.push({
              id: `retro-${planet.name}-${isoDate}`,
              date: isoDate,
              planet: planet.name,
              eventType: 'retrograde',
              toSign: planet.sign,
              title: `${planet.name} turns Retrograde in ${planet.sign}`,
              description: `${planet.name} begins its retrograde motion in ${planet.sign} (${planet.signDegree.toFixed(1)}°), calling for review.`,
              significance: ['Jupiter', 'Saturn'].includes(planet.name) ? 'high' : 'medium',
            });
          } else if (prev.retrograde && !planet.retrograde) {
            events.push({
              id: `direct-${planet.name}-${isoDate}`,
              date: isoDate,
              planet: planet.name,
              eventType: 'direct',
              toSign: planet.sign,
              title: `${planet.name} turns Direct in ${planet.sign}`,
              description: `${planet.name} resumes forward direct motion in ${planet.sign}, restoring forward momentum.`,
              significance: ['Jupiter', 'Saturn'].includes(planet.name) ? 'high' : 'medium',
            });
          }
        }

        // 3. Natal Conjunction Detection (when planet enters same sign as Natal Moon or Lagna)
        if (prev && prev.sign !== planet.sign) {
          if (natalMoon && planet.sign === natalMoon.sign) {
            if (planet.name === 'Saturn') {
              events.push({
                id: `sade-sati-peak-${isoDate}`,
                date: isoDate,
                planet: 'Saturn',
                eventType: 'sade_sati',
                natalTarget: 'Natal Moon (Rashi)',
                title: `Saturn enters Moon Sign (${natalMoon.sign}) — Peak Sade Sati`,
                description: `Saturn transits over natal Moon in ${natalMoon.sign}. A transformative period emphasizing inner resilience and patience.`,
                significance: 'high',
              });
            } else if (planet.name === 'Jupiter') {
              events.push({
                id: `guru-chandra-${isoDate}`,
                date: isoDate,
                planet: 'Jupiter',
                eventType: 'natal_conjunction',
                natalTarget: 'Natal Moon (Rashi)',
                title: `Jupiter transits over Natal Moon in ${natalMoon.sign}`,
                description: `Auspicious transit forming Gochara Gajakesari Yoga influence, supporting mental clarity, peace, and spiritual growth.`,
                significance: 'high',
              });
            }
          }

          if (planet.sign === natalLagnaSign && ['Jupiter', 'Saturn'].includes(planet.name)) {
            events.push({
              id: `transit-lagna-${planet.name}-${isoDate}`,
              date: isoDate,
              planet: planet.name,
              eventType: 'natal_conjunction',
              natalTarget: 'Natal Ascendant (Lagna)',
              title: `${planet.name} transits 1st House (Lagna in ${natalLagnaSign})`,
              description: `${planet.name} enters your 1st House, directly influencing your vitality, physical outlook, and major personal directions.`,
              significance: 'high',
            });
          }
        }

        // Update state
        prevPositions.set(planet.name, {
          sign: planet.sign,
          signNumber: planet.signNumber,
          retrograde: planet.retrograde,
        });
      }
    } catch {
      // Gracefully continue
    }

    currentDate = new Date(currentDate.getTime() + stepDays * 24 * 3600 * 1000);
  }

  // Deduplicate and sort events chronologically
  const uniqueEvents = Array.from(new Map(events.map((e) => [e.id, e])).values()).sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return {
    profileId,
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    events: uniqueEvents,
  };
};
