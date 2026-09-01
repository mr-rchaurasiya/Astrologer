import { DivisionalChart, DivisionalChartName, PlanetName, ZodiacSignName } from '../types/astrology';
import { getSignByNumber, getSignFromLongitude, normalizeDegrees } from '../zodiac/signs';
import { getHouseFromAscendant } from '../houses/houses';

export interface DivisionalPointInput {
  name: PlanetName | 'Ascendant';
  longitude: number;
  signNumber: number;
  signDegree: number;
}

/**
 * Calculates D1 (Rashi / Primary Birth Chart)
 */
export const calculateD1Chart = (
  ascendant: { longitude: number; signNumber: number; sign: ZodiacSignName },
  planets: { name: PlanetName; longitude: number; signNumber: number; signDegree: number }[]
): DivisionalChart => {
  const placements = [
    {
      planet: 'Ascendant' as const,
      sign: ascendant.sign,
      signNumber: ascendant.signNumber,
      degree: ascendant.longitude % 30,
      house: 1,
    },
    ...planets.map((p) => ({
      planet: p.name,
      sign: getSignByNumber(p.signNumber).name,
      signNumber: p.signNumber,
      degree: p.signDegree,
      house: getHouseFromAscendant(p.signNumber, ascendant.signNumber),
    })),
  ];

  return {
    name: 'D1',
    title: 'Rashi Chart',
    ascendantSign: ascendant.sign,
    ascendantSignNumber: ascendant.signNumber,
    placements,
  };
};

/**
 * D2 (Hora - Wealth & Resources)
 * 2 parts of 15° each:
 * In Odd signs: 0-15° Sun (Leo = 5), 15-30° Moon (Cancer = 4)
 * In Even signs: 0-15° Moon (Cancer = 4), 15-30° Sun (Leo = 5)
 */
export const getHoraSignNumber = (signNumber: number, signDegree: number): number => {
  const isOdd = signNumber % 2 !== 0;
  const isFirstHalf = signDegree < 15;
  if (isOdd) {
    return isFirstHalf ? 5 : 4; // Sun (Leo) : Moon (Cancer)
  } else {
    return isFirstHalf ? 4 : 5; // Moon (Cancer) : Sun (Leo)
  }
};

/**
 * D3 (Drekkana - Siblings & Courage)
 * 3 parts of 10° each:
 * 0-10°: Same sign (1st)
 * 10-20°: 5th sign from it
 * 20-30°: 9th sign from it
 */
export const getDrekkanaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 10), 2);
  const offset = segment === 0 ? 0 : segment === 1 ? 4 : 8;
  return ((signNumber - 1 + offset) % 12) + 1;
};

/**
 * D4 (Chaturthamsa / Turyamsa - Fortune, Assets & Residence)
 * 4 parts of 7°30' (7.5°) each:
 * 0-7.5°: 1st sign
 * 7.5-15°: 4th sign
 * 15-22.5°: 7th sign
 * 22.5-30°: 10th sign
 */
export const getChaturthamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 7.5), 3);
  const offset = segment * 3; // 0, 3, 6, 9 (1st, 4th, 7th, 10th houses)
  return ((signNumber - 1 + offset) % 12) + 1;
};

/**
 * D7 (Saptamsa - Children & Progeny)
 * 7 parts of 4°17'8.57" (30/7°) each:
 * In Odd signs: starts from the sign itself
 * In Even signs: starts from the 7th sign from it
 */
export const getSaptamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / (30 / 7)), 6);
  const isOdd = signNumber % 2 !== 0;
  const baseSign = isOdd ? signNumber : ((signNumber - 1 + 6) % 12) + 1;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D9 (Navamsha - Dharma & Marriage)
 * 9 parts of 3°20' (3.33333333°) each:
 * Fire signs (1, 5, 9) start from Aries (1)
 * Earth signs (2, 6, 10) start from Capricorn (10)
 * Air signs (3, 7, 11) start from Libra (7)
 * Water signs (4, 8, 12) start from Cancer (4)
 */
export const getNavamshaSignNumber = (signNumber: number, signDegree: number): number => {
  const segmentIndex = Math.min(Math.floor(signDegree / (10 / 3)), 8);
  const elementGroup = ((signNumber - 1) % 4); // 0: Fire, 1: Earth, 2: Air, 3: Water

  let baseSign: number;
  switch (elementGroup) {
    case 0: baseSign = 1; break;  // Fire -> Aries
    case 1: baseSign = 10; break; // Earth -> Capricorn
    case 2: baseSign = 7; break;  // Air -> Libra
    case 3: baseSign = 4; break;  // Water -> Cancer
    default: baseSign = 1;
  }

  return ((baseSign - 1 + segmentIndex) % 12) + 1;
};

/**
 * D10 (Dashamsha - Career, Profession & Status)
 * 10 parts of 3° each:
 * Odd signs: start from sign itself
 * Even signs: start from 9th sign from itself
 */
export const getDashamshaSignNumber = (signNumber: number, signDegree: number): number => {
  const segmentIndex = Math.min(Math.floor(signDegree / 3.0), 9);
  const isOdd = signNumber % 2 !== 0;
  const baseSign = isOdd ? signNumber : ((signNumber - 1 + 8) % 12) + 1;
  return ((baseSign - 1 + segmentIndex) % 12) + 1;
};

/**
 * D12 (Dwadashamsa - Parents & Lineage)
 * 12 parts of 2°30' (2.5°) each:
 * Starts from the sign itself for all signs
 */
export const getDwadashamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 2.5), 11);
  return ((signNumber - 1 + segment) % 12) + 1;
};

/**
 * D16 (Shodasamsa / Kalamsa - Vehicles & Material Happiness)
 * 16 parts of 1°52'30" (1.875°) each:
 * Movable signs (1, 4, 7, 10): start from Aries (1)
 * Fixed signs (2, 5, 8, 11): start from Leo (5)
 * Dual signs (3, 6, 9, 12): start from Sagittarius (9)
 */
export const getShodasamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 1.875), 15);
  const modality = (signNumber - 1) % 3; // 0: Movable, 1: Fixed, 2: Dual
  const baseSign = modality === 0 ? 1 : modality === 1 ? 5 : 9;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D20 (Vimsamsa - Spiritual Progress & Worship)
 * 20 parts of 1°30' (1.5°) each:
 * Movable signs: start from Aries (1)
 * Fixed signs: start from Sagittarius (9)
 * Dual signs: start from Leo (5)
 */
export const getVimsamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 1.5), 19);
  const modality = (signNumber - 1) % 3;
  const baseSign = modality === 0 ? 1 : modality === 1 ? 9 : 5;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D24 (Chaturvimsamsa / Siddhamsa - Higher Learning & Intellect)
 * 24 parts of 1°15' (1.25°) each:
 * Odd signs: start from Leo (5)
 * Even signs: start from Cancer (4)
 */
export const getChaturvimsamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 1.25), 23);
  const isOdd = signNumber % 2 !== 0;
  const baseSign = isOdd ? 5 : 4;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D27 (Bhamsa / Saptavimsamsa - Strengths & General Fortunes)
 * 27 parts of 1°06'40" (30/27° = 1.111111°) each:
 * Fire signs: start from Aries (1)
 * Earth signs: start from Cancer (4)
 * Air signs: start from Libra (7)
 * Water signs: start from Capricorn (10)
 */
export const getBhamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / (30 / 27)), 26);
  const element = (signNumber - 1) % 4; // 0: Fire, 1: Earth, 2: Air, 3: Water
  const baseSign = element === 0 ? 1 : element === 1 ? 4 : element === 2 ? 7 : 10;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D30 (Trimsamsa - Evils, Misfortunes & Character)
 * Parashari 5 Unequal Divisions in 30°:
 * Odd Signs:
 *   0° - 5°: Mars (Aries = 1)
 *   5° - 10°: Saturn (Aquarius = 11)
 *   10° - 18°: Jupiter (Sagittarius = 9)
 *   18° - 25°: Mercury (Gemini = 3)
 *   25° - 30°: Venus (Libra = 7)
 * Even Signs:
 *   0° - 5°: Venus (Taurus = 2)
 *   5° - 12°: Mercury (Virgo = 6)
 *   12° - 20°: Jupiter (Pisces = 12)
 *   20° - 25°: Saturn (Capricorn = 10)
 *   25° - 30°: Mars (Scorpio = 8)
 */
export const getTrimsamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const isOdd = signNumber % 2 !== 0;
  if (isOdd) {
    if (signDegree < 5) return 1;   // Mars (Aries)
    if (signDegree < 10) return 11; // Saturn (Aquarius)
    if (signDegree < 18) return 9;  // Jupiter (Sagittarius)
    if (signDegree < 25) return 3;  // Mercury (Gemini)
    return 7;                       // Venus (Libra)
  } else {
    if (signDegree < 5) return 2;   // Venus (Taurus)
    if (signDegree < 12) return 6;  // Mercury (Virgo)
    if (signDegree < 20) return 12; // Jupiter (Pisces)
    if (signDegree < 25) return 10; // Saturn (Capricorn)
    return 8;                       // Mars (Scorpio)
  }
};

/**
 * D40 (Khavedamsa - Auspicious/Inauspicious Fruits)
 * 40 parts of 0°45' (0.75°) each:
 * Odd signs: start from Aries (1)
 * Even signs: start from Libra (7)
 */
export const getKhavedamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 0.75), 39);
  const isOdd = signNumber % 2 !== 0;
  const baseSign = isOdd ? 1 : 7;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D45 (Akshavedamsa - General Well-being & Character)
 * 45 parts of 0°40' (30/45° = 0.666667°) each:
 * Movable signs: start from Aries (1)
 * Fixed signs: start from Leo (5)
 * Dual signs: start from Sagittarius (9)
 */
export const getAkshavedamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / (30 / 45)), 44);
  const modality = (signNumber - 1) % 3;
  const baseSign = modality === 0 ? 1 : modality === 1 ? 5 : 9;
  return ((baseSign - 1 + segment) % 12) + 1;
};

/**
 * D60 (Shashtiamsa - Karma & Past Life Subtleties)
 * 60 parts of 0°30' (0.5°) each:
 * Starts from the sign itself and cycles through the 12 signs 5 times
 */
export const getShashtiamsaSignNumber = (signNumber: number, signDegree: number): number => {
  const segment = Math.min(Math.floor(signDegree / 0.5), 59);
  return ((signNumber - 1 + segment) % 12) + 1;
};

// Generic mapping function for any supported division
export const getDivisionalSignNumber = (
  division: DivisionalChartName,
  signNumber: number,
  signDegree: number
): number => {
  switch (division) {
    case 'D1': return signNumber;
    case 'D2': return getHoraSignNumber(signNumber, signDegree);
    case 'D3': return getDrekkanaSignNumber(signNumber, signDegree);
    case 'D4': return getChaturthamsaSignNumber(signNumber, signDegree);
    case 'D7': return getSaptamsaSignNumber(signNumber, signDegree);
    case 'D9': return getNavamshaSignNumber(signNumber, signDegree);
    case 'D10': return getDashamshaSignNumber(signNumber, signDegree);
    case 'D12': return getDwadashamsaSignNumber(signNumber, signDegree);
    case 'D16': return getShodasamsaSignNumber(signNumber, signDegree);
    case 'D20': return getVimsamsaSignNumber(signNumber, signDegree);
    case 'D24': return getChaturvimsamsaSignNumber(signNumber, signDegree);
    case 'D27': return getBhamsaSignNumber(signNumber, signDegree);
    case 'D30': return getTrimsamsaSignNumber(signNumber, signDegree);
    case 'D40': return getKhavedamsaSignNumber(signNumber, signDegree);
    case 'D45': return getAkshavedamsaSignNumber(signNumber, signDegree);
    case 'D60': return getShashtiamsaSignNumber(signNumber, signDegree);
    default: return signNumber;
  }
};

export const DIVISIONAL_TITLES: Record<DivisionalChartName, string> = {
  D1: 'Rashi Chart',
  D2: 'Hora (Wealth & Resources)',
  D3: 'Drekkana (Courage & Siblings)',
  D4: 'Chaturthamsa (Fortune & Assets)',
  D7: 'Saptamsa (Children & Progeny)',
  D9: 'Navamsha (Dharma & Marriage)',
  D10: 'Dashamsha (Career & Profession)',
  D12: 'Dwadashamsa (Parents & Lineage)',
  D16: 'Shodasamsa (Vehicles & Pleasures)',
  D20: 'Vimsamsa (Spiritual Progress)',
  D24: 'Chaturvimsamsa (Learning & Intellect)',
  D27: 'Bhamsa (Strengths & Vulnerabilities)',
  D30: 'Trimsamsa (Misfortunes & Evils)',
  D40: 'Khavedamsa (Auspicious Fruits)',
  D45: 'Akshavedamsa (Character & Conduct)',
  D60: 'Shashtiamsa (Root Karma & Destiny)',
};

/**
 * Universal calculation function for any Vedic Divisional Chart (Varga)
 */
export const calculateDivisionalChart = (
  ascendant: { longitude: number; signNumber: number; signDegree: number; sign: ZodiacSignName },
  planets: { name: PlanetName; longitude: number; signNumber: number; signDegree: number }[],
  division: DivisionalChartName
): DivisionalChart => {
  if (division === 'D1') {
    return calculateD1Chart(ascendant, planets);
  }

  const ascSignNum = getDivisionalSignNumber(division, ascendant.signNumber, ascendant.signDegree);
  const ascSign = getSignByNumber(ascSignNum).name;

  const placements = [
    {
      planet: 'Ascendant' as const,
      sign: ascSign,
      signNumber: ascSignNum,
      degree: ascendant.signDegree,
      house: 1,
    },
    ...planets.map((p) => {
      const pSignNum = getDivisionalSignNumber(division, p.signNumber, p.signDegree);
      return {
        planet: p.name,
        sign: getSignByNumber(pSignNum).name,
        signNumber: pSignNum,
        degree: p.signDegree,
        house: getHouseFromAscendant(pSignNum, ascSignNum),
      };
    }),
  ];

  return {
    name: division,
    title: DIVISIONAL_TITLES[division] || `${division} Divisional Chart`,
    ascendantSign: ascSign,
    ascendantSignNumber: ascSignNum,
    placements,
  };
};

// Shorthand helpers for backward compatibility
export const calculateD9Chart = (
  ascendant: { longitude: number; signNumber: number; signDegree: number; sign: ZodiacSignName },
  planets: { name: PlanetName; longitude: number; signNumber: number; signDegree: number }[]
): DivisionalChart => calculateDivisionalChart(ascendant, planets, 'D9');

export const calculateD10Chart = (
  ascendant: { longitude: number; signNumber: number; signDegree: number; sign: ZodiacSignName },
  planets: { name: PlanetName; longitude: number; signNumber: number; signDegree: number }[]
): DivisionalChart => calculateDivisionalChart(ascendant, planets, 'D10');

/**
 * Calculates the complete Shodashavarga (all 16 classical divisional charts)
 */
export const calculateAllDivisionalCharts = (
  ascendant: { longitude: number; signNumber: number; signDegree: number; sign: ZodiacSignName },
  planets: { name: PlanetName; longitude: number; signNumber: number; signDegree: number }[]
): Record<DivisionalChartName, DivisionalChart> => {
  const divisions: DivisionalChartName[] = [
    'D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12',
    'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60',
  ];

  const result: Partial<Record<DivisionalChartName, DivisionalChart>> = {};
  for (const div of divisions) {
    result[div] = calculateDivisionalChart(ascendant, planets, div);
  }

  return result as Record<DivisionalChartName, DivisionalChart>;
};
