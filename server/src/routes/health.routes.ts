import { Router } from 'express';
import { getHealth, getReadiness, getLiveness } from '../controllers/health.controller';

const router = Router();

router.get('/', getHealth);
router.get('/ready', getReadiness);
router.get('/readiness', getReadiness);
router.get('/liveness', getLiveness);

export default router;
