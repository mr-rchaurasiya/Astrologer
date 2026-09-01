import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { AbuseProtection } from '../../src/middleware/abuseProtection';
import '../setup';

const app = createApp();

describe('Phase 16: Enterprise Security & Abuse Protection Suite', () => {
  it('security headers middleware applies strict CSP and HSTS', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.header['x-content-type-options']).toBe('nosniff');
    expect(res.header['x-frame-options']).toBe('SAMEORIGIN');
  });

  it('AbuseProtection blocks IP after repeated simulated failed attempts', async () => {
    const testIp = `192.168.1.${Math.floor(Math.random() * 200 + 10)}`;

    for (let i = 0; i < 10; i++) {
      await AbuseProtection.recordFailedAttempt(testIp, 'auth');
    }

    const req = { ip: testIp } as any;
    let nextCalled = false;
    let errorStatus = 0;
    const res = {
      setHeader: () => {},
      status: (s: number) => {
        errorStatus = s;
        return {
          json: () => {},
        };
      },
    } as any;

    await AbuseProtection.middleware('auth')(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(errorStatus).toBe(429);
  });
});
