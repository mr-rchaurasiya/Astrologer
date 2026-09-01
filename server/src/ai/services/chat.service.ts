import { Types } from 'mongoose';
import { ChatSession, IChatSession } from '../../models/ChatSession';
import { ChatMessage, IChatMessage } from '../../models/ChatMessage';
import { BirthProfile, IBirthProfile } from '../../models/BirthProfile';
import { AstrologyService } from '../../astrology/service/astrology.service';
import { aiService } from './ai.service';
import { PointContext, ChatMessageDTO, StreamChunk } from '../types/ai';
import { AuditLog } from '../../models/AuditLog';
import { AIMemoryService } from '../memory/memory.service';
import { AIUsageService } from '../usage/aiUsage.service';

export class ChatService {
  /**
   * Creates a new chat session for a birth profile.
   */
  public async createSession(
    userId: string,
    profileId: string,
    title?: string
  ): Promise<IChatSession> {
    // 1. Verify profile ownership
    const profile = await BirthProfile.findOne({
      _id: profileId,
      userId,
    });
    if (!profile) {
      throw new Error('Birth profile not found or unauthorized.');
    }

    // 2. Create session
    const session = await ChatSession.create({
      userId: new Types.ObjectId(userId),
      profileId: new Types.ObjectId(profileId),
      title: title || 'New Astrology Inquiry',
      lastMessageAt: new Date(),
    });

    return session;
  }

  /**
   * Retrieves all chat sessions for a user and profile.
   */
  public async getSessions(userId: string, profileId?: string): Promise<IChatSession[]> {
    const query: Record<string, any> = { userId };
    if (profileId) {
      query.profileId = profileId;
    }
    return ChatSession.find(query).sort({ updatedAt: -1 });
  }

  /**
   * Retrieves a single chat session by ID with ownership verification.
   */
  public async getSession(userId: string, sessionId: string): Promise<IChatSession> {
    const session = await ChatSession.findOne({
      _id: sessionId,
      userId,
    });
    if (!session) {
      throw new Error('Chat session not found or unauthorized.');
    }
    return session;
  }

  /**
   * Deletes a chat session and its associated messages.
   */
  public async deleteSession(userId: string, sessionId: string): Promise<void> {
    const session = await ChatSession.findOneAndDelete({
      _id: sessionId,
      userId,
    });
    if (!session) {
      throw new Error('Chat session not found or unauthorized.');
    }

    await ChatMessage.deleteMany({
      sessionId,
      userId,
    });
  }

  /**
   * Retrieves paginated messages for a session.
   */
  public async getMessages(
    userId: string,
    sessionId: string,
    limit = 50,
    before?: string
  ): Promise<{ messages: IChatMessage[]; total: number }> {
    // Verify session ownership first
    await this.getSession(userId, sessionId);

    const query: Record<string, any> = { sessionId, userId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const total = await ChatMessage.countDocuments({ sessionId, userId });
    const messages = await ChatMessage.find(query)
      .sort({ createdAt: 1 })
      .limit(limit);

    return { messages, total };
  }

  /**
   * Sends a user message, loads profile and calculated astrology context, and generates assistant response.
   */
  public async sendMessage(params: {
    userId: string;
    profileId: string;
    sessionId?: string;
    message: string;
    pointContext?: PointContext;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{ session: IChatSession; userMessage: IChatMessage; assistantMessage: IChatMessage }> {
    const startTime = Date.now();
    const { userId, profileId, message, pointContext, ipAddress, userAgent } = params;

    // 1. Verify profile ownership
    const profile = await BirthProfile.findOne({
      _id: profileId,
      userId,
    });
    if (!profile) {
      throw new Error('Birth profile not found or unauthorized.');
    }

    // 2. Load or create session
    let session: IChatSession;
    if (params.sessionId) {
      session = await this.getSession(userId, params.sessionId);
    } else {
      const generatedTitle =
        pointContext?.label ||
        (message.length > 40 ? `${message.substring(0, 37)}...` : message);
      session = await this.createSession(userId, profileId, generatedTitle);
    }

    // 3. Save User Message
    const userMessage = await ChatMessage.create({
      sessionId: session._id,
      userId: new Types.ObjectId(userId),
      profileId: new Types.ObjectId(profileId),
      role: 'user',
      content: message,
      contextType: pointContext ? 'point_and_ask' : 'general',
      metadata: pointContext ? { selectedPoint: pointContext } : undefined,
    });

    // 4. Retrieve recent message history for session
    const recentMessages = await ChatMessage.find({
      sessionId: session._id,
      userId,
    })
      .sort({ createdAt: 1 })
      .limit(20);

    const historyDTO: ChatMessageDTO[] = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));

    // 5. Deterministically calculate astrology data from backend single source of truth
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    // 6. Retrieve relevant user memories for personalized context
    const userMemories = await AIMemoryService.getRelevantContextSnippets(userId, 8).catch(() => []);

    // 7. Call AI Service
    try {
      const { response, promptVersion, contextVersion } =
        await aiService.generateAstrologyResponse({
          profile,
          chart,
          messages: historyDTO,
          pointContext,
          userMemories,
        });

      const latencyMs = Date.now() - startTime;

      // 8. Save Assistant Message
      const assistantMessage = await ChatMessage.create({
        sessionId: session._id,
        userId: new Types.ObjectId(userId),
        profileId: new Types.ObjectId(profileId),
        role: 'assistant',
        content: response.content,
        contextType: pointContext ? 'point_and_ask' : 'general',
        metadata: {
          model: response.model,
          promptVersion,
          contextVersion,
          responseTimeMs: latencyMs,
          selectedPoint: pointContext,
          tokenUsage: response.usage,
          intent: (response as any).intent,
          groundingScore: (response as any).groundingScore,
          confidence: (response as any).confidence,
        },
      });

      // 8. Update Session lastMessageAt and title if it was first message
      session.lastMessageAt = new Date();
      if (session.title === 'New Astrology Inquiry') {
        session.title =
          pointContext?.label ||
          (message.length > 40 ? `${message.substring(0, 37)}...` : message);
      }
      await session.save();

      // Audit Log
      await AuditLog.create({
        userId: new Types.ObjectId(userId),
        action: 'AI_CHAT_COMPLETED',
        resource: 'ChatSession',
        resourceId: session._id.toString(),
        ipAddress,
        userAgent,
        metadata: { latencyMs, pointContext: pointContext?.type },
      });

      // Log AI Usage Telemetry
      AIUsageService.logUsage({
        userId,
        endpoint: 'chat',
        model: response.model,
        promptTokens: response.usage?.promptTokens || 120,
        completionTokens: response.usage?.completionTokens || 80,
        latencyMs,
        success: true,
      }).catch(() => {});

      return { session, userMessage, assistantMessage };
    } catch (err: any) {
      AIUsageService.logUsage({
        userId,
        endpoint: 'chat',
        latencyMs: Date.now() - startTime,
        success: false,
        errorMessage: err.message,
      }).catch(() => {});

      await AuditLog.create({
        userId: new Types.ObjectId(userId),
        action: 'AI_CHAT_FAILED',
        resource: 'ChatSession',
        resourceId: session._id.toString(),
        ipAddress,
        userAgent,
        metadata: { error: err.message },
      });
      throw err;
    }
  }

  /**
   * Streams AI assistant response via callback chunks while persisting user and assistant messages.
   */
  public async streamMessage(params: {
    userId: string;
    profileId: string;
    sessionId?: string;
    message: string;
    pointContext?: PointContext;
    onChunk: (chunk: StreamChunk) => void | Promise<void>;
  }): Promise<{ session: IChatSession; userMessage: IChatMessage; assistantMessage: IChatMessage }> {
    const startTime = Date.now();
    const { userId, profileId, message, pointContext, onChunk } = params;

    // 1. Verify profile ownership
    const profile = await BirthProfile.findOne({
      _id: profileId,
      userId,
    });
    if (!profile) {
      throw new Error('Birth profile not found or unauthorized.');
    }

    // 2. Load or create session
    let session: IChatSession;
    if (params.sessionId) {
      session = await this.getSession(userId, params.sessionId);
    } else {
      const generatedTitle =
        pointContext?.label ||
        (message.length > 40 ? `${message.substring(0, 37)}...` : message);
      session = await this.createSession(userId, profileId, generatedTitle);
    }

    // 3. Save User Message
    const userMessage = await ChatMessage.create({
      sessionId: session._id,
      userId: new Types.ObjectId(userId),
      profileId: new Types.ObjectId(profileId),
      role: 'user',
      content: message,
      contextType: pointContext ? 'point_and_ask' : 'general',
      metadata: pointContext ? { selectedPoint: pointContext } : undefined,
    });

    // 4. Retrieve recent message history
    const recentMessages = await ChatMessage.find({
      sessionId: session._id,
      userId,
    })
      .sort({ createdAt: 1 })
      .limit(20);

    const historyDTO: ChatMessageDTO[] = recentMessages.map((m) => ({
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));

    // 5. Deterministically calculate chart
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    // 6. Stream via AI Service
    const { response, promptVersion, contextVersion } =
      await aiService.streamAstrologyResponse({
        profile,
        chart,
        messages: historyDTO,
        pointContext,
        onChunk,
      });

    const latencyMs = Date.now() - startTime;

    // 7. Save Assistant Message
    const assistantMessage = await ChatMessage.create({
      sessionId: session._id,
      userId: new Types.ObjectId(userId),
      profileId: new Types.ObjectId(profileId),
      role: 'assistant',
      content: response.content,
      contextType: pointContext ? 'point_and_ask' : 'general',
      metadata: {
        model: response.model,
        promptVersion,
        contextVersion,
        responseTimeMs: latencyMs,
        selectedPoint: pointContext,
      },
    });

    session.lastMessageAt = new Date();
    if (session.title === 'New Astrology Inquiry') {
      session.title =
        pointContext?.label ||
        (message.length > 40 ? `${message.substring(0, 37)}...` : message);
    }
    await session.save();

    return { session, userMessage, assistantMessage };
  }
}

export const chatService = new ChatService();
