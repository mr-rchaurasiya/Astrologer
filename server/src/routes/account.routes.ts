import { Router } from 'express';
import {
  getAccountDetails,
  exportUserData,
  deleteAccount,
} from '../controllers/account.controller';
import { requireAuth } from '../middleware/auth';

export const accountRouter = Router();

accountRouter.use(requireAuth);

accountRouter.get('/me', getAccountDetails);
accountRouter.get('/export', exportUserData);
accountRouter.delete('/', deleteAccount);
