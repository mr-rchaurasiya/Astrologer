import { Router } from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  handlePaymentWebhook,
  getPaymentHistory,
  getSubscriptionPlans,
} from '../controllers/payments.controller';
import { requireAuth } from '../middleware/auth';

export const paymentsRouter = Router();

// Public plans
paymentsRouter.get('/plans', getSubscriptionPlans);

// Webhook endpoint (Raw body or JSON payload with signature verification)
paymentsRouter.post('/webhook', handlePaymentWebhook);

// Protected routes
paymentsRouter.post('/orders', requireAuth, createPaymentOrder);
paymentsRouter.post('/verify', requireAuth, verifyPayment);
paymentsRouter.get('/history', requireAuth, getPaymentHistory);
