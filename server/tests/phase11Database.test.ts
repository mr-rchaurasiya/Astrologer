import { describe, it, expect } from 'vitest';
import { MONGO_OPTIONS, getDatabaseHealth } from '../src/config/database';

describe('Phase 11: Production Database Hardening Suite', () => {
  it('configures production connection pool and timeout parameters', () => {
    expect(MONGO_OPTIONS.maxPoolSize).toBe(50);
    expect(MONGO_OPTIONS.minPoolSize).toBe(5);
    expect(MONGO_OPTIONS.serverSelectionTimeoutMS).toBe(5000);
    expect(MONGO_OPTIONS.socketTimeoutMS).toBe(45000);
    expect(MONGO_OPTIONS.connectTimeoutMS).toBe(10000);
    expect(MONGO_OPTIONS.retryWrites).toBe(true);
    expect(MONGO_OPTIONS.retryReads).toBe(true);
  });

  it('provides safe database health metrics without exposing authentication credentials', () => {
    const health = getDatabaseHealth();
    expect(health).toHaveProperty('state');
    expect(health).toHaveProperty('isHealthy');
    expect(health).toHaveProperty('readyState');
    expect(typeof health.isHealthy).toBe('boolean');
    // Ensure no password or URI fields exist in health output
    expect((health as any).password).toBeUndefined();
    expect((health as any).uri).toBeUndefined();
  });
});
