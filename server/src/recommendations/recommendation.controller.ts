import { Request, Response, NextFunction } from 'express';
import { RecommendationService } from './recommendation.service';
import { sendSuccess } from '../utils/response';

export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const recommendations = await RecommendationService.getRecommendations(userId);

    return sendSuccess(res, { recommendations }, 'Recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const dismissRecommendation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    RecommendationService.dismissRecommendation(userId, id);

    return sendSuccess(res, { dismissed: true }, 'Recommendation dismissed');
  } catch (error) {
    next(error);
  }
};
