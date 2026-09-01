import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { BirthProfile } from '../src/models/BirthProfile';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 9: Recommendation Engine & Astrology Insights API', () => {
  let userToken: string;
  let userProfile: any;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Insight Test User',
      email: 'insight_user@example.com',
      passwordHash: 'hash',
      role: 'user',
      isActive: true,
    });
    userToken = generateAccessToken(user);

    userProfile = await BirthProfile.create({
      userId: user.id,
      name: 'Insight Native',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '14:30',
      placeName: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 'Asia/Kolkata',
      timezoneOffset: 5.5,
      gender: 'female',
      isPrimary: true,
    });
  });

  it('GET /api/v1/recommendations should return deterministic platform recommendations', async () => {
    const res = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recommendations.length).toBeGreaterThan(0);
    expect(res.body.data.recommendations[0]).toHaveProperty('title');
    expect(res.body.data.recommendations[0]).toHaveProperty('action');
  });

  it('POST /api/v1/recommendations/:id/dismiss should dismiss recommendation for user', async () => {
    const recsRes = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${userToken}`);

    const firstRec = recsRes.body.data.recommendations[0];
    expect(firstRec).toBeDefined();

    const dismissRes = await request(app)
      .post(`/api/v1/recommendations/${firstRec.id}/dismiss`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(dismissRes.status).toBe(200);
    expect(dismissRes.body.data.dismissed).toBe(true);

    // Verify dismissed recommendation is excluded
    const afterRes = await request(app)
      .get('/api/v1/recommendations')
      .set('Authorization', `Bearer ${userToken}`);

    const found = afterRes.body.data.recommendations.find((r: any) => r.id === firstRec.id);
    expect(found).toBeUndefined();
  });

  it('GET /api/v1/astrology/insights/:profileId should correlate multi-chart factors into structured observations', async () => {
    const res = await request(app)
      .get(`/api/v1/astrology/insights/${userProfile.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.insights.length).toBeGreaterThan(0);

    const firstInsight = res.body.data.insights[0];
    expect(firstInsight).toHaveProperty('title');
    expect(firstInsight).toHaveProperty('observation');
    expect(firstInsight).toHaveProperty('supportingFactors');
    expect(Array.isArray(firstInsight.supportingFactors)).toBe(true);
  });
});
