export type PointContextType = 'planet' | 'house' | 'nakshatra' | 'dasha' | 'chart';

export interface PointContext {
  type: PointContextType;
  id: string; // e.g. "Mars", "10", "Rohini", "Saturn"
  label?: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  profileId: string;
  title: string;
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  userId: string;
  profileId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  contextType?: string;
  metadata?: {
    model?: string;
    promptVersion?: string;
    contextVersion?: string;
    responseTimeMs?: number;
    selectedPoint?: PointContext;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
  };
  createdAt: string;
}

export interface ChatResponseData {
  sessionId: string;
  sessionTitle: string;
  userMessage: ChatMessage;
  assistantMessage: ChatMessage;
}

export interface StreamChunkData {
  text?: string;
  isFinal?: boolean;
  finishReason?: string;
  sessionId?: string;
  sessionTitle?: string;
  assistantMessageId?: string;
  error?: string;
}
