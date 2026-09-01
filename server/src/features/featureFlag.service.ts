import { FEATURE_FLAGS, FeatureFlagKey } from './featureFlags';
import { Subscription } from '../models/Subscription';

export interface RolloutConfig {
  percentage?: number; // 0 to 100
  enabled?: boolean;
}

export class FeatureFlagService {
  private static overrides: Map<string, boolean> = new Map();
  private static killSwitches: Set<string> = new Set();
  private static rollouts: Map<string, number> = new Map();

  /**
   * Deterministic hash to map (userId, featureKey) to integer 0..99 for stable rollouts.
   */
  private static getHashBucket(userId: string, key: string): number {
    let hash = 0;
    const str = `${userId}:${key}`;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  }

  public static async getFlagsForUser(userId?: string): Promise<Record<FeatureFlagKey, boolean>> {
    let userPlan: 'free' | 'pro' | 'premium' = 'free';

    if (userId) {
      const sub = await Subscription.findOne({ userId: userId as any });
      if (sub && sub.status === 'active') {
        userPlan = sub.plan;
      }
    }

    const flags: Record<string, boolean> = {};

    for (const [key, def] of Object.entries(FEATURE_FLAGS) as Array<[FeatureFlagKey, any]>) {
      // 1. Emergency Kill Switch check
      if (this.killSwitches.has(key)) {
        flags[key] = false;
        continue;
      }

      // 2. Explicit Admin Override check
      if (this.overrides.has(key)) {
        flags[key] = this.overrides.get(key)!;
        continue;
      }

      // 3. Percentage Rollout check (if set)
      if (this.rollouts.has(key) && userId) {
        const bucket = this.getHashBucket(userId, key);
        const rolloutPct = this.rollouts.get(key)!;
        if (bucket >= rolloutPct) {
          flags[key] = false;
          continue;
        }
      }

      // 4. Plan tier requirement check
      if (def.minPlanRequired === 'premium' && userPlan !== 'premium') {
        flags[key] = false;
      } else if (def.minPlanRequired === 'pro' && userPlan === 'free') {
        flags[key] = false;
      } else {
        flags[key] = def.defaultEnabled;
      }
    }

    return flags as Record<FeatureFlagKey, boolean>;
  }

  public static setOverride(key: FeatureFlagKey, enabled: boolean): void {
    this.overrides.set(key, enabled);
  }

  public static setKillSwitch(key: FeatureFlagKey, active: boolean): void {
    if (active) this.killSwitches.add(key);
    else this.killSwitches.delete(key);
  }

  public static setRolloutPercentage(key: FeatureFlagKey, percentage: number): void {
    const clamped = Math.max(0, Math.min(100, percentage));
    this.rollouts.set(key, clamped);
  }

  public static clearOverrides(): void {
    this.overrides.clear();
    this.killSwitches.clear();
    this.rollouts.clear();
  }

  public static isEnabled(key: FeatureFlagKey): boolean {
    if (this.killSwitches.has(key)) return false;
    if (this.overrides.has(key)) return this.overrides.get(key)!;
    return FEATURE_FLAGS[key]?.defaultEnabled ?? false;
  }
}
