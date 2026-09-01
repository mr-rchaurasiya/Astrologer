import { describe, it, expect } from 'vitest';
import { FeatureFlagService } from '../../src/features/featureFlag.service';
import '../setup';

describe('Phase 16: Feature Flags & Controlled Rollouts Suite', () => {
  it('respects percentage rollout and emergency kill switches', async () => {
    // 1. Test Kill Switch
    FeatureFlagService.setKillSwitch('AI_MEMORY', true);
    expect(FeatureFlagService.isEnabled('AI_MEMORY')).toBe(false);

    FeatureFlagService.setKillSwitch('AI_MEMORY', false);
    expect(FeatureFlagService.isEnabled('AI_MEMORY')).toBe(true);

    // 2. Test Percentage Rollout
    FeatureFlagService.setRolloutPercentage('DAILY_AI_INSIGHTS', 0); // 0% enabled
    const flagsUser1 = await FeatureFlagService.getFlagsForUser('user_test_bucket_a');
    expect(flagsUser1.DAILY_AI_INSIGHTS).toBe(false);

    FeatureFlagService.setRolloutPercentage('DAILY_AI_INSIGHTS', 100); // 100% enabled
    const flagsUser2 = await FeatureFlagService.getFlagsForUser('user_test_bucket_a');
    expect(flagsUser2.DAILY_AI_INSIGHTS).toBe(true);

    FeatureFlagService.clearOverrides();
  });
});
