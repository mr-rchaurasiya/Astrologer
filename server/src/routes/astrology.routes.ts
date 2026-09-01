import { Router } from 'express';
import {
  calculateChart,
  getChartByProfileId,
  getDashaByProfileId,
  getDailyPanchang,
  getCurrentTransits,
  getLifeCurve,
  getTransitTimeline,
  getDailyTransits,
  getDivisionalChartsByProfileId,
  getYogasByProfileId,
  getAshtakavargaByProfileId,
  getStrengthByProfileId,
  getAdvancedTransitsByProfileId,
  calculateCompatibilityHandler,
  getAdvancedAnalysisByProfileId,
} from '../controllers/astrology.controller';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Standard Protected Endpoints
router.post('/calculate', requireAuth, calculateChart);
router.get('/chart/:profileId', requireAuth, getChartByProfileId);
router.get('/dasha/:profileId', requireAuth, getDashaByProfileId);
router.get('/life-curve/:profileId', requireAuth, getLifeCurve);
router.get('/transits/timeline', requireAuth, getTransitTimeline);
router.get('/transits/daily', requireAuth, getDailyTransits);

// Phase 12 Advanced Astrology Endpoints
router.get('/divisional-charts/:profileId', requireAuth, getDivisionalChartsByProfileId);
router.get('/yogas/:profileId', requireAuth, getYogasByProfileId);
router.get('/ashtakavarga/:profileId', requireAuth, getAshtakavargaByProfileId);
router.get('/strength/:profileId', requireAuth, getStrengthByProfileId);
router.get('/transits/advanced/:profileId', requireAuth, getAdvancedTransitsByProfileId);
router.post('/compatibility', calculateCompatibilityHandler);
router.get('/advanced-analysis/:profileId', requireAuth, getAdvancedAnalysisByProfileId);

// Public / Contextual Astronomical Endpoints
router.get('/panchang/daily', getDailyPanchang);
router.get('/transits/current', getCurrentTransits);

export default router;
