export type ZodiacSignName =
  | 'Aries'
  | 'Taurus'
  | 'Gemini'
  | 'Cancer'
  | 'Leo'
  | 'Virgo'
  | 'Libra'
  | 'Scorpio'
  | 'Sagittarius'
  | 'Capricorn'
  | 'Aquarius'
  | 'Pisces';

export type PlanetName =
  | 'Sun'
  | 'Moon'
  | 'Mars'
  | 'Mercury'
  | 'Jupiter'
  | 'Venus'
  | 'Saturn'
  | 'Rahu'
  | 'Ketu';

export type DignityType =
  | 'exalted'
  | 'moolatrikona'
  | 'own'
  | 'great_friend'
  | 'friend'
  | 'neutral'
  | 'enemy'
  | 'great_enemy'
  | 'debilitated';

export interface PlanetPosition {
  name: PlanetName;
  longitude: number; // 0 to 360 sidereal longitude
  tropicalLongitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: ZodiacSignName;
  signNumber: number; // 1 to 12
  signDegree: number; // 0 to 30 within the sign
  house: number; // 1 to 12
  nakshatra: string;
  nakshatraNumber: number; // 1 to 27
  nakshatraLord: PlanetName;
  pada: number; // 1 to 4
  combust: boolean;
  distanceFromSun?: number;
  dignity: DignityType;
}

export interface AscendantInfo {
  longitude: number;
  tropicalLongitude: number;
  sign: ZodiacSignName;
  signNumber: number;
  signDegree: number;
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraLord: PlanetName;
  pada: number;
}

export interface HouseInfo {
  houseNumber: number; // 1 to 12
  sign: ZodiacSignName;
  signNumber: number;
  startDegree: number;
  midDegree: number;
  endDegree: number;
  lord: PlanetName;
  occupants: PlanetName[];
}

export interface DivisionalPlacement {
  planet: PlanetName | 'Ascendant';
  sign: ZodiacSignName;
  signNumber: number;
  degree: number;
  house: number;
}

export type DivisionalChartName =
  | 'D1'
  | 'D2'
  | 'D3'
  | 'D4'
  | 'D7'
  | 'D9'
  | 'D10'
  | 'D12'
  | 'D16'
  | 'D20'
  | 'D24'
  | 'D27'
  | 'D30'
  | 'D40'
  | 'D45'
  | 'D60';

export interface DivisionalChart {
  name: DivisionalChartName;
  title: string;
  ascendantSign: ZodiacSignName;
  ascendantSignNumber: number;
  placements: DivisionalPlacement[];
}

export interface VedicAspect {
  fromPlanet: PlanetName;
  toHouse: number;
  toSign: ZodiacSignName;
  targetPlanet?: PlanetName;
  aspectType: '7th' | '4th' | '8th' | '5th' | '9th' | '3rd' | '10th';
  strength: number; // 0 to 100%
}

export interface DashaPeriod {
  lord: PlanetName | string;
  startDate: string; // ISO date
  endDate: string;
  durationYears: number;
  subPeriods?: DashaPeriod[];
}

export interface VimshottariDashaTree {
  balanceAtBirthYears: number;
  startingLord: PlanetName;
  mahadashas: DashaPeriod[];
}

export interface YoginiDashaTree {
  startingLord: string;
  balanceAtBirthYears: number;
  mahadashas: DashaPeriod[];
}

export interface AshtottariDashaTree {
  startingLord: PlanetName;
  balanceAtBirthYears: number;
  mahadashas: DashaPeriod[];
}

export interface PanchangInfo {
  date: string;
  tithi: {
    number: number; // 1 to 30
    name: string;
    paksha: 'Shukla' | 'Krishna';
    percentage: number;
  };
  vara: {
    number: number; // 0 (Sun) to 6 (Sat)
    name: string;
    rulingPlanet: PlanetName;
  };
  nakshatra: {
    number: number;
    name: string;
    lord: PlanetName;
    degreeInNakshatra: number;
  };
  yoga: {
    number: number; // 1 to 27
    name: string;
  };
  karana: {
    number: number; // 1 to 60
    name: string;
    type: 'movable' | 'fixed';
  };
  sunTimes: {
    sunrise: string; // ISO string
    sunset: string; // ISO string
    solarNoon: string; // ISO string
    dayDurationMinutes: number;
  };
}

export interface TimeWindow {
  name: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
  type: 'auspicious' | 'inauspicious';
  description: string;
}

export interface MuhurtaInfo {
  date: string;
  rahuKaal: TimeWindow;
  gulikaKaal: TimeWindow;
  yamagandaKaal: TimeWindow;
  abhijitMuhurta: TimeWindow;
  brahmaMuhurta: TimeWindow;
}

export interface AstrologyChartOutput {
  birthInput: {
    dateOfBirth: string;
    timeOfBirth: string;
    latitude: number;
    longitude: number;
    timezone: string;
    timezoneOffset: number;
    utcDateTime: string;
    julianDay: number;
  };
  ayanamsa: {
    system: 'Lahiri';
    value: number; // degrees
    formatted: string;
  };
  ascendant: AscendantInfo;
  planets: PlanetPosition[];
  houses: HouseInfo[];
  divisionalCharts: {
    d1: DivisionalChart;
    d9: DivisionalChart;
    d10: DivisionalChart;
    [key: string]: DivisionalChart;
  };
  aspects: VedicAspect[];
  dashas: VimshottariDashaTree;
  panchang: PanchangInfo;
  muhurta: MuhurtaInfo;
  calculatedAt: string;
  calculationVersion: string;
  ephemerisVersion: string;
}

// --------------------------------------------------------------------------
// Phase 12 Types: Yogas, Ashtakavarga, Shadbala, Transits, Compatibility
// --------------------------------------------------------------------------

export type YogaCategory =
  | 'Raja Yoga'
  | 'Dhana Yoga'
  | 'Mahapurusha Yoga'
  | 'Vipareeta Raja Yoga'
  | 'Neecha Bhanga'
  | 'Solar/Lunar Yoga'
  | 'Auspicious Yoga'
  | 'Inauspicious Yoga';

export interface YogaResult {
  yogaId: string;
  name: string;
  category: YogaCategory;
  detected: boolean;
  strength: 'High' | 'Medium' | 'Low' | 'Potential';
  conditions: string[];
  explanation: string;
  supportingPlanets: PlanetName[];
  supportingHouses: number[];
}

export interface BhinnashtakavargaMatrix {
  planet: PlanetName;
  bindus: number[]; // 12 numbers for 12 signs (index 0 = Aries .. 11 = Pisces)
  totalBindus: number;
}

export interface AshtakavargaResult {
  bhinnashtakavarga: BhinnashtakavargaMatrix[];
  sarvashtakavarga: number[]; // 12 numbers for 12 signs summing to 337
  houseBindus: number[]; // 12 numbers for houses 1 to 12 from Lagna
  totalSavBindus: number;
  trikonaReducedSav?: number[];
  ekadhipatyaReducedSav?: number[];
}

export interface ShadbalaBreakdown {
  sthanaBala: number;
  digBala: number;
  kalaBala: number;
  cheshtaBala: number;
  naisargikaBala: number;
  drikBala: number;
  totalVirupas: number;
  totalRupas: number;
  requiredRupas: number;
  relativeStrengthRatio: number;
  rank: number;
}

export interface ShadbalaResult {
  scores: Record<PlanetName, ShadbalaBreakdown>;
  strongestPlanet: PlanetName;
  weakestPlanet: PlanetName;
}

export interface SadeSatiInfo {
  isActive: boolean;
  phase: 'Rising (12th)' | 'Peak (1st)' | 'Setting (2nd)' | 'None';
  saturnSign: ZodiacSignName;
  moonSign: ZodiacSignName;
  description: string;
}

export interface AdvancedTransitResult {
  transitDate: string;
  planets: Array<{
    name: PlanetName;
    sign: ZodiacSignName;
    signNumber: number;
    degree: number;
    houseFromLagna: number;
    houseFromMoon: number;
    retrograde: boolean;
    isNatalAspect: boolean;
  }>;
  sadeSati: SadeSatiInfo;
  isAshtamaShani: boolean;
  isKantakaShani: boolean;
  isJupiterAuspicious: boolean;
  activeEvents: Array<{
    planet: PlanetName;
    eventType: 'Ingress' | 'Conjunction' | 'Opposite' | 'Kendra';
    description: string;
  }>;
}

export interface AshtakootaFactor {
  name: string;
  maxScore: number;
  obtainedScore: number;
  description: string;
  status: 'excellent' | 'good' | 'average' | 'dosha';
}

export interface CompatibilityResult {
  totalScore: number;
  maxScore: 36;
  percentage: number;
  grade: 'Highly Auspicious' | 'Auspicious' | 'Moderate' | 'Challenging';
  factors: AshtakootaFactor[];
  kootas: {
    varna: AshtakootaFactor;
    vashya: AshtakootaFactor;
    tara: AshtakootaFactor;
    yoni: AshtakootaFactor;
    grahaMaitri: AshtakootaFactor;
    gana: AshtakootaFactor;
    bhakoot: AshtakootaFactor;
    nadi: AshtakootaFactor;
  };
  mangalDosha: {
    profile1Manglik: boolean;
    profile2Manglik: boolean;
    isCancelled: boolean;
    summary: string;
  };
  recommendation: string;
}

export interface AdvancedAstrologyAnalysis {
  calculationVersion: string;
  chart: AstrologyChartOutput;
  divisionalCharts: Record<DivisionalChartName, DivisionalChart>;
  dashas: {
    vimshottari: VimshottariDashaTree;
    yogini: YoginiDashaTree;
    ashtottari?: AshtottariDashaTree;
    activeDasha: {
      mahadasha: string;
      antardasha: string;
      pratyantardasha?: string;
      endDate: string;
    };
  };
  yogas: YogaResult[];
  ashtakavarga: AshtakavargaResult;
  shadbala: ShadbalaResult;
  transits: AdvancedTransitResult;
  insights: Array<{
    id: string;
    title: string;
    category: string;
    observation: string;
    confidence: 'high' | 'medium';
    supportingDivisionalCharts?: string[];
  }>;
  calculatedAt: string;
}
