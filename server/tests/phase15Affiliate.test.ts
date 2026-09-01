import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import { AffiliateService } from '../src/services/affiliate.service';
import './setup';

const app = createApp();

describe('Phase 15: Affiliate Partner Architecture Suite', () => {
  it('POST /api/v1/affiliates/register registers a creator affiliate partner', async () => {
    const user = await User.create({
      name: 'Vedic Creator',
      email: `creator_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    const res = await request(app)
      .post('/api/v1/affiliates/register')
      .set('Authorization', `Bearer ${token}`)
      .send({
        partnerName: 'Vedic Creator Channel',
        customCode: 'CREATOR20',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.affiliate.affiliateCode).toBe('CREATOR20');
  });

  it('POST /api/v1/affiliates/track-click/:code records public affiliate traffic clicks', async () => {
    await AffiliateService.registerAffiliate({
      partnerName: 'Affiliate Partner A',
      email: 'partner_a@vedic.com',
      customCode: 'PARTNERA',
    });

    const res = await request(app).post('/api/v1/affiliates/track-click/PARTNERA');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tracked).toBe(true);
  });
});
