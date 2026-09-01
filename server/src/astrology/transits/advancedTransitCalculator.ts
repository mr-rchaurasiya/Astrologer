import {
  PlanetName,
  PlanetPosition,
  AscendantInfo,
  AdvancedTransitResult,
  SadeSatiInfo,
  ZodiacSignName,
} from '../types/astrology';
import { calculateLahiriAyanamsa } from '../ephemeris/ayanamsa';
import { dateToJulianDay } from '../coordinates/time';
import { calculatePlanetaryPositions } from '../ephemeris/planetaryPositions';
import { getSignByNumber } from '../zodiac/signs';

export class AdvancedTransitCalculator {
  /**
   * Calculates comprehensive Gochar transits against a natal birth chart for any target date
   */
  public static calculateTransits(
    natalAscendant: AscendantInfo,
    natalPlanets: PlanetPosition[],
    targetDate: Date = new Date()
  ): AdvancedTransitResult {
    const jd = dateToJulianDay(targetDate);
    const ayanamsa = calculateLahiriAyanamsa(jd);

    // Calculate transit planetary positions
    const transitPlanets = calculatePlanetaryPositions(
      targetDate,
      jd,
      ayanamsa,
      natalAscendant.signNumber
    );

    const natalMoon = natalPlanets.find((p) => p.name === 'Moon')!;
    const transitSaturn = transitPlanets.find((p) => p.name === 'Saturn')!;
    const transitJupiter = transitPlanets.find((p) => p.name === 'Jupiter')!;

    // Helper: calculate house relative to reference sign
    const getHouseRelative = (targetSignNum: number, referenceSignNum: number): number => {
      return ((targetSignNum - referenceSignNum + 12) % 12) + 1;
    };

    // Evaluate Sade Sati (Saturn 12th, 1st, 2nd from Natal Moon)
    const saturnHouseFromMoon = getHouseRelative(transitSaturn.signNumber, natalMoon.signNumber);
    let sadeSati: SadeSatiInfo = {
      isActive: false,
      phase: 'None',
      saturnSign: transitSaturn.sign,
      moonSign: natalMoon.sign,
      description: 'Saturn is currently outside the 7.5-year Sade Sati zone from your natal Moon.',
    };

    if (saturnHouseFromMoon === 12) {
      sadeSati = {
        isActive: true,
        phase: 'Rising (12th)',
        saturnSign: transitSaturn.sign,
        moonSign: natalMoon.sign,
        description:
          'Rising Phase (12th from Moon): Initial changes, increased travel/expenditure, spiritual introspection.',
      };
    } else if (saturnHouseFromMoon === 1) {
      sadeSati = {
        isActive: true,
        phase: 'Peak (1st)',
        saturnSign: transitSaturn.sign,
        moonSign: natalMoon.sign,
        description:
          'Peak Phase (Janma Shani): Major life restructuring, heightened responsibilities, profound personal growth.',
      };
    } else if (saturnHouseFromMoon === 2) {
      sadeSati = {
        isActive: true,
        phase: 'Setting (2nd)',
        saturnSign: transitSaturn.sign,
        moonSign: natalMoon.sign,
        description:
          'Setting Phase (2nd from Moon): Financial stabilization, family realignment, gradual relief.',
      };
    }

    const isKantakaShani = saturnHouseFromMoon === 4 || saturnHouseFromMoon === 10;
    const isAshtamaShani = saturnHouseFromMoon === 8;

    // Jupiter auspicious houses from Moon: 2, 5, 7, 9, 11
    const jupiterHouseFromMoon = getHouseRelative(transitJupiter.signNumber, natalMoon.signNumber);
    const isJupiterAuspicious = [2, 5, 7, 9, 11].includes(jupiterHouseFromMoon);

    // Build planet list with houses from Lagna and Moon
    const planetResults = transitPlanets.map((tp) => {
      const houseFromLagna = getHouseRelative(tp.signNumber, natalAscendant.signNumber);
      const houseFromMoon = getHouseRelative(tp.signNumber, natalMoon.signNumber);

      // Check if transiting over any natal planet (same sign)
      const isNatalAspect = natalPlanets.some((np) => np.signNumber === tp.signNumber);

      return {
        name: tp.name,
        sign: tp.sign,
        signNumber: tp.signNumber,
        degree: tp.signDegree,
        houseFromLagna,
        houseFromMoon,
        retrograde: tp.retrograde,
        isNatalAspect,
      };
    });

    // Detect active high-impact transit events
    const activeEvents: Array<{
      planet: PlanetName;
      eventType: 'Ingress' | 'Conjunction' | 'Opposite' | 'Kendra';
      description: string;
    }> = [];

    for (const tp of transitPlanets) {
      const np = natalPlanets.find((p) => p.name === tp.name);
      if (np && np.signNumber === tp.signNumber) {
        activeEvents.push({
          planet: tp.name,
          eventType: 'Conjunction',
          description: `Transit ${tp.name} is transiting over its natal position in ${tp.sign} (Return phase).`,
        });
      }
    }

    if (sadeSati.isActive) {
      activeEvents.push({
        planet: 'Saturn',
        eventType: 'Kendra',
        description: `Active Sade Sati (${sadeSati.phase}) in ${transitSaturn.sign}.`,
      });
    }

    if (isJupiterAuspicious) {
      activeEvents.push({
        planet: 'Jupiter',
        eventType: 'Ingress',
        description: `Jupiter transit through House ${jupiterHouseFromMoon} from Moon provides protective benefic grace.`,
      });
    }

    return {
      transitDate: targetDate.toISOString(),
      planets: planetResults,
      sadeSati,
      isAshtamaShani,
      isKantakaShani,
      isJupiterAuspicious,
      activeEvents,
    };
  }
}
