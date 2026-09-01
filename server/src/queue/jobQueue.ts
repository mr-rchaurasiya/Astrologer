import { IJobQueue, Job, JobHandler, JobOptions, QueueStats } from './queue.types';
import { Logger } from '../observability/logger';

export class BackgroundJobQueue implements IJobQueue {
  private jobs: Map<string, Job> = new Map();
  private handlers: Map<string, JobHandler> = new Map();
  private isShuttingDown = false;
  private totalProcessed = 0;
  private completedCount = 0;
  private failedCount = 0;

  public async enqueue<T>(name: string, data: T, options?: JobOptions): Promise<string> {
    if (this.isShuttingDown) {
      throw new Error(`Queue is shutting down. Cannot enqueue job: ${name}`);
    }

    const id = `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: Job<T> = {
      id,
      name,
      data,
      attempts: 0,
      maxRetries: options?.maxRetries ?? 3,
      backoffMs: options?.backoffMs ?? 1000,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.jobs.set(id, job);

    // Schedule execution (honoring optional delay)
    if (options?.delayMs && options.delayMs > 0) {
      setTimeout(() => this.executeJob(id), options.delayMs);
    } else {
      setImmediate(() => this.executeJob(id));
    }

    return id;
  }

  public process<T>(name: string, handler: JobHandler<T>): void {
    this.handlers.set(name, handler as JobHandler);
  }

  private async executeJob(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (!job || job.status === 'processing' || this.isShuttingDown) return;

    const handler = this.handlers.get(job.name);
    if (!handler) {
      // Handler not registered yet; leave in pending state
      return;
    }

    job.status = 'processing';
    job.attempts++;
    job.updatedAt = new Date();

    try {
      await handler(job.data);
      job.status = 'completed';
      job.updatedAt = new Date();
      this.completedCount++;
      this.totalProcessed++;
      // Clean up completed job after 5 minutes to prevent memory leaks
      setTimeout(() => this.jobs.delete(jobId), 300000);
    } catch (err: any) {
      job.error = err.message || String(err);
      Logger.warn(`⚠️ Background job ${job.name} (${job.id}) attempt ${job.attempts} failed: ${job.error}`);

      if (job.attempts < job.maxRetries) {
        job.status = 'pending';
        const delay = job.backoffMs * Math.pow(2, job.attempts - 1);
        setTimeout(() => this.executeJob(jobId), delay);
      } else {
        job.status = 'failed';
        job.updatedAt = new Date();
        this.failedCount++;
        this.totalProcessed++;
        Logger.error(`❌ Background job ${job.name} (${job.id}) permanently failed after ${job.attempts} attempts`);
      }
    }
  }

  public getStats(): QueueStats {
    let pendingCount = 0;
    let processingCount = 0;

    for (const job of this.jobs.values()) {
      if (job.status === 'pending') pendingCount++;
      if (job.status === 'processing') processingCount++;
    }

    return {
      pendingCount,
      processingCount,
      completedCount: this.completedCount,
      failedCount: this.failedCount,
      totalProcessed: this.totalProcessed,
    };
  }

  public async shutdown(): Promise<void> {
    this.isShuttingDown = true;
    Logger.info('🛑 Background job queue shutting down. Draining active jobs...');
    // Wait for in-flight processing jobs (up to 5s)
    const timeout = Date.now() + 5000;
    while (Date.now() < timeout) {
      const active = Array.from(this.jobs.values()).some((j) => j.status === 'processing');
      if (!active) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

let globalQueueInstance: IJobQueue | null = null;

export const getJobQueue = (): IJobQueue => {
  if (!globalQueueInstance) {
    globalQueueInstance = new BackgroundJobQueue();
  }
  return globalQueueInstance;
};
