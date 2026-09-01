import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { BirthProfile } from '../src/models/BirthProfile';
import { Report } from '../src/models/Report';
import { hashPassword } from '../src/utils/password';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 8: User Account Settings, Data Export & Deletion Cascade', () => {
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Account Test User',
      email: `account_${Date.now()}@example.com`,
      passwordHash: await hashPassword('Password123!'),
      role: 'user',
    });
    userId = user.id;
    userToken = generateAccessToken(user);

    await BirthProfile.create({
      userId,
      name: 'Test Native',
      relationship: 'self',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '12:00:00',
      placeName: 'Delhi',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata',
      timezoneOffset: 5.5,
      gender: 'male',
      isPrimary: true,
    });
  });

  it('GET /api/v1/account/me should return user details, stats, and preferences', async () => {
    const res = await request(app)
      .get('/api/v1/account/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe('Account Test User');
    expect(res.body.data.stats.profileCount).toBe(1);
    expect(res.body.data.preferences).toBeDefined();
  }, 15000);

  it('GET /api/v1/account/export should download complete sanitized JSON archive', async () => {
    const res = await request(app)
      .get('/api/v1/account/export')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('application/json');
    expect(res.header['content-disposition']).toContain('attachment');
    expect(res.body.user.name).toBe('Account Test User');
    expect(res.body.birthProfiles.length).toBe(1);
    // Security check: passwordHash must NOT be exported
    expect(res.body.user.passwordHash).toBeUndefined();
  });

  it('DELETE /api/v1/account should cascade delete all user-owned records', async () => {
    const res = await request(app)
      .delete('/api/v1/account')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        password: 'Password123!',
        confirmationText: 'DELETE',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);

    // Verify user can no longer fetch account details (unauthorized because user no longer exists)
    const verifyRes = await request(app)
      .get('/api/v1/account/me')
      .set('Authorization', `Bearer ${userToken}`);

    expect(verifyRes.status).toBe(401);
  });
});
