import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 15: Referral Growth & Viral Loop Suite', () => {
  it('GET /api/v1/referrals/stats returns user referral stats and custom link', async () => {
    const user = await User.create({
      name: 'Deepak Verma',
      email: `deepak_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    const res = await request(app)
      .get('/api/v1/referrals/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referralCode).toBeDefined();
    expect(res.body.data.referralLink).toBeDefined();
  });
});
