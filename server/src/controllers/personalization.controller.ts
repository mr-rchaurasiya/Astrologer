import { Request, Response, NextFunction } from 'express';
import { AIPersonalization } from '../models/AIPersonalization';
import { AIResponseFeedback } from '../models/AIResponseFeedback';
import { sendSuccess, sendError } from '../utils/response';

export const getPersonalizationSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let settings = await AIPersonalization.findOne({ userId });

    if (!settings) {
      settings = await AIPersonalization.create({
        userId,
        aiMemoryEnabled: true,
        recommendationsEnabled: true,
        dailyInsightEnabled: true,
        historyRetentionDays: 90,
        languagePreference: 'English',
        astrologyTerminology: 'standard',
        responseStyle: 'balanced',
      });
    }

    return sendSuccess(res, { settings }, 'AI Personalization settings retrieved');
  } catch (error) {
    next(error);
  }
};

export const updatePersonalizationSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const {
      aiMemoryEnabled,
      recommendationsEnabled,
      dailyInsightEnabled,
      historyRetentionDays,
      languagePreference,
      astrologyTerminology,
      responseStyle,
    } = req.body;

    const settings = await AIPersonalization.findOneAndUpdate(
      { userId },
      {
        userId,
        ...(aiMemoryEnabled !== undefined && { aiMemoryEnabled }),
        ...(recommendationsEnabled !== undefined && { recommendationsEnabled }),
        ...(dailyInsightEnabled !== undefined && { dailyInsightEnabled }),
        ...(historyRetentionDays !== undefined && { historyRetentionDays }),
        ...(languagePreference !== undefined && { languagePreference }),
        ...(astrologyTerminology !== undefined && { astrologyTerminology }),
        ...(responseStyle !== undefined && { responseStyle }),
      },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { settings }, 'AI Personalization settings updated');
  } catch (error) {
    next(error);
  }
};

export const submitAIFeedback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { messageId, sessionId, rating, category, comment, model } = req.body;

    if (!messageId || !rating || !['helpful', 'not_helpful'].includes(rating)) {
      return sendError(res, 'VALIDATION_ERROR', 'messageId and valid rating (helpful/not_helpful) are required', 400);
    }

    const feedback = await AIResponseFeedback.findOneAndUpdate(
      { userId, messageId },
      {
        userId,
        messageId,
        sessionId,
        rating,
        category,
        comment: comment ? String(comment).slice(0, 500) : undefined,
        model,
      },
      { upsert: true, new: true }
    );

    return sendSuccess(res, { feedback }, 'AI consultation feedback recorded', 201);
  } catch (error) {
    next(error);
  }
};
