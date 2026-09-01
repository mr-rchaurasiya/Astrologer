import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { BirthProfile } from '../src/models/BirthProfile';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: Kundli Secure Expiring Sharing API', () => {
  let userId: string;
  let userToken: string;
  let profileId: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Sharing Native',
      email: `sharing_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    userId = user.id;
    userToken = generateAccessToken({ id: userId, email: user.email, role: 'user' });

    const profile = await BirthProfile.create({
      userId,
      name: 'Arjuna Dev',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '14:30',
      placeName: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 'Asia/Kolkata',
      gender: 'male',
      isPrimary: true,
    });
    profileId = profile.id;
  });

  it('should generate a secure expiring share link for owned birth profile', async () => {
    const res = await request(app)
      .post('/api/v1/astrology/share/create')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        profileId,
        expiresInDays: 7,
        title: 'Arjuna Vedic Kundli',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    expect(res.body.data.shareUrl).toContain(res.body.data.token);
    expect(new Date(res.body.data.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('should reject creating a share link for a non-owned profile', async () => {
    const otherUser = await User.create({
      name: 'Other User',
      email: `other_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const otherToken = generateAccessToken({ id: otherUser.id, email: otherUser.email, role: 'user' });

    const res = await request(app)
      .post('/api/v1/astrology/share/create')
      .set('Authorization', `Bearer ${otherToken}`)
      .send({
        profileId,
        expiresInDays: 7,
      });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should fetch public shared chart using valid token without exposing PII or IDs', async () => {
    const shareRes = await request(app)
      .post('/api/v1/astrology/share/create')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        profileId,
        expiresInDays: 7,
        title: 'Public Kundli Share',
      });

    const token = shareRes.body.data.token;

    const res = await request(app).get(`/api/v1/astrology/share/public/${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.nativeName).toBe('Arjuna Dev');
    expect(res.body.data.chart).toBeDefined();
    expect(res.body.data.chart.ayanamsa).toBeDefined();
    expect(res.body.data.chart.ascendant).toBeDefined();
    expect(res.body.data.chart.planets.length).toBeGreaterThan(0);

    // CRITICAL: Ensure zero internal user IDs or DB IDs leaked
    expect(res.body.data.userId).toBeUndefined();
    expect(res.body.data._id).toBeUndefined();
    expect(res.body.data.password).toBeUndefined();
  });
});
