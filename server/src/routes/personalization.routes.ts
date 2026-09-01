import { Router } from 'express';
import {
  getPersonalizationSettings,
  updatePersonalizationSettings,
  submitAIFeedback,
} from '../controllers/personalization.controller';
import { requireAuth } from '../middleware/auth';

export const personalizationRouter = Router();

personalizationRouter.use(requireAuth);

personalizationRouter.get('/', getPersonalizationSettings);
personalizationRouter.put('/', updatePersonalizationSettings);
personalizationRouter.post('/feedback', submitAIFeedback);
