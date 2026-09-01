import { Router } from 'express';
import { AIController } from '../controllers/ai.controller';
import { requireAuth } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/aiRateLimiter';

const router = Router();

// All AI consultation endpoints require valid authenticated session
router.use(requireAuth);

// Chat & Streaming endpoints with rate limiting
router.post('/chat', aiRateLimiter, AIController.sendMessage);
router.post('/chat/stream', aiRateLimiter, AIController.streamMessage);
router.post('/daily-insight', aiRateLimiter, AIController.getDailyInsight);

// Phase 13 Report & Context Endpoints
router.post('/reports', aiRateLimiter, AIController.generateReport);
router.get('/reports/:id', AIController.getReportById);
router.get('/context/:profileId', AIController.getAstrologyContext);
router.get('/quota', AIController.getAIQuota);

// Session lifecycle endpoints
router.get('/sessions', AIController.getSessions);
router.post('/sessions', AIController.createSession);
router.get('/sessions/:sessionId', AIController.getSession);
router.delete('/sessions/:sessionId', AIController.deleteSession);
router.get('/sessions/:sessionId/messages', AIController.getMessages);

export const aiRouter = router;
