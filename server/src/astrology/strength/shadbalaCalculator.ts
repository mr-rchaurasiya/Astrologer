import {
  PlanetName,
  PlanetPosition,
  AscendantInfo,
  HouseInfo,
  ShadbalaResult,
  ShadbalaBreakdown,
} from '../types/astrology';

// Deep Exaltation Longitudes (Sidereal Degrees)
const EXALTATION_DEGREES: Record<PlanetName, number> = {
  Sun: 10,        // 10° Aries
  Moon: 33,       // 3° Taurus
  Mars: 298,      // 28° Capricorn
  Mercury: 165,   // 15° Virgo
  Jupiter: 95,    // 5° Cancer
  Venus: 357,     // 27° Pisces
  Saturn: 200,    // 20° Libra
  Rahu: 45,       // 15° Taurus
  Ketu: 225,      // 15° Scorpio
};

// Natural Strength (Naisargika Bala in Virupas)
const NAISARGIKA_BALA: Record<PlanetName, number> = {
  Sun: 60.0,
  Moon: 51.43,
  Venus: 42.86,
  Jupiter: 34.29,
  Mercury: 25.71,
  Mars: 17.14,
  Saturn: 8.57,
  Rahu: 0,
  Ketu: 0,
};

// Required Minimum Rupas for Potency
const REQUIRED_RUPAS: Record<PlanetName, number> = {
  Sun: 6.5,     // 390 Virupas
  Moon: 6.0,    // 360 Virupas
  Mars: 5.0,    // 300 Virupas
  Mercury: 7.0, // 420 Virupas
  Jupiter: 6.5, // 390 Virupas
  Venus: 5.5,   // 330 Virupas
  Saturn: 5.0,  // 300 Virupas
  Rahu: 5.0,
  Ketu: 5.0,
};

export class ShadbalaCalculator {
  /**
   * Calculates the complete 6-fold Shadbala strength for the 7 classical planets
   */
  public static calculate(
    ascendant: AscendantInfo,
    planets: PlanetPosition[],
    houses: HouseInfo[]
  ): ShadbalaResult {
    const mainPlanets: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const sun = planets.find((p) => p.name === 'Sun')!;
    const isDayBirth = sun.house >= 7 && sun.house <= 12; // Sun above horizon (Houses 7-12)

    const scores: Partial<Record<PlanetName, ShadbalaBreakdown>> = {};

    for (const planet of mainPlanets) {
      const p = planets.find((x) => x.name === planet)!;

      // 1. Sthana Bala (Positional Strength)
      // a) Uchcha Bala (Exaltation strength: 0 to 60 virupas)
      const exaltLong = EXALTATION_DEGREES[planet];
      const debilLong = (exaltLong + 180) % 360;
      let distFromDebil = Math.abs(p.longitude - debilLong);
      if (distFromDebil > 180) distFromDebil = 360 - distFromDebil;
      const uchchaBala = Number((distFromDebil / 3).toFixed(2)); // max 60

      // b) Kendradi Bala (Kendra: 60, Panaphara: 30, Apoklima: 15)
      let kendradiBala = 15;
      if ([1, 4, 7, 10].includes(p.house)) kendradiBala = 60;
      else if ([2, 5, 8, 11].includes(p.house)) kendradiBala = 30;

      // c) Saptavargiya Dignity Points (approx. 45 to 150 virupas)
      let saptavargiyaBala = 60;
      if (p.dignity === 'exalted') saptavargiyaBala = 135;
      else if (p.dignity === 'own') saptavargiyaBala = 105;
      else if (p.dignity === 'friend' || p.dignity === 'great_friend') saptavargiyaBala = 80;
      else if (p.dignity === 'neutral') saptavargiyaBala = 55;
      else if (p.dignity === 'enemy' || p.dignity === 'great_enemy') saptavargiyaBala = 30;
      else if (p.dignity === 'debilitated') saptavargiyaBala = 10;

      const sthanaBala = Number((uchchaBala + kendradiBala + saptavargiyaBala).toFixed(2));

      // 2. Dig Bala (Directional Strength: max 60 virupas)
      // Jupiter/Mercury: 1st house (East = 0°)
      // Sun/Mars: 10th house (South = 90°)
      // Saturn: 7th house (West = 180°)
      // Moon/Venus: 4th house (North = 270°)
      let optimalHouse = 1;
      if (['Jupiter', 'Mercury'].includes(planet)) optimalHouse = 1;
      else if (['Sun', 'Mars'].includes(planet)) optimalHouse = 10;
      else if (planet === 'Saturn') optimalHouse = 7;
      else if (['Moon', 'Venus'].includes(planet)) optimalHouse = 4;

      let houseDist = Math.abs(p.house - optimalHouse);
      if (houseDist > 6) houseDist = 12 - houseDist;
      const digBala = Number((60 * (1 - houseDist / 6)).toFixed(2));

      // 3. Kala Bala (Temporal Strength)
      // Nathonnatha Bala (Day/Night)
      let nathonnatha = 30;
      if (['Sun', 'Jupiter', 'Venus'].includes(planet)) {
        nathonnatha = isDayBirth ? 60 : 15;
      } else if (['Moon', 'Mars', 'Saturn'].includes(planet)) {
        nathonnatha = !isDayBirth ? 60 : 15;
      } else {
        nathonnatha = 60; // Mercury
      }
      const kalaBala = Number((nathonnatha + 45).toFixed(2)); // baseline temporal score

      // 4. Cheshta Bala (Motional Strength)
      let cheshtaBala = 30;
      if (p.retrograde) cheshtaBala = 60;
      else if (planet === 'Sun' || planet === 'Moon') cheshtaBala = 45;

      // 5. Naisargika Bala (Natural Strength)
      const naisargikaBala = NAISARGIKA_BALA[planet];

      // 6. Drik Bala (Aspectual Strength)
      // Benefic aspect boosts, malefic aspects slightly reduce
      const drikBala = p.house === 1 || p.house === 5 || p.house === 9 ? 25 : 10;

      // Totals
      const totalVirupas = Number(
        (sthanaBala + digBala + kalaBala + cheshtaBala + naisargikaBala + drikBala).toFixed(2)
      );
      const totalRupas = Number((totalVirupas / 60).toFixed(2));
      const requiredRupas = REQUIRED_RUPAS[planet];
      const relativeStrengthRatio = Number((totalRupas / requiredRupas).toFixed(2));

      scores[planet] = {
        sthanaBala,
        digBala,
        kalaBala,
        cheshtaBala,
        naisargikaBala,
        drikBala,
        totalVirupas,
        totalRupas,
        requiredRupas,
        relativeStrengthRatio,
        rank: 1, // Will be sorted below
      };
    }

    // Rank planets by relativeStrengthRatio descending
    const sortedPlanets = [...mainPlanets].sort(
      (a, b) => scores[b]!.relativeStrengthRatio - scores[a]!.relativeStrengthRatio
    );

    sortedPlanets.forEach((planetName, index) => {
      scores[planetName]!.rank = index + 1;
    });

    return {
      scores: scores as Record<PlanetName, ShadbalaBreakdown>,
      strongestPlanet: sortedPlanets[0],
      weakestPlanet: sortedPlanets[sortedPlanets.length - 1],
    };
  }
}
