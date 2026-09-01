import { Logger } from '../observability/logger';

export type WorkerCategory =
  | 'AI_REPORTS'
  | 'PDF_DOSSIER'
  | 'PUSH_NOTIFICATIONS'
  | 'DAILY_INSIGHTS'
  | 'ANALYTICS_FLUSH'
  | 'WEBHOOK_RETRY'
  | 'AFFILIATE_COMMISSION';

export interface WorkerJob<T = any> {
  id: string;
  category: WorkerCategory;
  name: string;
  data: T;
  attempts: number;
  maxRetries: number;
  backoffMs: number;
  status: 'queued' | 'active' | 'completed' | 'failed' | 'dead_letter';
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobExecutor<T = any> = (data: T) => Promise<void>;

export class WorkerPool {
  private static queues: Map<WorkerCategory, WorkerJob[]> = new Map();
  private static executors: Map<string, JobExecutor> = new Map();
  private static activeJobs: Map<string, WorkerJob> = new Map();
  private static deadLetterJobs: WorkerJob[] = [];
  private static isShuttingDown = false;
  private static totalProcessed = 0;
  private static totalFailed = 0;

  /**
   * Registers an executor for a specific job name.
   */
  public static registerExecutor<T>(jobName: string, executor: JobExecutor<T>): void {
    this.executors.set(jobName, executor);
  }

  /**
   * Enqueues a job into a specific worker category.
   */
  public static enqueue<T>(
    category: WorkerCategory,
    name: string,
    data: T,
    options?: { maxRetries?: number; backoffMs?: number }
  ): string {
    if (this.isShuttingDown) {
      throw new Error(`WorkerPool is shutting down. Cannot enqueue job: ${name}`);
    }

    const id = `job_${category.toLowerCase()}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const job: WorkerJob<T> = {
      id,
      category,
      name,
      data,
      attempts: 0,
      maxRetries: options?.maxRetries ?? 3,
      backoffMs: options?.backoffMs ?? 1000,
      status: 'queued',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (!this.queues.has(category)) {
      this.queues.set(category, []);
    }
    this.queues.get(category)!.push(job);

    // Schedule processing tick
    setImmediate(() => this.processNext(category));

    return id;
  }

  private static async processNext(category: WorkerCategory): Promise<void> {
    if (this.isShuttingDown) return;

    const queue = this.queues.get(category);
    if (!queue || queue.length === 0) return;

    const job = queue.shift();
    if (!job) return;

    const executor = this.executors.get(job.name);
    if (!executor) {
      Logger.warn(`⚠️ No executor registered for job: ${job.name}`);
      queue.push(job);
      return;
    }

    job.status = 'active';
    job.attempts++;
    job.updatedAt = new Date();
    this.activeJobs.set(job.id, job);

    try {
      await executor(job.data);
      job.status = 'completed';
      job.updatedAt = new Date();
      this.activeJobs.delete(job.id);
      this.totalProcessed++;
    } catch (err: any) {
      job.error = err.message || String(err);
      this.activeJobs.delete(job.id);

      if (job.attempts < job.maxRetries) {
        job.status = 'queued';
        const delay = job.backoffMs * Math.pow(2, job.attempts - 1);
        Logger.warn(`⚠️ Worker job ${job.name} (${job.id}) failed (attempt ${job.attempts}/${job.maxRetries}). Retrying in ${delay}ms: ${job.error}`);
        setTimeout(() => {
          if (!this.queues.has(category)) this.queues.set(category, []);
          this.queues.get(category)!.push(job);
          this.processNext(category);
        }, delay);
      } else {
        job.status = 'dead_letter';
        job.updatedAt = new Date();
        this.deadLetterJobs.push(job);
        this.totalFailed++;
        Logger.error(`❌ Worker job ${job.name} (${job.id}) moved to DEAD LETTER queue after ${job.attempts} attempts: ${job.error}`);
      }
    }

    // Process subsequent queued jobs in this category
    if (queue.length > 0) {
      setImmediate(() => this.processNext(category));
    }
  }

  public static getStats() {
    const queueDepths: Record<string, number> = {};
    for (const [cat, q] of this.queues.entries()) {
      queueDepths[cat] = q.length;
    }

    return {
      activeJobsCount: this.activeJobs.size,
      deadLetterCount: this.deadLetterJobs.length,
      totalProcessed: this.totalProcessed,
      totalFailed: this.totalFailed,
      queueDepths,
    };
  }

  public static async drain(timeoutMs = 5000): Promise<void> {
    this.isShuttingDown = true;
    Logger.info('🛑 Draining worker pool...');

    const start = Date.now();
    while (this.activeJobs.size > 0 && Date.now() - start < timeoutMs) {
      await new Promise((r) => setTimeout(r, 100));
    }
    Logger.info('✅ Worker pool drained.');
  }
}
