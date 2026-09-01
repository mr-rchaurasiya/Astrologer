import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { generateAccessToken } from '../../src/utils/jwt';
import '../setup';

const app = createApp();

describe('Phase 16: End-to-End Enterprise Scale & Regression Suite', () => {
  it('executes full operational flow: Health -> Metrics -> Auth -> Profiles -> Astrological Calculations', async () => {
    // 1. Check Liveness & Readiness
    const liveRes = await request(app).get('/api/v1/health/liveness');
    expect(liveRes.status).toBe(200);

    const readyRes = await request(app).get('/api/v1/health/readiness');
    expect(readyRes.status).toBe(200);

    // 2. Query Prometheus Metrics
    const metricsRes = await request(app).get('/api/v1/metrics');
    expect(metricsRes.status).toBe(200);

    // 3. User Register & Token Generation
    const user = await User.create({
      name: 'Scalability User',
      email: `scale_user_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const token = generateAccessToken({ id: user.id, email: user.email, role: 'user' });

    // 4. Create Profile
    const profileRes = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Scale Chart',
        relationship: 'self',
        dateOfBirth: '1995-10-24',
        timeOfBirth: '07:15:00',
        placeName: 'Delhi, India',
        latitude: 28.6139,
        longitude: 77.209,
        timezone: 'Asia/Kolkata',
      });

    expect(profileRes.status).toBe(201);
    const profileId = profileRes.body.data.profile.id;

    // 5. Fetch Astrology Chart
    const chartRes = await request(app)
      .get(`/api/v1/astrology/chart/${profileId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(chartRes.status).toBe(200);
    expect(chartRes.body.data.chart.planets.length).toBeGreaterThan(0);
  });
});
