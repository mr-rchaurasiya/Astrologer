import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import '../setup';

const app = createApp();

describe('Astrology API Endpoints & Security', () => {
  let userAToken: string;
  let userBToken: string;
  let userAProfileId: string;

  const validProfileData = {
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

  const setupUsers = async () => {
    const userARes = await request(app).post('/api/v1/auth/register').send({
      name: 'User A',
      email: 'usera_astro@example.com',
      password: 'Password123',
    });
    userAToken = userARes.body.data.accessToken;

    const userBRes = await request(app).post('/api/v1/auth/register').send({
      name: 'User B',
      email: 'userb_astro@example.com',
      password: 'Password123',
    });
    userBToken = userBRes.body.data.accessToken;

    const profileRes = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(validProfileData);
    userAProfileId = profileRes.body.data.profile.id;
  };

  describe('POST /api/v1/astrology/calculate', () => {
    it('should calculate chart with direct coordinates', async () => {
      await setupUsers();

      const res = await request(app)
        .post('/api/v1/astrology/calculate')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({
          dateOfBirth: '1995-08-20',
          timeOfBirth: '14:15:00',
          latitude: 25.3176,
          longitude: 82.9739,
          timezone: 'Asia/Kolkata',
          timezoneOffset: 5.5,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chart).toBeDefined();
      expect(res.body.data.chart.planets.length).toBe(9);
      expect(res.body.data.chart.divisionalCharts.d9).toBeDefined();
    });

    it('should calculate chart with profileId', async () => {
      await setupUsers();

      const res = await request(app)
        .post('/api/v1/astrology/calculate')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ profileId: userAProfileId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chart.birthInput.dateOfBirth).toBe('1990-05-15');
    });
  });

  describe('GET /api/v1/astrology/chart/:profileId', () => {
    it('should retrieve calculated birth chart for owned profile', async () => {
      await setupUsers();

      const res = await request(app)
        .get(`/api/v1/astrology/chart/${userAProfileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.chart.ascendant).toBeDefined();
      expect(res.body.data.chart.houses.length).toBe(12);
    });

    it('User B must NOT be able to calculate/retrieve User A\'s chart (returns 404)', async () => {
      await setupUsers();

      const res = await request(app)
        .get(`/api/v1/astrology/chart/${userAProfileId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PROFILE_NOT_FOUND');
    });
  });

  describe('GET /api/v1/astrology/dasha/:profileId', () => {
    it('should retrieve Vimshottari Dasha tree for owned profile', async () => {
      await setupUsers();

      const res = await request(app)
        .get(`/api/v1/astrology/dasha/${userAProfileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.dashas.mahadashas.length).toBe(9);
    });
  });

  describe('Public Planetary APIs', () => {
    it('should return daily Panchang for given location', async () => {
      const res = await request(app).get('/api/v1/astrology/panchang/daily?latitude=28.6139&longitude=77.2090');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.panchang.tithi).toBeDefined();
      expect(res.body.data.panchang.sunTimes.sunrise).toBeDefined();
    });

    it('should return current real-time planetary transits', async () => {
      const res = await request(app).get('/api/v1/astrology/transits/current');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.transits.planets.length).toBe(9);
      expect(res.body.data.transits.ayanamsa).toBeGreaterThan(23.0);
    });
  });
});
