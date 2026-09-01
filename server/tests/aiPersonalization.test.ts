import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: AI Personalization & Feedback API', () => {
  let userId: string;
  let userToken: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Yogi User',
      email: `yogi_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    userId = user.id;
    userToken = generateAccessToken({ id: userId, email: user.email, role: 'user' });
  });

  it('should fetch default AI personalization settings', async () => {
    const res = await request(app)
      .get('/api/v1/ai/personalization')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settings.languagePreference).toBe('English');
    expect(res.body.data.settings.astrologyTerminology).toBe('standard');
    expect(res.body.data.settings.responseStyle).toBe('balanced');
  });

  it('should update AI personalization settings with server validation', async () => {
    const res = await request(app)
      .put('/api/v1/ai/personalization')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        languagePreference: 'Hindi',
        astrologyTerminology: 'sanskrit',
        responseStyle: 'detailed',
        aiMemoryEnabled: false,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settings.languagePreference).toBe('Hindi');
    expect(res.body.data.settings.astrologyTerminology).toBe('sanskrit');
    expect(res.body.data.settings.aiMemoryEnabled).toBe(false);
  });

  it('should submit helpful rating feedback for an AI consultation message', async () => {
    const res = await request(app)
      .post('/api/v1/ai/personalization/feedback')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        messageId: 'msg_987654321',
        rating: 'helpful',
        category: 'accuracy',
        comment: 'Accurately predicted Saturn sub-period remedy',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.feedback.rating).toBe('helpful');
  });
});
