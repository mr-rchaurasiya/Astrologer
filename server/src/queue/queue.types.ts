export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface JobOptions {
  maxRetries?: number;
  backoffMs?: number;
  delayMs?: number;
}

export interface Job<T = any> {
  id: string;
  name: string;
  data: T;
  attempts: number;
  maxRetries: number;
  backoffMs: number;
  status: JobStatus;
  error?: string;
  createdAt: Date;
  updatedAt: Date;
}

export type JobHandler<T = any> = (data: T) => Promise<void>;

export interface QueueStats {
  pendingCount: number;
  processingCount: number;
  completedCount: number;
  failedCount: number;
  totalProcessed: number;
}

export interface IJobQueue {
  enqueue<T>(name: string, data: T, options?: JobOptions): Promise<string>;
  process<T>(name: string, handler: JobHandler<T>): void;
  getStats(): QueueStats;
  shutdown(): Promise<void>;
}
