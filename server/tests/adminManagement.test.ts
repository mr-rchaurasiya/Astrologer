import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { mockDb } from './setup';

describe('Phase 7: Admin Dashboard & Platform Security Controls', () => {
  const app = createApp();
  let adminToken: string;
  let userToken: string;
  let regularUserId: string;

  beforeEach(async () => {
    mockDb.reset();

    // 1. Create Admin
    const adminReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Super Admin',
      email: 'admin@vedic.com',
      password: 'AdminPassword123!',
    });
    // Manually promote to admin in mock DB
    const adminUser = mockDb.users.find((u) => u._id.toString() === adminReg.body.data.user.id);
    if (adminUser) adminUser.role = 'admin';

    // Re-issue login to get token with admin role
    const adminLogin = await request(app).post('/api/v1/auth/login').send({
      email: 'admin@vedic.com',
      password: 'AdminPassword123!',
    });
    adminToken = adminLogin.body.data.accessToken;

    // 2. Create Regular User
    const userReg = await request(app).post('/api/v1/auth/register').send({
      name: 'Regular Seeker',
      email: 'regular@vedic.com',
      password: 'RegularPassword123!',
    });
    userToken = userReg.body.data.accessToken;
    regularUserId = userReg.body.data.user.id;
  });

  it('GET /api/v1/admin/analytics/overview should return aggregate platform telemetry for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/overview')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.total).toBe(2);
    expect(res.body.data.payments).toBeDefined();
  });

  it('GET /api/v1/admin/analytics/overview should return 403 Forbidden for non-admin user', async () => {
    const res = await request(app)
      .get('/api/v1/admin/analytics/overview')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/admin/users should return paginated user accounts for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.users.length).toBe(2);
  });

  it('PUT /api/v1/admin/users/:id/status should allow admin to toggle user status', async () => {
    const res = await request(app)
      .put(`/api/v1/admin/users/${regularUserId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.isActive).toBe(false);
  });

  it('GET /api/v1/admin/subscriptions should list subscription ledger for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/subscriptions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subscriptions).toBeDefined();
  });

  it('GET /api/v1/admin/audit-logs should return security audit trail for admin', async () => {
    const res = await request(app)
      .get('/api/v1/admin/audit-logs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.auditLogs).toBeDefined();
  });
});
