import { Router } from 'express';
import { getCorrelatedInsights } from './insight.controller';
import { requireAuth } from '../../middleware/auth';

export const insightRouter = Router();

insightRouter.use(requireAuth);

insightRouter.get('/:profileId', getCorrelatedInsights);
