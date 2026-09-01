import { Router } from 'express';
import { getMyReferral, claimReferralCode } from '../controllers/referral.controller';
import { requireAuth } from '../middleware/auth';

export const referralRouter = Router();

referralRouter.use(requireAuth);

referralRouter.get('/me', getMyReferral);
referralRouter.get('/stats', getMyReferral);
referralRouter.post('/claim', claimReferralCode);
