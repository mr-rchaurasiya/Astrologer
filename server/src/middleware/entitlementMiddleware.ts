import { Request, Response, NextFunction } from 'express';
import { SubscriptionService } from '../subscription/subscription.service';
import { TrackedFeature } from '../models/UsageRecord';

export const requireFeatureQuota = (feature: TrackedFeature) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const user = (req as any).user;
      if (!user || !user.id) {
        res.status(401).json({
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication is required',
          },
        });
        return;
      }

      const quota = await SubscriptionService.checkAndIncrementUsage(user.id, feature);

      if (!quota.allowed) {
        res.status(403).json({
          success: false,
          error: {
            code: 'QUOTA_EXCEEDED',
            message: `You have reached your daily quota (${quota.limit}) for ${feature}. Upgrade to Cosmic Premium for expanded access.`,
            feature,
            limit: quota.limit,
            count: quota.count,
          },
        });
        return;
      }

      // Attach remaining quota to response locals for header visibility
      res.locals.quotaRemaining = quota.remaining;
      next();
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'ENTITLEMENT_CHECK_FAILED',
          message: err.message || 'Failed to verify subscription entitlements',
        },
      });
    }
  };
};
