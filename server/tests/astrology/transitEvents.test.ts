import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { AstrologyService } from '../../src/astrology/service/astrology.service';
import { calculateTransitTimeline } from '../../src/astrology/transit/transitEvents';
import '../setup';

const app = createApp();

describe('Transit Events Timeline & API', () => {
  let userToken: string;
  let profileId: string;

  const profileData = {
    name: 'Varahamihira',
    relationship: 'self',
    dateOfBirth: '1990-05-15',
    timeOfBirth: '06:30:00',
    placeName: 'Ujjain, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'male',
  };

  const setupTestUser = async () => {
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Transit Tester',
      email: 'transit_tester@example.com',
      password: 'Password123',
    });
    userToken = userRes.body.data.accessToken;

    const pRes = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(profileData);
    profileId = pRes.body.data.profile.id;
  };

  it('calculateTransitTimeline detects events chronologically', () => {
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profileData.dateOfBirth,
      timeOfBirth: profileData.timeOfBirth,
      latitude: profileData.latitude,
      longitude: profileData.longitude,
      timezone: profileData.timezone,
      timezoneOffset: profileData.timezoneOffset,
    });

    const result = calculateTransitTimeline('mock-p-id', chart, {
      startDate: new Date('2025-01-01T00:00:00Z'),
      daysAhead: 365,
    });

    expect(result.events.length).toBeGreaterThan(0);
    expect(result.events[0].date).toBeDefined();
    expect(result.events[0].planet).toBeDefined();
    expect(result.events[0].eventType).toBeDefined();

    // Verify chronological order
    for (let i = 1; i < result.events.length; i++) {
      const prevDate = new Date(result.events[i - 1].date).getTime();
      const currDate = new Date(result.events[i].date).getTime();
      expect(currDate).toBeGreaterThanOrEqual(prevDate);
    }
  });

  it('GET /api/v1/astrology/transits/timeline > returns timeline events for authenticated profile', async () => {
    await setupTestUser();

    const res = await request(app)
      .get(`/api/v1/astrology/transits/timeline?profileId=${profileId}&daysAhead=180`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.events)).toBe(true);
  });

  it('GET /api/v1/astrology/transits/daily > returns daily Gochar facts', async () => {
    await setupTestUser();

    const res = await request(app)
      .get(`/api/v1/astrology/transits/daily?profileId=${profileId}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.transits.planets.length).toBe(9);
  });
});
