import { PlanetName } from './index';

export type LifeCurveResolution = 'year' | 'quarter' | 'month';

export interface LifeCurveScores {
  overall: number;
  career: number;
  finance: number;
  relationships: number;
  education: number;
  healthAwareness: number;
  spirituality: number;
}

export interface TransitInfluenceSummary {
  planet: PlanetName;
  transitSign: string;
  transitHouse: number;
  relationToNatalMoon: string;
  description: string;
}

export interface LifeCurvePoint {
  date: string;
  age: number;
  year: number;
  scores: LifeCurveScores;
  mahadasha: PlanetName;
  antardasha?: PlanetName;
  pratyantardasha?: PlanetName;
  majorTransits: TransitInfluenceSummary[];
  keyHighlight?: string;
}

export interface LifeCurveResult {
  profileId: string;
  birthDate: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  resolution: LifeCurveResolution;
  points: LifeCurvePoint[];
  mahadashaTransitions: {
    lord: PlanetName;
    startDate: string;
    endDate: string;
    ageStart: number;
    ageEnd: number;
  }[];
  scoreDisclaimer: string;
}

export type TransitEventType =
  | 'ingress'
  | 'retrograde'
  | 'direct'
  | 'natal_conjunction'
  | 'sade_sati'
  | 'aspect';

export interface TransitEvent {
  id: string;
  date: string;
  planet: PlanetName;
  eventType: TransitEventType;
  fromSign?: string;
  toSign?: string;
  natalTarget?: string;
  title: string;
  description: string;
  significance: 'high' | 'medium' | 'low';
}

export interface TransitTimelineResult {
  profileId: string;
  startDate: string;
  endDate: string;
  events: TransitEvent[];
}

export type DailyInsightCategory =
  | 'overall'
  | 'career'
  | 'finance'
  | 'relationships'
  | 'learning'
  | 'spirituality';

export interface DailyInsightResponse {
  id?: string;
  profileId: string;
  date: string;
  category: DailyInsightCategory;
  content: string;
  cached: boolean;
  model: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}
