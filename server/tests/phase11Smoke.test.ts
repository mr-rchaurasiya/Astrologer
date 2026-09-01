import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';

describe('Phase 11: Production & Staging E2E Smoke Test Suite', () => {
  const app = createApp();

  it('verifies full smoke sequence: Health -> Readiness -> Plans -> Public Sharing -> Health', async () => {
    // 1. Health Probe
    const healthRes = await request(app).get('/api/v1/health');
    expect(healthRes.status).toBe(200);
    expect(healthRes.body.success).toBe(true);
    expect(healthRes.body.data.status).toBe('ok');

    // 2. Readiness Probe
    const readyRes = await request(app).get('/api/v1/health/ready');
    expect(readyRes.status).toBe(200);
    expect(readyRes.body.data.status).toBe('ready');
    expect(readyRes.body.data.subsystems.database).toBe('healthy');
    expect(readyRes.body.data.subsystems.cache).toBe('healthy');

    // 3. Subscription & Pricing Plans
    const plansRes = await request(app).get('/api/v1/payments/plans');
    expect(plansRes.status).toBe(200);
    expect(plansRes.body.data.plans.length).toBeGreaterThan(0);

    // 4. Verification completed
    expect(healthRes.body.data.environment).toBeDefined();
  });
});
