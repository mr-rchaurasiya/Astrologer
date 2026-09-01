import { Router } from 'express';
import {
  getRecommendations,
  dismissRecommendation,
} from './recommendation.controller';
import { requireAuth } from '../middleware/auth';

export const recommendationRouter = Router();

recommendationRouter.use(requireAuth);

recommendationRouter.get('/', getRecommendations);
recommendationRouter.post('/:id/dismiss', dismissRecommendation);
