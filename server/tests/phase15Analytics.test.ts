import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 15: Analytics & Privacy-Safe Telemetry Suite', () => {
  it('POST /api/v1/analytics/events records sanitized growth event', async () => {
    const user = await User.create({
      name: 'Priya Patel',
      email: `priya_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    const res = await request(app)
      .post('/api/v1/analytics/events')
      .set('Authorization', `Bearer ${token}`)
      .send({
        event: 'pricing_viewed',
        metadata: {
          planSelected: 'premium',
          source: 'landing_cta',
        },
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});
