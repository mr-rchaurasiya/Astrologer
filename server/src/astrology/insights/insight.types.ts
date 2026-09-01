export type InsightStrength = 'strong' | 'moderate' | 'subtle';

export type InsightCategory =
  | 'core_personality'
  | 'career_dharma'
  | 'relationship_harmony'
  | 'spiritual_evolution'
  | 'planetary_timing';

export interface SupportingFactor {
  dimension: string; // e.g. "D1 Lagna", "D9 Navamsha", "Vimshottari Dasha"
  detail: string;
}

export interface CorrelatedInsight {
  id: string;
  category: InsightCategory;
  title: string;
  observation: string;
  supportingFactors: SupportingFactor[];
  currentTimingFactor?: string;
  strength: InsightStrength;
  explanation: string;
}
