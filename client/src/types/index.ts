export type ServerStatus = 'healthy' | 'degraded' | 'unhealthy' | 'offline' | 'checking';

export interface ApiSuccessResponse<T = any> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorDetail {
  code: string;
  details?: any;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  error: ApiErrorDetail;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface HealthData {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type RelationshipType = 'self' | 'partner' | 'parent' | 'child' | 'sibling' | 'friend' | 'other';
export type GenderType = 'male' | 'female' | 'other' | 'undisclosed';

export interface BirthProfile {
  id: string;
  userId: string;
  name: string;
  relationship: RelationshipType;
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm:ss
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number;
  gender: GenderType;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponseData {
  user: User;
  accessToken: string;
}

// ----------------------------------------------------
// Astrology Engine Types
// ----------------------------------------------------

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
  longitude: number;
  tropicalLongitude: number;
  latitude: number;
  speed: number;
  retrograde: boolean;
  sign: ZodiacSignName;
  signNumber: number;
  signDegree: number;
  house: number;
  nakshatra: string;
  nakshatraNumber: number;
  nakshatraLord: PlanetName;
  pada: number;
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
  houseNumber: number;
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

export interface DivisionalChart {
  name: 'D1' | 'D9' | 'D10';
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
  strength: number;
}

export interface DashaPeriod {
  lord: PlanetName;
  startDate: string;
  endDate: string;
  durationYears: number;
  subPeriods?: DashaPeriod[];
}

export interface VimshottariDashaTree {
  balanceAtBirthYears: number;
  startingLord: PlanetName;
  mahadashas: DashaPeriod[];
}

export interface PanchangInfo {
  date: string;
  tithi: {
    number: number;
    name: string;
    paksha: 'Shukla' | 'Krishna';
    percentage: number;
  };
  vara: {
    number: number;
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
    number: number;
    name: string;
  };
  karana: {
    number: number;
    name: string;
    type: 'movable' | 'fixed';
  };
  sunTimes: {
    sunrise: string;
    sunset: string;
    solarNoon: string;
    dayDurationMinutes: number;
  };
}

export interface TimeWindow {
  name: string;
  startTime: string;
  endTime: string;
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
    value: number;
    formatted: string;
  };
  ascendant: AscendantInfo;
  planets: PlanetPosition[];
  houses: HouseInfo[];
  divisionalCharts: {
    d1: DivisionalChart;
    d9: DivisionalChart;
    d10: DivisionalChart;
  };
  aspects: VedicAspect[];
  dashas: VimshottariDashaTree;
  panchang: PanchangInfo;
  muhurta: MuhurtaInfo;
  calculatedAt: string;
  calculationVersion: string;
  ephemerisVersion: string;
}

export interface TransitOutput {
  timestamp: string;
  julianDay: number;
  ayanamsa: number;
  ascendant: AscendantInfo;
  planets: PlanetPosition[];
}
