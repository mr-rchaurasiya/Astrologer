import { PlanetName, DashaPeriod } from '../types/astrology';

export type LifeCurveResolution = 'year' | 'quarter' | 'month';

export interface LifeCurveScores {
  overall: number; // 0–100 normalized score
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
  relationToNatalMoon: string; // e.g. "Sade Sati Peak", "Kendra", "Trikona", "Dusthana", "Neutral"
  description: string;
}

export interface LifeCurvePoint {
  date: string; // ISO 8601
  age: number; // in fractional years
  year: number;
  scores: LifeCurveScores;
  mahadasha: PlanetName;
  antardasha?: PlanetName;
  pratyantardasha?: PlanetName;
  majorTransits: TransitInfluenceSummary[];
  keyHighlight?: string;
}

export interface LifeCurveOptions {
  startYear?: number;
  endYear?: number;
  horizonYears?: number; // default 80
  resolution?: LifeCurveResolution; // default 'year'
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
