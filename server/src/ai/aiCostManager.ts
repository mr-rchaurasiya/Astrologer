import { AIUsageLog } from '../models/AIUsageLog';
import { getCacheProvider } from '../cache';
import { Logger } from '../observability/logger';

export interface ModelPricing {
  modelId: string;
  costPer1kInputTokensINR: number;
  costPer1kOutputTokensINR: number;
}

export const MODEL_PRICING: Record<string, ModelPricing> = {
  'gemini-1.5-pro': {
    modelId: 'gemini-1.5-pro',
    costPer1kInputTokensINR: 0.25,
    costPer1kOutputTokensINR: 0.75,
  },
  'gemini-1.5-flash': {
    modelId: 'gemini-1.5-flash',
    costPer1kInputTokensINR: 0.05,
    costPer1kOutputTokensINR: 0.15,
  },
  'claude-3-5-sonnet': {
    modelId: 'claude-3-5-sonnet',
    costPer1kInputTokensINR: 0.30,
    costPer1kOutputTokensINR: 1.20,
  },
  'gpt-4o': {
    modelId: 'gpt-4o',
    costPer1kInputTokensINR: 0.28,
    costPer1kOutputTokensINR: 1.10,
  },
};

export const MONTHLY_TOKEN_QUOTAS: Record<string, number> = {
  free: 50000,       // 50k tokens / month
  pro: 500000,       // 500k tokens / month
  premium: 2000000,  // 2M tokens / month
};

export class AICostManager {
  /**
   * Estimates token count from text using word-to-token ratio (approx 1.33 tokens per word).
   */
  public static estimateTokens(text: string): number {
    if (!text) return 0;
    const words = text.trim().split(/\s+/).length;
    return Math.max(1, Math.round(words * 1.33));
  }

  /**
   * Calculates cost in INR for a given prompt and completion.
   */
  public static calculateCostINR(modelId: string, inputTokens: number, outputTokens: number): number {
    const pricing = MODEL_PRICING[modelId] || MODEL_PRICING['gemini-1.5-flash'];
    const inputCost = (inputTokens / 1000) * pricing.costPer1kInputTokensINR;
    const outputCost = (outputTokens / 1000) * pricing.costPer1kOutputTokensINR;
    return Math.round((inputCost + outputCost) * 10000) / 10000;
  }

  /**
   * Checks if user has exceeded their monthly token quota.
   */
  public static async checkQuota(userId: string, plan = 'free'): Promise<{ allowed: boolean; used: number; quota: number }> {
    const quota = MONTHLY_TOKEN_QUOTAS[plan] || MONTHLY_TOKEN_QUOTAS.free;
    const cache = getCacheProvider();
    const cacheKey = `ai:quota:${userId}:${new Date().toISOString().substring(0, 7)}`;

    const used = (await cache.get<number>(cacheKey)) || 0;
    return {
      allowed: used < quota,
      used,
      quota,
    };
  }

  /**
   * Records AI inference usage telemetry safely.
   */
  public static async recordUsage(params: {
    userId: string;
    model: string;
    requestType: 'chat' | 'daily_insight' | 'report';
    inputText: string;
    outputText: string;
    durationMs: number;
    plan?: string;
  }): Promise<void> {
    const inputTokens = this.estimateTokens(params.inputText);
    const outputTokens = this.estimateTokens(params.outputText);
    const totalTokens = inputTokens + outputTokens;
    const costINR = this.calculateCostINR(params.model, inputTokens, outputTokens);

    // Update monthly cache counter
    try {
      const cache = getCacheProvider();
      const monthKey = `ai:quota:${params.userId}:${new Date().toISOString().substring(0, 7)}`;
      const current = (await cache.get<number>(monthKey)) || 0;
      await cache.set(monthKey, current + totalTokens, 31 * 24 * 3600);
    } catch {
      // Graceful fallback
    }

    // Persist usage record asynchronously
    try {
      await AIUsageLog.create({
        userId: params.userId,
        model: params.model,
        requestType: params.requestType,
        inputTokens,
        outputTokens,
        totalTokens,
        costEstimate: costINR,
        durationMs: params.durationMs,
      });
    } catch (err: any) {
      Logger.warn(`Failed to persist AIUsageLog: ${err.message}`);
    }
  }

  /**
   * Returns prompt deduplication cache key hash.
   */
  public static getPromptCacheKey(userId: string, query: string, chartContext: string): string {
    const raw = `${userId}:${query.trim().toLowerCase()}:${chartContext.substring(0, 200)}`;
    return `ai:prompt_cache:${Buffer.from(raw).toString('base64').substring(0, 48)}`;
  }
}
