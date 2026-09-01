import { describe, it, expect } from 'vitest';
import { ModelRouter } from '../../src/ai/providers/modelRouter';

describe('Phase 13: Model Router Suite', () => {
  it('selects efficient model for classification and conversation summary', () => {
    const classRoute = ModelRouter.selectModel('INTENT_CLASSIFICATION', 'free');
    expect(classRoute.model).toBe('gpt-4o-mini');
    expect(classRoute.maxTokens).toBeLessThanOrEqual(200);

    const sumRoute = ModelRouter.selectModel('CONVERSATION_SUMMARY', 'free');
    expect(sumRoute.model).toBe('gpt-4o-mini');
  });

  it('selects advanced model for report generation and deep synthesis on premium tier', () => {
    const reportRoute = ModelRouter.selectModel('REPORT_GENERATION', 'premium');
    expect(reportRoute.model).toBe('gpt-4o');
    expect(reportRoute.maxTokens).toBeGreaterThanOrEqual(2000);

    const deepRoute = ModelRouter.selectModel('DEEP_SYNTHESIS', 'premium');
    expect(deepRoute.model).toBe('gpt-4o');
  });

  it('selects cost-effective model for free tier users', () => {
    const simpleRoute = ModelRouter.selectModel('SIMPLE_CHAT', 'free');
    expect(simpleRoute.model).toBe('gpt-4o-mini');
  });
});
