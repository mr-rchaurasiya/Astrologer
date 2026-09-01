export interface CacheMetricsData {
  hits: number;
  misses: number;
  writes: number;
  deletes: number;
  expirations: number;
  errors: number;
  size: number;
  hitRatio: number;
  approxMemoryBytes: number;
}

export class CacheMetricsTracker {
  private static hits: number = 0;
  private static misses: number = 0;
  private static writes: number = 0;
  private static deletes: number = 0;
  private static expirations: number = 0;
  private static errors: number = 0;

  public static recordHit(): void {
    this.hits++;
  }

  public static recordMiss(): void {
    this.misses++;
  }

  public static recordWrite(): void {
    this.writes++;
  }

  public static recordDelete(): void {
    this.deletes++;
  }

  public static recordExpiration(): void {
    this.expirations++;
  }

  public static recordError(): void {
    this.errors++;
  }

  public static getMetrics(currentSize: number = 0): CacheMetricsData {
    const totalRequests = this.hits + this.misses;
    const hitRatio = totalRequests > 0 ? parseFloat((this.hits / totalRequests).toFixed(4)) : 0;
    // Approximate memory: size * estimated 1.5KB per entry average
    const approxMemoryBytes = currentSize * 1536;

    return {
      hits: this.hits,
      misses: this.misses,
      writes: this.writes,
      deletes: this.deletes,
      expirations: this.expirations,
      errors: this.errors,
      size: currentSize,
      hitRatio,
      approxMemoryBytes,
    };
  }

  public static reset(): void {
    this.hits = 0;
    this.misses = 0;
    this.writes = 0;
    this.deletes = 0;
    this.expirations = 0;
    this.errors = 0;
  }
}
