import { Request, Response, NextFunction } from 'express';
import { chatService } from '../ai/services/chat.service';
import { DailyInsightService } from '../ai/services/dailyInsight.service';
import {
  sendChatMessageSchema,
  createSessionSchema,
  getMessagesQuerySchema,
} from '../validators/ai.validator';

export class AIController {
  /**
   * POST /api/v1/ai/chat
   * Sends a message and receives full assistant response.
   */
  public static async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = sendChatMessageSchema.parse(req.body);
      const userId = (req as any).user.id;

      const result = await chatService.sendMessage({
        userId,
        profileId: validatedData.profileId,
        sessionId: validatedData.sessionId,
        message: validatedData.message,
        pointContext: validatedData.pointContext,
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({
        success: true,
        message: 'AI response generated successfully',
        data: {
          sessionId: result.session.id || result.session._id.toString(),
          sessionTitle: result.session.title,
          userMessage: result.userMessage,
          assistantMessage: result.assistantMessage,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ai/chat/stream
   * Streams AI assistant response chunks via SSE.
   */
  public static async streamMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = sendChatMessageSchema.parse(req.body);
      const userId = (req as any).user.id;

      // Set SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache, no-transform');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders?.();

      const result = await chatService.streamMessage({
        userId,
        profileId: validatedData.profileId,
        sessionId: validatedData.sessionId,
        message: validatedData.message,
        pointContext: validatedData.pointContext,
        onChunk: async (chunk) => {
          res.write(`data: ${JSON.stringify(chunk)}\n\n`);
        },
      });

      // Send final metadata chunk & [DONE]
      res.write(
        `data: ${JSON.stringify({
          isFinal: true,
          sessionId: result.session.id,
          sessionTitle: result.session.title,
          assistantMessageId: result.assistantMessage.id,
        })}\n\n`
      );
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error: any) {
      if (!res.headersSent) {
        next(error);
      } else {
        res.write(`data: ${JSON.stringify({ error: error.message || 'Stream error' })}\n\n`);
        res.end();
      }
    }
  }

  /**
   * POST /api/v1/ai/daily-insight
   * Generates or retrieves cached daily personalized astrological insight.
   */
  public static async getDailyInsight(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { profileId, date, category = 'overall' } = req.body;

      if (!profileId) {
        res.status(400).json({
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'profileId is required',
          },
        });
        return;
      }

      const targetDate = date || new Date().toISOString().split('T')[0];

      const insight = await DailyInsightService.getDailyInsight(
        userId,
        profileId,
        targetDate,
        category
      );

      res.status(200).json({
        success: true,
        message: 'Daily astrological insight retrieved successfully',
        data: insight,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/sessions
   * Lists chat sessions.
   */
  public static async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const profileId = req.query.profileId as string | undefined;

      const sessions = await chatService.getSessions(userId, profileId);

      res.status(200).json({
        success: true,
        message: 'Chat sessions retrieved successfully',
        data: {
          sessions,
          count: sessions.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/v1/ai/sessions
   * Creates a new chat session.
   */
  public static async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedData = createSessionSchema.parse(req.body);
      const userId = (req as any).user.id;

      const session = await chatService.createSession(
        userId,
        validatedData.profileId,
        validatedData.title
      );

      res.status(201).json({
        success: true,
        message: 'Chat session created successfully',
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/sessions/:sessionId
   * Gets a specific session.
   */
  public static async getSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const sessionId = req.params.sessionId;

      const session = await chatService.getSession(userId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Chat session retrieved successfully',
        data: { session },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/v1/ai/sessions/:sessionId
   * Deletes a chat session and its messages.
   */
  public static async deleteSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const sessionId = req.params.sessionId;

      await chatService.deleteSession(userId, sessionId);

      res.status(200).json({
        success: true,
        message: 'Chat session and messages deleted successfully',
        data: {},
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/sessions/:sessionId/messages
   * Gets messages for a session with pagination.
   */
  public static async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const sessionId = req.params.sessionId;
      const query = getMessagesQuerySchema.parse(req.query);

      const { messages, total } = await chatService.getMessages(
        userId,
        sessionId,
        query.limit,
        query.before
      );

      res.status(200).json({
        success: true,
        message: 'Messages retrieved successfully',
        data: {
          messages,
          total,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // --------------------------------------------------------------------------
  // Phase 13 Endpoints: Reports, Context Transparency, Feedback, Quotas
  // --------------------------------------------------------------------------

  /**
   * POST /api/v1/ai/reports
   * Generates a grounded, structured AI astrology report.
   */
  public static async generateReport(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { AIReportGeneratorService } = await import('../ai/reports/reportGenerator.service');
      const { generateReportSchema } = await import('../validators/ai.validator');

      const validatedData = generateReportSchema.parse(req.body);

      const report = await AIReportGeneratorService.generateReport({
        userId,
        profileId: validatedData.profileId,
        reportType: validatedData.reportType as any,
        personalization: validatedData.personalization,
      });

      res.status(200).json({
        success: true,
        message: 'AI Astrology Report generated successfully',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/reports/:id
   * Retrieves a generated AI report by ID.
   */
  public static async getReportById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { AIReportGeneratorService } = await import('../ai/reports/reportGenerator.service');

      const report = await AIReportGeneratorService.getReportById(userId, req.params.id);
      if (!report) {
        return next(new Error('Report not found or unauthorized.'));
      }

      res.status(200).json({
        success: true,
        message: 'AI Astrology Report retrieved successfully',
        data: { report },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/context/:profileId
   * Retrieves sanitized astrology context for transparency and debugging.
   */
  public static async getAstrologyContext(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { profileId } = req.params;
      const { BirthProfile } = await import('../models/BirthProfile');
      const { AstrologyContextService } = await import('../ai/astrology/astrologyContext.service');

      const profile = await BirthProfile.findOne({ _id: profileId, userId });
      if (!profile) {
        return next(new Error('Birth profile not found or unauthorized.'));
      }

      const queryMessage = (req.query.message as string) || 'Tell me about my life path';
      const context = await AstrologyContextService.getSelectiveContext({
        profile,
        userMessage: queryMessage,
      });

      res.status(200).json({
        success: true,
        message: 'Selective astrology context retrieved successfully',
        data: { context },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/v1/ai/quota
   * Returns the user's current AI usage quotas and remaining balance.
   */
  public static async getAIQuota(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = (req as any).user.id;
      const { SubscriptionService } = await import('../subscription/subscription.service');

      const quota = await SubscriptionService.getSubscriptionSummary(userId);

      res.status(200).json({
        success: true,
        message: 'AI usage quota retrieved successfully',
        data: { quota },
      });
    } catch (error) {
      next(error);
    }
  }
}
