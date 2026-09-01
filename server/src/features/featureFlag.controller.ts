import { Request, Response, NextFunction } from 'express';
import { FeatureFlagService } from './featureFlag.service';
import { sendSuccess } from '../utils/response';

export const getFeatureFlags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const flags = await FeatureFlagService.getFlagsForUser(userId);

    return sendSuccess(res, { flags }, 'Feature flags evaluated successfully');
  } catch (error) {
    next(error);
  }
};
