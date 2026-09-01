import { Request, Response, NextFunction } from 'express';
import { ReferralService } from '../services/referral.service';
import { sendSuccess, sendError } from '../utils/response';

export const getMyReferral = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const stats = await ReferralService.getReferralStats(userId);

    return sendSuccess(res, stats, 'Referral stats retrieved');
  } catch (error) {
    next(error);
  }
};

export const claimReferralCode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { code } = req.body;

    if (!code) {
      return sendError(res, 'VALIDATION_ERROR', 'Referral code is required', 400);
    }

    const result = await ReferralService.claimReferral(code, userId);
    if (!result.success) {
      return sendError(res, 'REFERRAL_ERROR', result.message, 400);
    }

    return sendSuccess(res, { claimed: true }, result.message);
  } catch (error) {
    next(error);
  }
};
