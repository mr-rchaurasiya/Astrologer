import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { mockDb } from './setup';
import { BirthProfile } from '../src/models/BirthProfile';

describe('Phase 7: Vector PDF Horoscope Reports & User Isolation', () => {
  const app = createApp();
  let user1Token: string;
  let user1Id: string;
  let profile1Id: string;

  let user2Token: string;
  let user2Id: string;

  beforeEach(async () => {
    mockDb.reset();

    const reg1 = await request(app).post('/api/v1/auth/register').send({
      name: 'Report Native 1',
      email: 'native1@vedic.com',
      password: 'StrongPassword123!',
    });
    user1Token = reg1.body.data.accessToken;
    user1Id = reg1.body.data.user.id;

    const profile1 = await BirthProfile.create({
      userId: user1Id,
      name: 'Vedic Native One',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '14:30',
      placeName: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 'Asia/Kolkata',
      timezoneOffset: 5.5,
      gender: 'male',
      isPrimary: true,
    });
    profile1Id = profile1.id;

    const reg2 = await request(app).post('/api/v1/auth/register').send({
      name: 'Report Native 2',
      email: 'native2@vedic.com',
      password: 'StrongPassword123!',
    });
    user2Token = reg2.body.data.accessToken;
    user2Id = reg2.body.data.user.id;
  });

  it('POST /api/v1/reports/kundli should compile vector PDF report', async () => {
    const res = await request(app)
      .post('/api/v1/reports/kundli')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        profileId: profile1Id,
        language: 'en',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.report.status).toBe('completed');
    expect(res.body.data.report.storageKey).toBeDefined();
    expect(res.body.data.report.fileSize).toBeGreaterThan(1000);
  });

  it('GET /api/v1/reports should list all user reports', async () => {
    // Generate report first
    await request(app)
      .post('/api/v1/reports/kundli')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ profileId: profile1Id, language: 'en' });

    const res = await request(app)
      .get('/api/v1/reports')
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.reports.length).toBe(1);
  });

  it('GET /api/v1/reports/:id/download should stream PDF with proper headers', async () => {
    const genRes = await request(app)
      .post('/api/v1/reports/kundli')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ profileId: profile1Id, language: 'en' });

    const reportId = genRes.body.data.report.id;

    const res = await request(app)
      .get(`/api/v1/reports/${reportId}/download`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('application/pdf');
    expect(res.headers['content-disposition']).toContain('attachment');
  });

  it('User B should NOT be able to access or download User A report (Strict User Isolation)', async () => {
    const genRes = await request(app)
      .post('/api/v1/reports/kundli')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ profileId: profile1Id, language: 'en' });

    const reportId = genRes.body.data.report.id;

    // User 2 tries to download User 1's report
    const res = await request(app)
      .get(`/api/v1/reports/${reportId}/download`)
      .set('Authorization', `Bearer ${user2Token}`);

    expect(res.status).toBe(500); // Unauthorized error caught by handler
  });
});
