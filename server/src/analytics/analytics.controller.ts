import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from './analytics.service';
import { sendSuccess } from '../utils/response';

export const trackEvent = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { event, profileId, metadata } = req.body;

    if (!event) {
      return res.status(400).json({ success: false, message: 'Event name is required' });
    }

    await AnalyticsService.trackEvent({
      userId,
      profileId,
      event,
      metadata,
    });

    return sendSuccess(res, { tracked: true }, 'Event tracked successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getUserActivity = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const activities = await AnalyticsService.getUserActivity(userId);

    return sendSuccess(res, { activities }, 'User activity retrieved successfully');
  } catch (error) {
    next(error);
  }
};
