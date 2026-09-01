import { MemoryCategory, MemoryConfidenceLevel } from '../../models/AIMemory';

export interface MemoryCreateInput {
  userId: string;
  profileId?: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence?: number;
  confidenceLevel?: MemoryConfidenceLevel;
  source?: 'user_explicit' | 'inferred' | 'session_summary';
  expiresAt?: Date;
}

export interface MemoryUpdateInput {
  value?: string;
  confidence?: number;
  confidenceLevel?: MemoryConfidenceLevel;
  category?: MemoryCategory;
}

export interface SanitizedMemoryDTO {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;
  confidenceLevel: MemoryConfidenceLevel;
  source: string;
  lastUsedAt: string;
  createdAt: string;
}

export interface MemoryContextSnippet {
  category: MemoryCategory;
  key: string;
  value: string;
}
