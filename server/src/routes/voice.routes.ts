import { Router } from 'express';
import { transcribeAudio, synthesizeSpeech } from '../controllers/voice.controller';
import { requireAuth } from '../middleware/auth';
import { aiRateLimiter } from '../middleware/aiRateLimiter';

export const voiceRouter = Router();

voiceRouter.use(requireAuth);
voiceRouter.use(aiRateLimiter);

voiceRouter.post('/transcribe', transcribeAudio);
voiceRouter.post('/synthesize', synthesizeSpeech);
