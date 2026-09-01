import { Router } from 'express';
import { SubscriptionController } from '../controllers/subscription.controller';
import { requireAuth } from '../middleware/auth';

export const subscriptionRouter = Router();

// Public plans
subscriptionRouter.get('/plans', SubscriptionController.getPlans);

// Protected routes
subscriptionRouter.get('/me', requireAuth, SubscriptionController.getMySubscription);
subscriptionRouter.post('/upgrade', requireAuth, SubscriptionController.upgradePlan);
subscriptionRouter.post('/cancel', requireAuth, SubscriptionController.cancelSubscription);
