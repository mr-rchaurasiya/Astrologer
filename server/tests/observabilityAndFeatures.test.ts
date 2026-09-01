import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import { ApplicationMetrics } from '../src/observability/metrics';
import { FeatureFlagService } from '../src/features/featureFlag.service';
import './setup';

const app = createApp();

describe('Phase 9: Observability, Cache Metrics & Feature Flags API', () => {
  let adminToken: string;
  let userToken: string;

  beforeEach(async () => {
    const admin = await User.create({
      name: 'Admin Obs User',
      email: 'admin_obs@example.com',
      passwordHash: 'hash',
      role: 'admin',
      isActive: true,
    });
    adminToken = generateAccessToken(admin);

    const user = await User.create({
      name: 'Regular Obs User',
      email: 'user_obs@example.com',
      passwordHash: 'hash',
      role: 'user',
      isActive: true,
    });
    userToken = generateAccessToken(user);
  });

  it('GET /api/v1/health/ready should return structured readiness with safe subsystem checks', async () => {
    const res = await request(app).get('/api/v1/health/ready');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subsystems).toHaveProperty('database');
    expect(res.body.data.subsystems).toHaveProperty('cache');
    expect(res.body.data.subsystems).toHaveProperty('ai');
    expect(res.body.data.subsystems).toHaveProperty('payments');
  });

  it('GET /api/v1/features should return resolved feature flags for user session', async () => {
    const res = await request(app)
      .get('/api/v1/features')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.flags).toHaveProperty('AI_MEMORY');
    expect(res.body.data.flags).toHaveProperty('SMART_RECOMMENDATIONS');
    expect(res.body.data.flags).toHaveProperty('ADVANCED_INSIGHTS');
  });

  it('GET /api/v1/admin/cache/metrics should return cache performance metrics for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/cache/metrics')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.metrics).toHaveProperty('hits');
    expect(res.body.data.metrics).toHaveProperty('misses');
    expect(res.body.data.metrics).toHaveProperty('hitRatio');
  });

  it('GET /api/v1/admin/ai/usage should return AI token telemetry and estimated costs', async () => {
    const res = await request(app)
      .get('/api/v1/admin/ai/usage')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalRequests');
    expect(res.body.data).toHaveProperty('totalTokens');
    expect(res.body.data).toHaveProperty('totalCostUsd');
  });

  it('POST /api/v1/analytics/events and GET /api/v1/analytics/activity should track and retrieve user product telemetry', async () => {
    const trackRes = await request(app)
      .post('/api/v1/analytics/events')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        event: 'kundli_viewed',
        metadata: { chartType: 'd1' },
      });

    expect(trackRes.status).toBe(201);
    expect(trackRes.body.data.tracked).toBe(true);

    const actRes = await request(app)
      .get('/api/v1/analytics/activity')
      .set('Authorization', `Bearer ${userToken}`);

    expect(actRes.status).toBe(200);
    expect(actRes.body.data.activities.length).toBeGreaterThan(0);
    expect(actRes.body.data.activities[0].event).toBe('kundli_viewed');
  });
});
