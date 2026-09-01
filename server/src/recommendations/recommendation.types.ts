export type RecommendationType =
  | 'dasha_transition'
  | 'transit_alert'
  | 'house_focus'
  | 'nakshatra_deepdive'
  | 'report_generation'
  | 'life_curve_milestone'
  | 'panchang_alignment'
  | 'consultation_followup';

export type RecommendationPriority = 'high' | 'medium' | 'low';

export interface ActionPayload {
  route: string;
  label: string;
  params?: Record<string, any>;
}

export interface RecommendationItem {
  id: string;
  type: RecommendationType;
  title: string;
  description: string;
  reason: string;
  priority: RecommendationPriority;
  relatedProfileId?: string;
  relatedAstrologyObject?: {
    type: 'planet' | 'house' | 'sign' | 'dasha' | 'transit';
    name: string;
  };
  action: ActionPayload;
  expiresAt: string;
  createdAt: string;
}
