import {
  ZodiacSignName,
  PlanetName,
  DignityType,
  VedicAspect,
  DashaPeriod,
  PanchangInfo,
  MuhurtaInfo,
} from '../../astrology/types/astrology';

export type PointContextType = 'planet' | 'house' | 'nakshatra' | 'dasha' | 'chart';

export interface PointContext {
  type: PointContextType;
  id: string; // e.g. "Mars", "10", "Rohini", "Saturn"
  label?: string;
}

export interface SanitizedProfileDTO {
  name: string;
  relationship: string;
  dateOfBirth: string;
  timeOfBirth: string;
  placeName: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface PlanetPlacementDTO {
  name: PlanetName;
  sign: ZodiacSignName;
  degree: number;
  house: number;
  nakshatra: string;
  pada: number;
  speed: number;
  retrograde: boolean;
  combust: boolean;
  dignity: DignityType;
}

export interface HousePlacementDTO {
  houseNumber: number;
  sign: ZodiacSignName;
  lord: PlanetName;
  occupants: PlanetName[];
}

export interface DivisionalPlacementDTO {
  planet: PlanetName | 'Ascendant';
  sign: ZodiacSignName;
  house: number;
}

export interface AstrologyAIContext {
  contextVersion: string;
  profile: SanitizedProfileDTO;
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
  planets: PlanetPlacementDTO[];
  houses: HousePlacementDTO[];
  divisionalCharts: {
    d1: DivisionalPlacementDTO[];
    d9: DivisionalPlacementDTO[];
    d10: DivisionalPlacementDTO[];
  };
  aspects: VedicAspect[];
  activeDasha?: {
    mahadasha: string;
    antardasha?: string;
    pratyantardasha?: string;
  };
  panchangSummary?: {
    tithi: string;
    vara: string;
    nakshatra: string;
    yoga: string;
    karana: string;
  };
  highlightedPoint?: {
    type: PointContextType;
    id: string;
    details: any;
  };
  userMemories?: Array<{
    category: string;
    key: string;
    value: string;
  }>;
}

export interface ChatMessageDTO {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: Date;
}

export interface AIRequestOptions {
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
}

export interface AIResponseUsage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface AIResponse {
  id: string;
  content: string;
  model: string;
  usage?: AIResponseUsage;
  finishReason?: string;
  createdAt: Date;
}

export interface StreamChunk {
  text: string;
  isFinal: boolean;
  finishReason?: string;
}
