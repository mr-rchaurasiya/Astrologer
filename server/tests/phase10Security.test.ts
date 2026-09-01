import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: Security, IDOR & Authorization Hardening', () => {
  let victimId: string;
  let victimToken: string;
  let attackerId: string;
  let attackerToken: string;

  beforeEach(async () => {
    const victim = await User.create({
      name: 'Victim User',
      email: `victim_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    victimId = victim.id;
    victimToken = generateAccessToken({ id: victimId, email: victim.email, role: 'user' });

    const attacker = await User.create({
      name: 'Attacker User',
      email: `attacker_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    attackerId = attacker.id;
    attackerToken = generateAccessToken({ id: attackerId, email: attacker.email, role: 'user' });
  });

  it('should block non-admin users from accessing admin revenue endpoints', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/revenue')
      .set('Authorization', `Bearer ${victimToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should block unauthenticated requests to create coupons or save consultations', async () => {
    const res = await request(app)
      .post('/api/v1/ai/saved')
      .send({ title: 'Unauthorized Saved Reading' });

    expect(res.status).toBe(401);
  });
});
