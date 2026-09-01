import { describe, it, expect } from 'vitest';
import { BackgroundJobQueue } from '../src/queue/jobQueue';

describe('Phase 11: Background Job Queue Suite', () => {
  it('enqueues and processes asynchronous background jobs', async () => {
    const queue = new BackgroundJobQueue();
    let jobProcessed = false;
    let receivedData = null;

    queue.process('send_email', async (data: any) => {
      jobProcessed = true;
      receivedData = data;
    });

    const jobId = await queue.enqueue('send_email', { to: 'user@example.com', subject: 'Vedic Kundli Ready' });
    expect(jobId).toBeDefined();

    // Allow setImmediate to process job
    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(jobProcessed).toBe(true);
    expect(receivedData).toEqual({ to: 'user@example.com', subject: 'Vedic Kundli Ready' });

    const stats = queue.getStats();
    expect(stats.completedCount).toBe(1);
    expect(stats.failedCount).toBe(0);

    await queue.shutdown();
  });
});
