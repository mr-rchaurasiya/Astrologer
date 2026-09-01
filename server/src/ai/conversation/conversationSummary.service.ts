import { ChatMessage } from '../../models/ChatMessage';
import { ConversationSummary, IConversationSummary } from '../../models/ConversationSummary';
import { OpenAIProvider } from '../providers/OpenAIProvider';

export class ConversationSummaryService {
  private static provider = new OpenAIProvider();

  public static async generateAndSaveSummary(
    sessionId: string,
    userId: string,
    profileId?: string
  ): Promise<IConversationSummary | null> {
    const messages = await ChatMessage.find({ sessionId: sessionId as any, userId: userId as any })
      .sort({ createdAt: 1 })
      .limit(50);

    if (messages.length < 4) {
      return null;
    }

    const transcript = messages
      .map((m) => `${m.role.toUpperCase()}: ${m.content.slice(0, 350)}`)
      .join('\n');

    const prompt = `Analyze this Vedic astrology consultation and generate a structured JSON summary.
TRANSCRIPT:
${transcript}

Output ONLY valid JSON with keys:
{
  "summary": "Concise 2-3 sentence overview of the consultation",
  "keyTopics": ["Topic 1", "Topic 2"],
  "userQuestions": ["Main question asked"],
  "astrologySubjects": ["E.g. Saturn Sade Sati", "Jupiter Transit"],
  "decisions": ["Remedy recommended or action agreed upon"],
  "unresolvedQuestions": ["Any follow-up questions noted"]
}`;

    try {
      const response = await this.provider.generateResponse({
        messages: [{ role: 'user', content: prompt }],
        systemPrompt: 'You are an astrological consultation analyst. Always output pure valid JSON.',
        options: { temperature: 0.2, maxTokens: 400 },
      });

      let parsed: any;
      try {
        const jsonMatch = response.content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
      } catch {
        parsed = {
          summary: response.content.slice(0, 200),
          keyTopics: ['Vedic Astrology'],
          userQuestions: [],
          astrologySubjects: [],
          decisions: [],
          unresolvedQuestions: [],
        };
      }

      const existing = await ConversationSummary.findOne({ sessionId: sessionId as any, userId: userId as any });
      const version = existing ? existing.version + 1 : 1;

      const summaryDoc = await ConversationSummary.findOneAndUpdate(
        { sessionId: sessionId as any, userId: userId as any },
        {
          userId,
          sessionId,
          profileId,
          summary: parsed.summary || 'Astrological consultation summary',
          keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
          userQuestions: Array.isArray(parsed.userQuestions) ? parsed.userQuestions : [],
          astrologySubjects: Array.isArray(parsed.astrologySubjects) ? parsed.astrologySubjects : [],
          decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
          unresolvedQuestions: Array.isArray(parsed.unresolvedQuestions) ? parsed.unresolvedQuestions : [],
          version,
        },
        { upsert: true, new: true }
      );

      return summaryDoc;
    } catch {
      return null;
    }
  }

  public static async getSummary(sessionId: string, userId: string): Promise<IConversationSummary | null> {
    return ConversationSummary.findOne({ sessionId: sessionId as any, userId: userId as any });
  }
}
