import { ChatMessageDTO, AIRequestOptions, AIResponse, StreamChunk } from '../types/ai';

export interface AIProvider {
  name: string;

  /**
   * Generates a complete AI response.
   */
  generateResponse(params: {
    messages: ChatMessageDTO[];
    systemPrompt: string;
    options?: AIRequestOptions;
  }): Promise<AIResponse>;

  /**
   * Streams partial AI response tokens as they arrive.
   */
  streamResponse(params: {
    messages: ChatMessageDTO[];
    systemPrompt: string;
    options?: AIRequestOptions;
    onChunk: (chunk: StreamChunk) => void | Promise<void>;
  }): Promise<AIResponse>;
}
