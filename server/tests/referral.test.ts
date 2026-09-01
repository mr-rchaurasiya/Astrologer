import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: Referral & Viral Invitation System', () => {
  let referrerId: string;
  let referrerToken: string;
  let inviteeId: string;
  let inviteeToken: string;

  beforeEach(async () => {
    const referrer = await User.create({
      name: 'Referrer User',
      email: `ref_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    referrerId = referrer.id;
    referrerToken = generateAccessToken({ id: referrerId, email: referrer.email, role: 'user' });

    const invitee = await User.create({
      name: 'Invitee User',
      email: `inv_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    inviteeId = invitee.id;
    inviteeToken = generateAccessToken({ id: inviteeId, email: invitee.email, role: 'user' });
  });

  it('should generate or fetch a user unique referral code', async () => {
    const res = await request(app)
      .get('/api/v1/referrals/me')
      .set('Authorization', `Bearer ${referrerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.referralCode).toBeDefined();
    expect(res.body.data.referralCode.startsWith('VEDIC-')).toBe(true);
  });

  it('should claim a friend referral code and grant welcome credits', async () => {
    const refRes = await request(app)
      .get('/api/v1/referrals/me')
      .set('Authorization', `Bearer ${referrerToken}`);

    const code = refRes.body.data.referralCode;

    const claimRes = await request(app)
      .post('/api/v1/referrals/claim')
      .set('Authorization', `Bearer ${inviteeToken}`)
      .send({ code });

    expect(claimRes.status).toBe(200);
    expect(claimRes.body.success).toBe(true);
    expect(claimRes.body.data.claimed).toBe(true);
  });

  it('should prevent self-referral', async () => {
    const refRes = await request(app)
      .get('/api/v1/referrals/me')
      .set('Authorization', `Bearer ${referrerToken}`);

    const code = refRes.body.data.referralCode;

    const selfClaimRes = await request(app)
      .post('/api/v1/referrals/claim')
      .set('Authorization', `Bearer ${referrerToken}`)
      .send({ code });

    expect(selfClaimRes.status).toBe(400);
    expect(selfClaimRes.body.success).toBe(false);
  });
});
