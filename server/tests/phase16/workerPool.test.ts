import { describe, it, expect } from 'vitest';
import { WorkerPool } from '../../src/queue/workerPool';

describe('Phase 16: Background Worker Pool & Categorized Queues Suite', () => {
  it('enqueues and executes background job with category tracking and stats', async () => {
    let executed = false;

    WorkerPool.registerExecutor('GENERATE_PDF_DOSSIER', async (data: { profileId: string }) => {
      expect(data.profileId).toBe('profile_123');
      executed = true;
    });

    const jobId = WorkerPool.enqueue('PDF_DOSSIER', 'GENERATE_PDF_DOSSIER', {
      profileId: 'profile_123',
    });

    expect(jobId).toBeDefined();

    // Allow event loop tick for executor
    await new Promise((resolve) => setTimeout(resolve, 50));

    const stats = WorkerPool.getStats();
    expect(stats.totalProcessed).toBeGreaterThanOrEqual(1);
    expect(executed).toBe(true);
  });
});
