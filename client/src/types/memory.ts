export type MemoryCategory =
  | 'preference'
  | 'communication_style'
  | 'astrology_interest'
  | 'frequently_asked_topic'
  | 'consultation_context'
  | 'language_preference'
  | 'learning_goal'
  | 'notification_preference';

export interface AIMemoryItem {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;
  source: string;
  lastUsedAt: string;
  createdAt: string;
}
