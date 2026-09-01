import { Request, Response, NextFunction } from 'express';
import { PaymentService } from '../payments/payment.service';
import { WebhookService } from '../payments/webhook.service';
import { SUBSCRIPTION_PLANS } from '../subscription/plans';

export const getSubscriptionPlans = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const plans = Object.values(SUBSCRIPTION_PLANS);
    res.status(200).json({
      success: true,
      data: {
        plans,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const createPaymentOrder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { planId } = req.body;

    if (!planId) {
      return res.status(400).json({
        success: false,
        message: 'planId is required',
      });
    }

    const order = await PaymentService.createPaymentOrder(userId, planId);

    res.status(201).json({
      success: true,
      message: 'Payment order created successfully',
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { orderId, paymentId, signature } = req.body;

    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({
        success: false,
        message: 'orderId, paymentId, and signature are required for verification',
      });
    }

    const result = await PaymentService.verifyAndCapturePayment(userId, orderId, paymentId, signature);

    res.status(200).json({
      success: true,
      message: 'Payment verified and subscription activated successfully',
      data: {
        verified: true,
        payment: result.payment,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const handlePaymentWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const signature = (req.headers['x-razorpay-signature'] as string) || '';
    const rawBody = req.body;

    const result = await WebhookService.processWebhook(rawBody, signature);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message || 'Webhook verification failed',
    });
  }
};

export const getPaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const payments = await PaymentService.getPaymentHistory(userId);

    res.status(200).json({
      success: true,
      data: {
        payments,
        count: payments.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
