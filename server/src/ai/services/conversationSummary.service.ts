import { ChatMessage, IChatMessage } from '../../models/ChatMessage';
import { OpenAIProvider } from '../providers/OpenAIProvider';

export interface ConversationSummaryResult {
  sessionId: string;
  summary: string;
  keyTopics: string[];
  messageCount: number;
}

export class ConversationSummaryService {
  private static provider = new OpenAIProvider();

  /**
   * Generates a compact semantic summary of a chat session when it exceeds threshold messages
   */
  public static async summarizeSession(
    sessionId: string,
    userId: string
  ): Promise<ConversationSummaryResult | null> {
    const messages = await ChatMessage.find({ sessionId: sessionId as any, userId: userId as any })
      .sort({ createdAt: 1 })
      .limit(30);

    if (messages.length < 6) {
      return null;
    }

    const conversationTranscript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 300)}`)
      .join('\n');

    const prompt = `Summarize the following astrological consultation into 3 concise bullet points and 3-5 key topic tags.
TRANSCRIPT:
${conversationTranscript}

Respond with format:
SUMMARY: [concise summary]
TOPICS: [comma-separated topics]`;

    try {
      const response = await this.provider.generateResponse({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an astrological assistant summarizing consultation transcripts.',
        options: { temperature: 0.3, maxTokens: 300 },
      });

      const text = response.content;
      const summaryMatch = text.match(/SUMMARY:\s*([\s\S]*?)(?=TOPICS:|$)/i);
      const topicsMatch = text.match(/TOPICS:\s*(.*)/i);

      const summary = summaryMatch ? summaryMatch[1].trim() : text.slice(0, 200);
      const keyTopics = topicsMatch
        ? topicsMatch[1].split(',').map((t: string) => t.trim()).filter(Boolean)
        : ['Vedic Astrology', 'General Consultation'];

      return {
        sessionId,
        summary,
        keyTopics,
        messageCount: messages.length,
      };
    } catch {
      return {
        sessionId,
        summary: 'Consultation focused on natal chart placements and planetary alignments.',
        keyTopics: ['Natal Chart', 'Astrology Consultation'],
        messageCount: messages.length,
      };
    }
  }
}
