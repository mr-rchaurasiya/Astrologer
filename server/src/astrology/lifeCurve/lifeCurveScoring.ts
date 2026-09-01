import { PlanetName, PlanetPosition, HouseInfo } from '../types/astrology';
import { LifeCurveScores, TransitInfluenceSummary } from './lifeCurve.types';

export interface NatalAstrologyProfile {
  ascendantSignNumber: number;
  moonSignNumber: number;
  planets: PlanetPosition[];
  houses: HouseInfo[];
}

export interface PlanetaryTransitPlacement {
  name: PlanetName;
  signNumber: number; // 1..12
  sign: string;
  isRetrograde: boolean;
}

// Classical natural benefic vs malefic tendencies in Vedic Astrology
const NATURAL_BENEFIC_WEIGHT: Record<PlanetName, number> = {
  Jupiter: 1.3,
  Venus: 1.25,
  Mercury: 1.1,
  Moon: 1.15,
  Sun: 1.0,
  Mars: 0.9,
  Saturn: 0.85,
  Rahu: 0.8,
  Ketu: 0.85,
};

// Dignity scoring modifier
const DIGNITY_SCORE_MULTIPLIER: Record<string, number> = {
  exalted: 1.3,
  moolatrikona: 1.2,
  own: 1.15,
  great_friend: 1.1,
  friend: 1.05,
  neutral: 1.0,
  enemy: 0.9,
  great_enemy: 0.8,
  debilitated: 0.7,
};

/**
 * Calculates houses relative to a reference sign (1-indexed, 1..12)
 */
export const getHouseFromReference = (targetSign: number, refSign: number): number => {
  let diff = (targetSign - refSign + 12) % 12;
  return diff === 0 ? 12 : diff + 1;
};

/**
 * Evaluates transit influences for major planets (Saturn, Jupiter, Rahu, Ketu)
 */
export const evaluateMajorTransits = (
  natal: NatalAstrologyProfile,
  transits: PlanetaryTransitPlacement[]
): {
  influences: TransitInfluenceSummary[];
  transitScoreModifier: number;
  dimensionalTransitBonus: Record<string, number>;
} => {
  const influences: TransitInfluenceSummary[] = [];
  let transitScoreModifier = 0;
  const dimensionalTransitBonus: Record<string, number> = {
    career: 0,
    finance: 0,
    relationships: 0,
    education: 0,
    healthAwareness: 0,
    spirituality: 0,
  };

  const saturn = transits.find((t) => t.name === 'Saturn');
  const jupiter = transits.find((t) => t.name === 'Jupiter');
  const rahu = transits.find((t) => t.name === 'Rahu');
  const ketu = transits.find((t) => t.name === 'Ketu');

  // 1. Saturn Transit Analysis (Sade Sati & Kantaka Shani)
  if (saturn) {
    const houseFromMoon = getHouseFromReference(saturn.signNumber, natal.moonSignNumber);
    const houseFromLagna = getHouseFromReference(saturn.signNumber, natal.ascendantSignNumber);

    if (houseFromMoon === 12) {
      influences.push({
        planet: 'Saturn',
        transitSign: saturn.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Sade Sati (Rising Phase)',
        description: 'Saturn transiting 12th from natal Moon: Initiates internal restructuring and introspection.',
      });
      transitScoreModifier -= 6;
      dimensionalTransitBonus.spirituality += 8;
      dimensionalTransitBonus.finance -= 5;
    } else if (houseFromMoon === 1) {
      influences.push({
        planet: 'Saturn',
        transitSign: saturn.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Sade Sati (Peak Phase)',
        description: 'Saturn transiting over natal Moon: Demands discipline, emotional maturity, and resilience.',
      });
      transitScoreModifier -= 8;
      dimensionalTransitBonus.spirituality += 10;
      dimensionalTransitBonus.healthAwareness -= 5;
    } else if (houseFromMoon === 2) {
      influences.push({
        planet: 'Saturn',
        transitSign: saturn.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Sade Sati (Setting Phase)',
        description: 'Saturn transiting 2nd from natal Moon: Gradual resolution of tests and stabilization of foundations.',
      });
      transitScoreModifier -= 4;
      dimensionalTransitBonus.finance += 2;
    } else if (houseFromMoon === 8) {
      influences.push({
        planet: 'Saturn',
        transitSign: saturn.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Ashtama Shani',
        description: 'Saturn transiting 8th from Moon: Deep transformational cycle encouraging careful deliberation.',
      });
      transitScoreModifier -= 7;
      dimensionalTransitBonus.spirituality += 8;
    } else if ([3, 6, 11].includes(houseFromMoon)) {
      // Upachaya houses from Moon are classical auspicious Gochara for Saturn
      influences.push({
        planet: 'Saturn',
        transitSign: saturn.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Auspicious Upachaya Transit',
        description: `Saturn in ${houseFromMoon}th from Moon: High perseverance, steady career endurance, and overcoming obstacles.`,
      });
      transitScoreModifier += 6;
      dimensionalTransitBonus.career += 8;
      dimensionalTransitBonus.finance += 6;
    }
  }

  // 2. Jupiter Transit Analysis (Classical Gochara)
  if (jupiter) {
    const houseFromMoon = getHouseFromReference(jupiter.signNumber, natal.moonSignNumber);
    const houseFromLagna = getHouseFromReference(jupiter.signNumber, natal.ascendantSignNumber);

    // Classical auspicious Gocharas for Jupiter: 2, 5, 7, 9, 11 from Moon
    if ([2, 5, 7, 9, 11].includes(houseFromMoon)) {
      influences.push({
        planet: 'Jupiter',
        transitSign: jupiter.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Auspicious Gochara Transit',
        description: `Jupiter transiting ${houseFromMoon}th from natal Moon: Enhances wisdom, expansion, and benevolent support.`,
      });
      transitScoreModifier += 8;
      dimensionalTransitBonus.career += 6;
      dimensionalTransitBonus.finance += 8;
      dimensionalTransitBonus.relationships += 6;
      dimensionalTransitBonus.education += 8;
      dimensionalTransitBonus.spirituality += 10;
    } else if ([1, 4, 10].includes(houseFromMoon)) {
      influences.push({
        planet: 'Jupiter',
        transitSign: jupiter.sign,
        transitHouse: houseFromLagna,
        relationToNatalMoon: 'Kendra Transit',
        description: `Jupiter in ${houseFromMoon}th from Moon: Brings prominent ethical leadership and professional visibility.`,
      });
      transitScoreModifier += 5;
      dimensionalTransitBonus.career += 7;
    }
  }

  // 3. Rahu & Ketu Nodal Transit Analysis
  if (rahu && ketu) {
    const rahuHouse = getHouseFromReference(rahu.signNumber, natal.moonSignNumber);
    if ([3, 6, 10, 11].includes(rahuHouse)) {
      influences.push({
        planet: 'Rahu',
        transitSign: rahu.sign,
        transitHouse: getHouseFromReference(rahu.signNumber, natal.ascendantSignNumber),
        relationToNatalMoon: 'Dynamic Growth Transit',
        description: `Rahu in ${rahuHouse}th from Moon: Amplifies ambitious drives and worldly breakthroughs.`,
      });
      transitScoreModifier += 4;
      dimensionalTransitBonus.career += 6;
    }
  }

  return { influences, transitScoreModifier, dimensionalTransitBonus };
};

/**
 * Calculates normalized Life Curve dimensional scores (0–100)
 */
export const calculateLifeCurveScores = (
  natal: NatalAstrologyProfile,
  mahadashaLord: PlanetName,
  antardashaLord?: PlanetName,
  transits: PlanetaryTransitPlacement[] = []
): { scores: LifeCurveScores; influences: TransitInfluenceSummary[] } => {
  // 1. Base score starts at neutral baseline 50
  let baseOverall = 50;

  // 2. Natal dignity and nature of Mahadasha lord
  const mahaPlanet = natal.planets.find((p) => p.name === mahadashaLord);
  const mahaDignity = mahaPlanet ? DIGNITY_SCORE_MULTIPLIER[mahaPlanet.dignity] || 1.0 : 1.0;
  const mahaNature = NATURAL_BENEFIC_WEIGHT[mahadashaLord] || 1.0;
  const mahaMultiplier = mahaDignity * mahaNature;

  // 3. Antardasha modifier
  let antarMultiplier = 1.0;
  if (antardashaLord) {
    const antarPlanet = natal.planets.find((p) => p.name === antardashaLord);
    const antarDignity = antarPlanet ? DIGNITY_SCORE_MULTIPLIER[antarPlanet.dignity] || 1.0 : 1.0;
    const antarNature = NATURAL_BENEFIC_WEIGHT[antardashaLord] || 1.0;
    antarMultiplier = (antarDignity * antarNature + 1.0) / 2.0;
  }

  // Combine Dasha weight (scaled relative to baseline)
  const dashaScoreShift = (mahaMultiplier * 0.65 + antarMultiplier * 0.35 - 1.0) * 28;

  // 4. Transit influences
  const { influences, transitScoreModifier, dimensionalTransitBonus } = evaluateMajorTransits(
    natal,
    transits
  );

  // 5. Compute raw dimension scores
  let overall = Math.round(baseOverall + dashaScoreShift + transitScoreModifier);

  // Dimensional variations based on ruling planets & transits
  let career = Math.round(
    50 +
      dashaScoreShift * (['Sun', 'Saturn', 'Mars', 'Jupiter', 'Mercury'].includes(mahadashaLord) ? 1.2 : 0.8) +
      dimensionalTransitBonus.career
  );

  let finance = Math.round(
    50 +
      dashaScoreShift * (['Jupiter', 'Venus', 'Mercury'].includes(mahadashaLord) ? 1.25 : 0.85) +
      dimensionalTransitBonus.finance
  );

  let relationships = Math.round(
    50 +
      dashaScoreShift * (['Venus', 'Jupiter', 'Moon'].includes(mahadashaLord) ? 1.3 : 0.8) +
      dimensionalTransitBonus.relationships
  );

  let education = Math.round(
    50 +
      dashaScoreShift * (['Mercury', 'Jupiter', 'Moon'].includes(mahadashaLord) ? 1.2 : 0.85) +
      dimensionalTransitBonus.education
  );

  let healthAwareness = Math.round(
    50 +
      dashaScoreShift * (['Sun', 'Mars', 'Jupiter'].includes(mahadashaLord) ? 1.1 : 0.9) +
      dimensionalTransitBonus.healthAwareness
  );

  let spirituality = Math.round(
    50 +
      dashaScoreShift * (['Jupiter', 'Ketu', 'Saturn', 'Sun'].includes(mahadashaLord) ? 1.35 : 0.75) +
      dimensionalTransitBonus.spirituality
  );

  // Clamp all scores strictly between 10 and 95 (leaving headroom for interpretive clarity)
  const clamp = (v: number) => Math.max(10, Math.min(95, v));

  return {
    scores: {
      overall: clamp(overall),
      career: clamp(career),
      finance: clamp(finance),
      relationships: clamp(relationships),
      education: clamp(education),
      healthAwareness: clamp(healthAwareness),
      spirituality: clamp(spirituality),
    },
    influences,
  };
};
