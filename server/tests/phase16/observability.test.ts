import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import '../setup';

const app = createApp();

describe('Phase 16: Observability & Prometheus Metrics Suite', () => {
  it('GET /api/v1/metrics returns Prometheus formatted exposition metrics', async () => {
    const res = await request(app).get('/api/v1/metrics');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/plain');
    expect(res.text).toContain('astrologer_process_uptime_seconds');
    expect(res.text).toContain('astrologer_cache_hits_total');
  });

  it('GET /api/v1/health/liveness returns live status', async () => {
    const res = await request(app).get('/api/v1/health/liveness');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('alive');
  });

  it('GET /api/v1/health/readiness returns ready status with subsystem details', async () => {
    const res = await request(app).get('/api/v1/health/readiness');
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ready');
    expect(res.body.data.subsystems.database).toBe('healthy');
  });
});
