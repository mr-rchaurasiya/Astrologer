import { Request, Response, NextFunction } from 'express';
import { AstrologyInsightService } from './insight.service';
import { sendSuccess } from '../../utils/response';

export const getCorrelatedInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { profileId } = req.params;

    const insights = await AstrologyInsightService.getCorrelatedInsights(userId, profileId);

    return sendSuccess(res, { insights }, 'Correlated astrology insights retrieved successfully');
  } catch (error) {
    next(error);
  }
};
