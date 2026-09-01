import { Router } from 'express';
import { register, login, refresh, logout, getMe, updatePassword } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, register);
router.post('/login', authRateLimiter, login);
router.post('/refresh', authRateLimiter, refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, getMe);
router.put('/update-password', requireAuth, authRateLimiter, updatePassword);

export default router;
