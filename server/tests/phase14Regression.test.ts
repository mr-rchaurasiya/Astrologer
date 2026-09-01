import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { BirthProfile } from '../src/models/BirthProfile';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 14: End-to-End Mobile & PWA Regression Suite', () => {
  it('executes full mobile user journey (auth -> profile -> calculate -> push public key)', async () => {
    // 1. Create user
    const user = await User.create({
      name: 'Ananya Rao',
      email: `ananya_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    // 2. Create profile
    const profileRes = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Ananya Rao',
        relationship: 'self',
        dateOfBirth: '1993-11-22',
        timeOfBirth: '07:15:00',
        placeName: 'Bengaluru, India',
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: 'Asia/Kolkata',
        timezoneOffset: 5.5,
        gender: 'female',
      });

    expect(profileRes.status).toBe(201);
    const profileId = profileRes.body.data.profile.id;

    // 3. Calculate Kundli chart
    const calcRes = await request(app)
      .get(`/api/v1/astrology/chart/${profileId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(calcRes.status).toBe(200);
    expect(calcRes.body.data.chart.ascendant.sign).toBeDefined();

    // 4. Check push public key
    const pushKeyRes = await request(app)
      .get('/api/v1/notifications/push/public-key')
      .set('Authorization', `Bearer ${token}`);

    expect(pushKeyRes.status).toBe(200);
    expect(pushKeyRes.body.data.publicKey).toBeDefined();
  });
});
