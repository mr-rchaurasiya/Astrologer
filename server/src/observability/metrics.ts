export interface AppMetricsSnapshot {
  totalRequests: number;
  statusCodes: Record<string, number>;
  routeLatency: Record<string, { count: number; totalMs: number; avgMs: number; maxMs: number }>;
  activeErrors: number;
  uptimeSeconds: number;
  memoryUsage: NodeJS.MemoryUsage;
}

export class ApplicationMetrics {
  private static totalRequests = 0;
  private static statusCodes: Record<string, number> = {};
  private static routeLatency: Record<string, { count: number; totalMs: number; maxMs: number }> = {};
  private static activeErrors = 0;
  private static startTime = Date.now();

  public static recordRequest(route: string, statusCode: number, latencyMs: number): void {
    this.totalRequests++;

    const statusGroup = `${Math.floor(statusCode / 100)}xx`;
    this.statusCodes[statusGroup] = (this.statusCodes[statusGroup] || 0) + 1;
    this.statusCodes[statusCode.toString()] = (this.statusCodes[statusCode.toString()] || 0) + 1;

    if (statusCode >= 500) {
      this.activeErrors++;
    }

    const normalizedRoute = route.split('?')[0] || '/';
    if (!this.routeLatency[normalizedRoute]) {
      this.routeLatency[normalizedRoute] = { count: 0, totalMs: 0, maxMs: 0 };
    }

    this.routeLatency[normalizedRoute].count++;
    this.routeLatency[normalizedRoute].totalMs += latencyMs;
    if (latencyMs > this.routeLatency[normalizedRoute].maxMs) {
      this.routeLatency[normalizedRoute].maxMs = latencyMs;
    }
  }

  public static getSnapshot(): AppMetricsSnapshot {
    const calculatedLatency: Record<string, { count: number; totalMs: number; avgMs: number; maxMs: number }> = {};

    for (const [route, stats] of Object.entries(this.routeLatency)) {
      calculatedLatency[route] = {
        count: stats.count,
        totalMs: stats.totalMs,
        avgMs: stats.count > 0 ? Math.round(stats.totalMs / stats.count) : 0,
        maxMs: stats.maxMs,
      };
    }

    return {
      totalRequests: this.totalRequests,
      statusCodes: this.statusCodes,
      routeLatency: calculatedLatency,
      activeErrors: this.activeErrors,
      uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
      memoryUsage: process.memoryUsage(),
    };
  }

  public static reset(): void {
    this.totalRequests = 0;
    this.statusCodes = {};
    this.routeLatency = {};
    this.activeErrors = 0;
  }
}
