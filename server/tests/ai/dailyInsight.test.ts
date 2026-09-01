import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import '../setup';

const app = createApp();

describe('Daily AI Astrology Insight & Caching API', () => {
  let userToken: string;
  let userBToken: string;
  let profileId: string;

  const profileData = {
    name: 'Astrology Seeker',
    relationship: 'self',
    dateOfBirth: '1992-08-20',
    timeOfBirth: '14:15:00',
    placeName: 'Varanasi, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'female',
  };

  const setupTestUsers = async () => {
    const userRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Insight User',
      email: 'insight_user@example.com',
      password: 'Password123',
    });
    userToken = userRes.body.data.accessToken;

    const userBRes = await request(app).post('/api/v1/auth/register').send({
      name: 'Insight User B',
      email: 'insight_user_b@example.com',
      password: 'Password123',
    });
    userBToken = userBRes.body.data.accessToken;

    const pRes = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${userToken}`)
      .send(profileData);
    profileId = pRes.body.data.profile.id;
  };

  it('POST /api/v1/ai/daily-insight > generates insight and returns cached: false on first call', async () => {
    await setupTestUsers();

    const todayStr = '2026-09-01';

    const res = await request(app)
      .post('/api/v1/ai/daily-insight')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        profileId,
        date: todayStr,
        category: 'career',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.category).toBe('career');
    expect(res.body.data.content).toBeDefined();
    expect(res.body.data.cached).toBe(false);
  });

  it('POST /api/v1/ai/daily-insight > returns cached: true on duplicate call for same date & category', async () => {
    await setupTestUsers();

    const todayStr = '2026-09-01';

    // First call generates
    await request(app)
      .post('/api/v1/ai/daily-insight')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        profileId,
        date: todayStr,
        category: 'finance',
      });

    // Second call reads cache
    const cachedRes = await request(app)
      .post('/api/v1/ai/daily-insight')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        profileId,
        date: todayStr,
        category: 'finance',
      });

    expect(cachedRes.status).toBe(200);
    expect(cachedRes.body.success).toBe(true);
    expect(cachedRes.body.data.cached).toBe(true);
  });

  it('SECURITY & USER ISOLATION > User B cannot generate or access User A daily insight', async () => {
    await setupTestUsers();

    const res = await request(app)
      .post('/api/v1/ai/daily-insight')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        profileId,
        category: 'overall',
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('unauthorized');
  });
});
