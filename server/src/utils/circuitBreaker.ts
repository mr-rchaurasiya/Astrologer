import { Logger } from '../observability/logger';

export type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

export interface CircuitBreakerOptions {
  failureThreshold?: number; // Number of failures before tripping (default: 5)
  resetTimeoutMs?: number;   // Time to wait before attempting half-open state (default: 30000ms)
  timeoutMs?: number;        // Individual call timeout (default: 10000ms)
}

export class CircuitBreaker {
  private state: CircuitState = 'CLOSED';
  private failureCount = 0;
  private successCount = 0;
  private nextAttempt = Date.now();
  private readonly failureThreshold: number;
  private readonly resetTimeoutMs: number;
  private readonly timeoutMs: number;

  constructor(public readonly name: string, options: CircuitBreakerOptions = {}) {
    this.failureThreshold = options.failureThreshold ?? 5;
    this.resetTimeoutMs = options.resetTimeoutMs ?? 30000;
    this.timeoutMs = options.timeoutMs ?? 10000;
  }

  public getState(): CircuitState {
    if (this.state === 'OPEN' && Date.now() >= this.nextAttempt) {
      this.state = 'HALF_OPEN';
    }
    return this.state;
  }

  public async execute<T>(action: () => Promise<T>, fallback?: () => Promise<T>): Promise<T> {
    const currentState = this.getState();

    if (currentState === 'OPEN') {
      Logger.warn(`⚡ CircuitBreaker [${this.name}] is OPEN. Executing fallback.`);
      if (fallback) return fallback();
      throw new Error(`CircuitBreaker [${this.name}] is OPEN: Service temporarily unavailable`);
    }

    try {
      // Execute with timeout promise race
      const result = await Promise.race([
        action(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error(`Timeout of ${this.timeoutMs}ms exceeded`)), this.timeoutMs)
        ),
      ]);

      this.onSuccess();
      return result;
    } catch (err: any) {
      this.onFailure(err);

      if (fallback) {
        Logger.warn(`⚡ CircuitBreaker [${this.name}] action failed, falling back: ${err.message}`);
        return fallback();
      }
      throw err;
    }
  }

  private onSuccess(): void {
    this.failureCount = 0;
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      Logger.info(`⚡ CircuitBreaker [${this.name}] recovered to CLOSED state.`);
    }
    this.successCount++;
  }

  private onFailure(error: any): void {
    this.failureCount++;
    Logger.warn(`⚡ CircuitBreaker [${this.name}] failure recorded (${this.failureCount}/${this.failureThreshold}): ${error.message}`);

    if (this.failureCount >= this.failureThreshold || this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
      Logger.error(`⚡ CircuitBreaker [${this.name}] TRIPPED to OPEN state. Reset in ${this.resetTimeoutMs}ms.`);
    }
  }

  public reset(): void {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.nextAttempt = Date.now();
  }

  public getStats() {
    return {
      name: this.name,
      state: this.getState(),
      failureCount: this.failureCount,
      successCount: this.successCount,
    };
  }
}
