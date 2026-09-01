import {
  PlanetName,
  ZodiacSignName,
  DignityType,
  DivisionalChartName,
  DivisionalChart,
  AstrologyChartOutput,
  YogaResult,
  ShadbalaResult,
  AshtakavargaResult,
  AdvancedTransitResult,
  CompatibilityResult,
} from '../../astrology/types/astrology';
import { PointContext } from '../types/ai';

export type AstrologyIntent =
  | 'GENERAL'
  | 'CAREER'
  | 'MARRIAGE'
  | 'RELATIONSHIP'
  | 'EDUCATION'
  | 'FINANCE'
  | 'HEALTH'
  | 'FAMILY'
  | 'CHILDREN'
  | 'TRAVEL'
  | 'SPIRITUALITY'
  | 'PERSONAL_GROWTH'
  | 'TIMING'
  | 'DASHA'
  | 'TRANSIT'
  | 'YOGA'
  | 'REMEDY'
  | 'COMPATIBILITY'
  | 'KUNDLI'
  | 'DIVISIONAL_CHART'
  | 'GENERAL_ASTROLOGY';

export interface GroundTruthFacts {
  ascendantSign: ZodiacSignName;
  ascendantDegree: number;
  ascendantLord: PlanetName;
  moonSign: ZodiacSignName;
  moonNakshatra: string;
  sunSign: ZodiacSignName;
  activeMahadasha: string;
  activeAntardasha?: string;
  activePratyantardasha?: string;
  planetSigns: Record<PlanetName, ZodiacSignName>;
  planetHouses: Record<PlanetName, number>;
  planetDignities: Record<PlanetName, DignityType>;
  detectedYogaNames: string[];
  sadeSatiActive: boolean;
  sadeSatiPhase?: string;
  strongestPlanet?: string;
  weakestPlanet?: string;
  totalSavBindus?: number;
}

export interface SelectiveAstrologyContext {
  contextVersion: string;
  intent: AstrologyIntent;
  intentConfidence: number;
  profile: {
    name: string;
    relationship: string;
    dateOfBirth: string;
    timeOfBirth: string;
    placeName: string;
    latitude: number;
    longitude: number;
    timezone: string;
  };
  ayanamsa: {
    system: string;
    formatted: string;
  };
  ascendant: {
    sign: ZodiacSignName;
    degree: number;
    nakshatra: string;
    pada: number;
    lord: PlanetName;
  };
  relevantPlanets: Array<{
    name: PlanetName;
    sign: ZodiacSignName;
    degree: number;
    house: number;
    nakshatra: string;
    pada: number;
    retrograde: boolean;
    combust: boolean;
    dignity: DignityType;
  }>;
  relevantHouses: Array<{
    houseNumber: number;
    sign: ZodiacSignName;
    lord: PlanetName;
    occupants: PlanetName[];
  }>;
  divisionalCharts: Partial<Record<DivisionalChartName, DivisionalChart>>;
  activeDasha?: {
    mahadasha: string;
    antardasha: string;
    pratyantardasha?: string;
    endDate?: string;
  };
  relevantYogas?: YogaResult[];
  shadbalaSummary?: {
    strongestPlanet: string;
    weakestPlanet: string;
    scores: Record<string, { totalRupas: number; rank: number; relativeStrengthRatio: number }>;
  };
  ashtakavargaSummary?: {
    houseBindus: number[];
    totalSavBindus: number;
  };
  transitSummary?: {
    sadeSati: {
      isActive: boolean;
      phase: string;
      description: string;
    };
    isKantakaShani: boolean;
    isAshtamaShani: boolean;
    isJupiterAuspicious: boolean;
    activeEvents?: any[];
  };
  compatibilitySummary?: CompatibilityResult;
  highlightedPoint?: {
    type: string;
    id: string;
    details: any;
  };
  userMemories?: Array<{
    category: string;
    key: string;
    value: string;
    confidence?: number;
  }>;
  personalization?: {
    responseStyle?: 'CONCISE' | 'BALANCED' | 'DETAILED' | 'EXPERT' | 'BEGINNER';
    language?: string;
    terminology?: 'traditional' | 'simplified';
  };
  conversationSummary?: string;
  groundTruth: GroundTruthFacts;
}
