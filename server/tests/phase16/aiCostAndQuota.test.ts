import { describe, it, expect } from 'vitest';
import { AICostManager } from '../../src/ai/aiCostManager';
import '../setup';

describe('Phase 16: AI Cost, Token Quota & Compute Optimization Suite', () => {
  it('estimates token counts and calculates INR cost accurately per model pricing', () => {
    const text = 'What are the career prospects during Jupiter Mahadasha and Saturn Antardasha?';
    const tokens = AICostManager.estimateTokens(text);
    expect(tokens).toBeGreaterThan(10);

    const costFlash = AICostManager.calculateCostINR('gemini-1.5-flash', 500, 500);
    const costPro = AICostManager.calculateCostINR('gemini-1.5-pro', 500, 500);

    expect(costFlash).toBeLessThan(costPro);
    expect(costFlash).toBeGreaterThan(0);
  });

  it('checks monthly user quota based on subscription plan', async () => {
    const quotaCheck = await AICostManager.checkQuota('user_scale_test_1', 'free');
    expect(quotaCheck.allowed).toBe(true);
    expect(quotaCheck.quota).toBe(50000);
  });
});
