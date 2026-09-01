import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import '../setup';

const app = createApp();

describe('Phase 8: End-to-End Platform Smoke Test', () => {
  const testEmail = `smoke_${Date.now()}@example.com`;
  const testPassword = 'Password123!';
  let accessToken: string;
  let profileId: string;

  it(
    'Flow: Register -> Login -> Create Profile -> Calculate Kundli -> Dasha -> Daily Insight -> Export -> Delete',
    async () => {
    // 1. Register User
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        name: 'Smoke Test User',
        email: testEmail,
        password: testPassword,
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    accessToken = regRes.body.data.accessToken;

    // 2. Create Birth Profile
    const profRes = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        name: 'Primary Native',
        relationship: 'self',
        dateOfBirth: '1992-08-24',
        timeOfBirth: '09:15:00',
        placeName: 'Varanasi',
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: 'Asia/Kolkata',
        timezoneOffset: 5.5,
        gender: 'male',
        isPrimary: true,
      });

    expect(profRes.status).toBe(201);
    expect(profRes.body.success).toBe(true);
    profileId = profRes.body.data.profile.id;

    // 3. Calculate Deterministic Vedic Chart
    const chartRes = await request(app)
      .get(`/api/v1/astrology/chart/${profileId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(chartRes.status).toBe(200);
    expect(chartRes.body.success).toBe(true);
    expect(chartRes.body.data.chart.ascendant).toBeDefined();
    expect(chartRes.body.data.chart.planets.length).toBe(9);

    // 4. Calculate Vimshottari Dasha Tree
    const dashaRes = await request(app)
      .get(`/api/v1/astrology/dasha/${profileId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(dashaRes.status).toBe(200);
    expect(dashaRes.body.success).toBe(true);
    expect(dashaRes.body.data.dashas.mahadashas.length).toBe(9);

    // 5. Generate Daily Insight
    const insightRes = await request(app)
      .post('/api/v1/ai/daily-insight')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        profileId,
        category: 'overall',
      });

    expect(insightRes.status).toBe(200);
    expect(insightRes.body.success).toBe(true);
    expect(insightRes.body.data.content).toBeDefined();

    // 6. User Data Export
    const exportRes = await request(app)
      .get('/api/v1/account/export')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(exportRes.status).toBe(200);
    expect(exportRes.body.birthProfiles.length).toBe(1);

    // 7. Cascade Delete Account
    const deleteRes = await request(app)
      .delete('/api/v1/account')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        password: testPassword,
        confirmationText: 'DELETE',
      });

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  }, 30000);
});
