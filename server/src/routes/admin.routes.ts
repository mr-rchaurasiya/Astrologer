import { Router } from 'express';
import {
  getAdminOverviewAnalytics,
  getAdminSubscriptionsAnalytics,
  getAdminUsageAnalytics,
  getAdminUsers,
  updateUserStatus,
  getAdminSubscriptions,
  getAdminAuditLogs,
  runPaymentReconciliation,
  getAdminAiUsage,
  getAdminCacheMetrics,
  getAdminBusinessIntelligence,
  getAdminRevenueBreakdown,
  getAdminAIFeedbackTelemetry,
  getAdminGrowthMetrics,
} from '../controllers/admin.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const adminRouter = Router();

// Protect all admin endpoints with authentication and admin role
adminRouter.use(requireAuth);
adminRouter.use(requireRole('admin'));

adminRouter.get('/analytics/overview', getAdminOverviewAnalytics);
adminRouter.get('/analytics/growth', getAdminGrowthMetrics);
adminRouter.get('/analytics/subscriptions', getAdminSubscriptionsAnalytics);
adminRouter.get('/analytics/usage', getAdminUsageAnalytics);
adminRouter.get('/analytics/business-intelligence', getAdminBusinessIntelligence);
adminRouter.get('/analytics/revenue', getAdminRevenueBreakdown);
adminRouter.get('/ai/usage', getAdminAiUsage);
adminRouter.get('/ai/feedback', getAdminAIFeedbackTelemetry);
adminRouter.get('/cache/metrics', getAdminCacheMetrics);

adminRouter.get('/users', getAdminUsers);
adminRouter.put('/users/:id/status', updateUserStatus);

adminRouter.get('/subscriptions', getAdminSubscriptions);
adminRouter.get('/audit-logs', getAdminAuditLogs);
adminRouter.post('/reconciliation/run', runPaymentReconciliation);
