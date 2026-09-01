import { Router } from 'express';
import healthRoutes from './health.routes';
import authRoutes from './auth.routes';
import profileRoutes from './profile.routes';
import astrologyRoutes from './astrology.routes';
import { aiRouter } from './ai.routes';
import { voiceRouter } from './voice.routes';
import { subscriptionRouter } from './subscription.routes';
import { paymentsRouter } from './payments.routes';
import { reportRouter } from './report.routes';
import { notificationRouter } from './notification.routes';
import { adminRouter } from './admin.routes';
import { accountRouter } from './account.routes';
import { memoryRouter } from './memory.routes';
import { recommendationRouter } from '../recommendations/recommendation.routes';
import { insightRouter } from '../astrology/insights/insight.routes';
import { featureFlagRouter } from '../features/featureFlag.routes';
import { analyticsRouter } from '../analytics/analytics.routes';
import { shareRouter } from './share.routes';
import { savedConsultationRouter } from './savedConsultation.routes';
import { personalizationRouter } from './personalization.routes';
import { couponRouter } from './coupon.routes';
import { referralRouter } from './referral.routes';
import { articleRouter } from './article.routes';
import { affiliateRouter } from './affiliate.routes';
import { seoRouter } from './seo.routes';
import { PrometheusMetrics } from '../observability/prometheusMetrics';

const apiRouter = Router();

// Mount sub-routes
apiRouter.use('/health', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/account', accountRouter);
apiRouter.use('/profiles', profileRoutes);

// Specific astrology sub-routes
apiRouter.use('/astrology/insights', insightRouter);
apiRouter.use('/astrology/share', shareRouter);
apiRouter.use('/astrology', astrologyRoutes);

// Specific AI sub-routes
apiRouter.use('/ai/voice', voiceRouter);
apiRouter.use('/ai/memory', memoryRouter);
apiRouter.use('/ai/personalization', personalizationRouter);
apiRouter.use('/ai/saved', savedConsultationRouter);
apiRouter.use('/ai', aiRouter);

apiRouter.use('/recommendations', recommendationRouter);
apiRouter.use('/insights', insightRouter);
apiRouter.use('/features', featureFlagRouter);
apiRouter.use('/analytics', analyticsRouter);
apiRouter.use('/share', shareRouter);
apiRouter.use('/saved-consultations', savedConsultationRouter);
apiRouter.use('/coupons', couponRouter);
apiRouter.use('/referrals', referralRouter);
apiRouter.use('/articles', articleRouter);
apiRouter.use('/affiliates', affiliateRouter);
apiRouter.use('/seo', seoRouter);
apiRouter.use('/subscription', subscriptionRouter);
apiRouter.use('/payments', paymentsRouter);
apiRouter.use('/reports', reportRouter);
apiRouter.use('/notifications', notificationRouter);
apiRouter.use('/admin', adminRouter);

// Prometheus SRE operational metrics
apiRouter.get('/metrics', PrometheusMetrics.metricsHandler);

// Root API descriptor
apiRouter.get('/', (req, res) => {
  res.json({
    name: 'Astrologer API',
    version: 'v1',
    status: 'active',
    endpoints: {
      health: '/api/v1/health',
      readiness: '/api/v1/health/ready',
      auth: '/api/v1/auth',
      account: '/api/v1/account',
      profiles: '/api/v1/profiles',
      astrology: '/api/v1/astrology',
      ai: '/api/v1/ai',
      voice: '/api/v1/ai/voice',
      subscription: '/api/v1/subscription',
      payments: '/api/v1/payments',
      reports: '/api/v1/reports',
      notifications: '/api/v1/notifications',
      admin: '/api/v1/admin',
    },
    timestamp: new Date().toISOString(),
  });
});

export default apiRouter;
