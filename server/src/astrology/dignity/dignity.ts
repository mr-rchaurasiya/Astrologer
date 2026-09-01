import { PlanetName, DignityType, ZodiacSignName } from '../types/astrology';

export interface DignityRule {
  exaltationSign: ZodiacSignName;
  exaltationDeepDegree: number;
  debilitationSign: ZodiacSignName;
  debilitationDeepDegree: number;
  ownSigns: ZodiacSignName[];
  moolatrikonaSign: ZodiacSignName;
  moolatrikonaRange: [number, number]; // degrees within sign
  friends: PlanetName[];
  neutrals: PlanetName[];
  enemies: PlanetName[];
}

export const PLANETARY_DIGNITY_RULES: Record<PlanetName, DignityRule> = {
  Sun: {
    exaltationSign: 'Aries',
    exaltationDeepDegree: 10,
    debilitationSign: 'Libra',
    debilitationDeepDegree: 10,
    ownSigns: ['Leo'],
    moolatrikonaSign: 'Leo',
    moolatrikonaRange: [0, 20],
    friends: ['Moon', 'Mars', 'Jupiter'],
    neutrals: ['Mercury'],
    enemies: ['Venus', 'Saturn', 'Rahu', 'Ketu'],
  },
  Moon: {
    exaltationSign: 'Taurus',
    exaltationDeepDegree: 3,
    debilitationSign: 'Scorpio',
    debilitationDeepDegree: 3,
    ownSigns: ['Cancer'],
    moolatrikonaSign: 'Taurus',
    moolatrikonaRange: [3, 30],
    friends: ['Sun', 'Mercury'],
    neutrals: ['Mars', 'Jupiter', 'Venus', 'Saturn'],
    enemies: ['Rahu', 'Ketu'],
  },
  Mars: {
    exaltationSign: 'Capricorn',
    exaltationDeepDegree: 28,
    debilitationSign: 'Cancer',
    debilitationDeepDegree: 28,
    ownSigns: ['Aries', 'Scorpio'],
    moolatrikonaSign: 'Aries',
    moolatrikonaRange: [0, 12],
    friends: ['Sun', 'Moon', 'Jupiter'],
    neutrals: ['Venus', 'Saturn'],
    enemies: ['Mercury', 'Rahu', 'Ketu'],
  },
  Mercury: {
    exaltationSign: 'Virgo',
    exaltationDeepDegree: 15,
    debilitationSign: 'Pisces',
    debilitationDeepDegree: 15,
    ownSigns: ['Gemini', 'Virgo'],
    moolatrikonaSign: 'Virgo',
    moolatrikonaRange: [15, 20],
    friends: ['Sun', 'Venus'],
    neutrals: ['Mars', 'Jupiter', 'Saturn'],
    enemies: ['Moon', 'Rahu', 'Ketu'],
  },
  Jupiter: {
    exaltationSign: 'Cancer',
    exaltationDeepDegree: 5,
    debilitationSign: 'Capricorn',
    debilitationDeepDegree: 5,
    ownSigns: ['Sagittarius', 'Pisces'],
    moolatrikonaSign: 'Sagittarius',
    moolatrikonaRange: [0, 10],
    friends: ['Sun', 'Moon', 'Mars'],
    neutrals: ['Saturn'],
    enemies: ['Mercury', 'Venus', 'Rahu', 'Ketu'],
  },
  Venus: {
    exaltationSign: 'Pisces',
    exaltationDeepDegree: 27,
    debilitationSign: 'Virgo',
    debilitationDeepDegree: 27,
    ownSigns: ['Taurus', 'Libra'],
    moolatrikonaSign: 'Libra',
    moolatrikonaRange: [0, 15],
    friends: ['Mercury', 'Saturn', 'Rahu', 'Ketu'],
    neutrals: ['Mars', 'Jupiter'],
    enemies: ['Sun', 'Moon'],
  },
  Saturn: {
    exaltationSign: 'Libra',
    exaltationDeepDegree: 20,
    debilitationSign: 'Aries',
    debilitationDeepDegree: 20,
    ownSigns: ['Capricorn', 'Aquarius'],
    moolatrikonaSign: 'Aquarius',
    moolatrikonaRange: [0, 20],
    friends: ['Mercury', 'Venus', 'Rahu'],
    neutrals: ['Jupiter'],
    enemies: ['Sun', 'Moon', 'Mars', 'Ketu'],
  },
  Rahu: {
    exaltationSign: 'Taurus',
    exaltationDeepDegree: 20,
    debilitationSign: 'Scorpio',
    debilitationDeepDegree: 20,
    ownSigns: ['Aquarius'],
    moolatrikonaSign: 'Gemini',
    moolatrikonaRange: [0, 30],
    friends: ['Venus', 'Saturn', 'Mercury'],
    neutrals: ['Jupiter'],
    enemies: ['Sun', 'Moon', 'Mars'],
  },
  Ketu: {
    exaltationSign: 'Scorpio',
    exaltationDeepDegree: 20,
    debilitationSign: 'Taurus',
    debilitationDeepDegree: 20,
    ownSigns: ['Scorpio'],
    moolatrikonaSign: 'Sagittarius',
    moolatrikonaRange: [0, 30],
    friends: ['Mars', 'Venus', 'Saturn'],
    neutrals: ['Jupiter', 'Mercury'],
    enemies: ['Sun', 'Moon'],
  },
};

/**
 * Evaluates the dignity of a planet in a sign and degree
 */
export const calculateDignity = (
  planet: PlanetName,
  sign: ZodiacSignName,
  signDegree: number,
  signLord: PlanetName
): DignityType => {
  const rule = PLANETARY_DIGNITY_RULES[planet];

  // 1. Exaltation Check
  if (sign === rule.exaltationSign) {
    return 'exalted';
  }

  // 2. Debilitation Check
  if (sign === rule.debilitationSign) {
    return 'debilitated';
  }

  // 3. Moolatrikona Check
  if (
    sign === rule.moolatrikonaSign &&
    signDegree >= rule.moolatrikonaRange[0] &&
    signDegree <= rule.moolatrikonaRange[1]
  ) {
    return 'moolatrikona';
  }

  // 4. Own Sign Check
  if (rule.ownSigns.includes(sign)) {
    return 'own';
  }

  // 5. Check relationship with sign lord
  if (rule.friends.includes(signLord)) {
    return 'friend';
  }

  if (rule.enemies.includes(signLord)) {
    return 'enemy';
  }

  return 'neutral';
};
