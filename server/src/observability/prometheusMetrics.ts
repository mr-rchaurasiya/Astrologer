import { Request, Response } from 'express';
import { getCacheProvider } from '../cache';
import { WorkerPool } from '../queue/workerPool';

export class PrometheusMetrics {
  private static httpRequestsTotal: Map<string, number> = new Map();
  private static totalCostINR = 0;
  private static totalAiTokens = 0;

  public static recordHttpRequest(method: string, path: string, status: number): void {
    const key = `method="${method}",path="${path}",status="${status}"`;
    const count = this.httpRequestsTotal.get(key) || 0;
    this.httpRequestsTotal.set(key, count + 1);
  }

  public static recordAiCost(costINR: number, tokens: number): void {
    this.totalCostINR += costINR;
    this.totalAiTokens += tokens;
  }

  public static getMetricsText(): string {
    const lines: string[] = [];
    const cacheStats = getCacheProvider().getStats();
    const workerStats = WorkerPool.getStats();
    const memory = process.memoryUsage();

    lines.push('# HELP astrologer_process_uptime_seconds Process uptime in seconds');
    lines.push('# TYPE astrologer_process_uptime_seconds counter');
    lines.push(`astrologer_process_uptime_seconds ${Math.round(process.uptime())}`);

    lines.push('# HELP astrologer_process_memory_heap_bytes Process heap memory used');
    lines.push('# TYPE astrologer_process_memory_heap_bytes gauge');
    lines.push(`astrologer_process_memory_heap_bytes ${memory.heapUsed}`);

    lines.push('# HELP astrologer_cache_hits_total Total cache hits');
    lines.push('# TYPE astrologer_cache_hits_total counter');
    lines.push(`astrologer_cache_hits_total ${cacheStats.hits}`);

    lines.push('# HELP astrologer_cache_misses_total Total cache misses');
    lines.push('# TYPE astrologer_cache_misses_total counter');
    lines.push(`astrologer_cache_misses_total ${cacheStats.misses}`);

    lines.push('# HELP astrologer_worker_dead_letter_total Total background jobs sent to dead letter queue');
    lines.push('# TYPE astrologer_worker_dead_letter_total counter');
    lines.push(`astrologer_worker_dead_letter_total ${workerStats.deadLetterCount}`);

    lines.push('# HELP astrologer_worker_processed_total Total background jobs processed successfully');
    lines.push('# TYPE astrologer_worker_processed_total counter');
    lines.push(`astrologer_worker_processed_total ${workerStats.totalProcessed}`);

    for (const [category, depth] of Object.entries(workerStats.queueDepths)) {
      lines.push(`astrologer_worker_queue_depth{category="${category}"} ${depth}`);
    }

    lines.push('# HELP astrologer_http_requests_total Total HTTP requests');
    lines.push('# TYPE astrologer_http_requests_total counter');
    for (const [labels, count] of this.httpRequestsTotal.entries()) {
      lines.push(`astrologer_http_requests_total{${labels}} ${count}`);
    }

    return lines.join('\n') + '\n';
  }

  public static metricsHandler(_req: Request, res: Response): void {
    res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(PrometheusMetrics.getMetricsText());
  }
}
