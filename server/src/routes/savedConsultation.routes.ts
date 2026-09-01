import { Router } from 'express';
import {
  createSavedConsultation,
  getSavedConsultations,
  updateSavedConsultation,
  deleteSavedConsultation,
} from '../controllers/savedConsultation.controller';
import { requireAuth } from '../middleware/auth';

export const savedConsultationRouter = Router();

savedConsultationRouter.use(requireAuth);

savedConsultationRouter.post('/', createSavedConsultation);
savedConsultationRouter.get('/', getSavedConsultations);
savedConsultationRouter.put('/:id', updateSavedConsultation);
savedConsultationRouter.delete('/:id', deleteSavedConsultation);
