import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { DistributedLock } from '../../src/utils/distributedLock';
import '../setup';

const app = createApp();

describe('Phase 16: Horizontal Scaling & Stateless Operation Suite', () => {
  it('propagates X-Request-ID across HTTP responses for request correlation', async () => {
    const res = await request(app).get('/api/v1/health');
    expect(res.status).toBe(200);
    expect(res.header['x-request-id']).toBeDefined();
  });

  it('DistributedLock acquires and releases lock safely between simulated concurrent workers', async () => {
    const resource = `chart_export_${Date.now()}`;
    const worker1 = 'worker_node_1';
    const worker2 = 'worker_node_2';

    const lock1 = await DistributedLock.acquire(resource, worker1, { ttlSeconds: 2 });
    expect(lock1).toBe(true);

    // Worker 2 fails to acquire while worker 1 holds it
    const lock2 = await DistributedLock.acquire(resource, worker2, { maxRetries: 0 });
    expect(lock2).toBe(false);

    // Worker 1 releases
    const release = await DistributedLock.release(resource, worker1);
    expect(release).toBe(true);

    // Worker 2 now acquires
    const lock2Retry = await DistributedLock.acquire(resource, worker2, { maxRetries: 0 });
    expect(lock2Retry).toBe(true);
    await DistributedLock.release(resource, worker2);
  });
});
