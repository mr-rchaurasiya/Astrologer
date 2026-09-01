import { Request, Response } from 'express';
import { SubscriptionService } from '../subscription/subscription.service';
import { SUBSCRIPTION_PLANS } from '../subscription/plans';

export class SubscriptionController {
  /**
   * GET /api/v1/subscription/plans
   */
  public static async getPlans(req: Request, res: Response): Promise<void> {
    try {
      const plans = Object.values(SUBSCRIPTION_PLANS);
      res.status(200).json({
        success: true,
        message: 'Subscription plans retrieved successfully',
        data: { plans },
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'PLANS_FETCH_ERROR',
          message: err.message || 'Failed to fetch plans',
        },
      });
    }
  }

  /**
   * GET /api/v1/subscription/me
   */
  public static async getMySubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const summary = await SubscriptionService.getSubscriptionSummary(user.id);

      res.status(200).json({
        success: true,
        message: 'Subscription summary retrieved successfully',
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_FETCH_ERROR',
          message: err.message || 'Failed to fetch subscription',
        },
      });
    }
  }

  /**
   * POST /api/v1/subscription/upgrade (Trial / Tier upgrade)
   */
  public static async upgradePlan(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { plan = 'premium', durationDays = 30 } = req.body;

      await SubscriptionService.upgradeSubscription(user.id, plan, durationDays);
      const summary = await SubscriptionService.getSubscriptionSummary(user.id);

      res.status(200).json({
        success: true,
        message: `Plan upgraded to ${plan} successfully`,
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_UPGRADE_ERROR',
          message: err.message || 'Failed to upgrade subscription',
        },
      });
    }
  }

  /**
   * POST /api/v1/subscription/cancel
   */
  public static async cancelSubscription(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      await SubscriptionService.upgradeSubscription(user.id, 'free', 0);
      const summary = await SubscriptionService.getSubscriptionSummary(user.id);

      res.status(200).json({
        success: true,
        message: 'Subscription cancelled successfully. Plan set to Seeker Free.',
        data: summary,
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: {
          code: 'SUBSCRIPTION_CANCEL_ERROR',
          message: err.message || 'Failed to cancel subscription',
        },
      });
    }
  }
}
