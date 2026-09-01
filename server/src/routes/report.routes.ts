import { Router } from 'express';
import {
  generateKundliReport,
  listReports,
  getReport,
  downloadReport,
  deleteReport,
} from '../controllers/report.controller';
import { requireAuth } from '../middleware/auth';

export const reportRouter = Router();

reportRouter.use(requireAuth);

reportRouter.post('/kundli', generateKundliReport);
reportRouter.get('/', listReports);
reportRouter.get('/:id', getReport);
reportRouter.get('/:id/download', downloadReport);
reportRouter.delete('/:id', deleteReport);
