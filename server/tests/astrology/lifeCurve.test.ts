import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { AstrologyService } from '../../src/astrology/service/astrology.service';
import { generateLifeCurve } from '../../src/astrology/lifeCurve/lifeCurve';
import '../setup';

const app = createApp();

describe('Deterministic Life Curve Engine & API', () => {
  let userAToken: string;
  let userBToken: string;
  let profileAId: string;

  const profileData = {
    name: 'Ramnevas',
    relationship: 'self',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30:00',
    placeName: 'Ujjain, Madhya Pradesh, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'male',
  };

  const setupUsers = async () => {
    const userARes = await request(app).post('/api/v1/auth/register').send({
      name: 'User A',
      email: 'usera_lc@example.com',
      password: 'Password123',
    });
    userAToken = userARes.body.data.accessToken;

    const userBRes = await request(app).post('/api/v1/auth/register').send({
      name: 'User B',
      email: 'userb_lc@example.com',
      password: 'Password123',
    });
    userBToken = userBRes.body.data.accessToken;

    const p1Res = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(profileData);
    profileAId = p1Res.body.data.profile.id;
  };

  it('generateLifeCurve produces deterministic scores bounded between 10 and 95', () => {
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profileData.dateOfBirth,
      timeOfBirth: profileData.timeOfBirth,
      latitude: profileData.latitude,
      longitude: profileData.longitude,
      timezone: profileData.timezone,
      timezoneOffset: profileData.timezoneOffset,
    });

    const result1 = generateLifeCurve('mock-id', chart, { horizonYears: 80, resolution: 'year' });
    const result2 = generateLifeCurve('mock-id', chart, { horizonYears: 80, resolution: 'year' });

    expect(result1.points.length).toBeGreaterThan(70);
    expect(result1.points.length).toBe(result2.points.length);

    // Verify determinism: identically equal points
    expect(result1.points[0].scores.overall).toBe(result2.points[0].scores.overall);
    expect(result1.points[10].scores.career).toBe(result2.points[10].scores.career);

    // Check bounds
    for (const pt of result1.points) {
      expect(pt.scores.overall).toBeGreaterThanOrEqual(10);
      expect(pt.scores.overall).toBeLessThanOrEqual(95);
      expect(pt.scores.career).toBeGreaterThanOrEqual(10);
      expect(pt.scores.career).toBeLessThanOrEqual(95);
      expect(pt.scores.finance).toBeGreaterThanOrEqual(10);
      expect(pt.scores.finance).toBeLessThanOrEqual(95);
      expect(pt.mahadasha).toBeDefined();
    }
  });

  it('GET /api/v1/astrology/life-curve/:profileId > retrieves life curve for owned profile', async () => {
    await setupUsers();

    const res = await request(app)
      .get(`/api/v1/astrology/life-curve/${profileAId}?resolution=year`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.points.length).toBeGreaterThan(0);
    expect(res.body.data.mahadashaTransitions.length).toBeGreaterThan(0);
    expect(res.body.data.scoreDisclaimer).toContain('visualization metrics');
  });

  it('SECURITY & USER ISOLATION > User B must NOT be able to access User A life curve', async () => {
    await setupUsers();

    const res = await request(app)
      .get(`/api/v1/astrology/life-curve/${profileAId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('unauthorized');
  });
});
