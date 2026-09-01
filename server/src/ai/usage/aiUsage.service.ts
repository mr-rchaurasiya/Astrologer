import { AIUsageLog } from '../../models/AIUsageLog';

export interface LogAIUsageParams {
  userId?: string;
  endpoint: 'chat' | 'daily_insight' | 'voice_transcribe' | 'voice_synthesize' | 'summary';
  model?: string;
  promptTokens?: number;
  completionTokens?: number;
  latencyMs?: number;
  success?: boolean;
  errorMessage?: string;
  plan?: 'free' | 'pro' | 'premium';
}

export class AIUsageService {
  // Estimated pricing per 1M tokens (GPT-4o-mini baseline: $0.15 / 1M input, $0.60 / 1M output)
  private static readonly INPUT_COST_PER_TOKEN = 0.15 / 1_000_000;
  private static readonly OUTPUT_COST_PER_TOKEN = 0.60 / 1_000_000;

  public static async logUsage(params: LogAIUsageParams): Promise<void> {
    try {
      const promptTokens = params.promptTokens || 0;
      const completionTokens = params.completionTokens || 0;
      const totalTokens = promptTokens + completionTokens;

      const estimatedCostUsd =
        promptTokens * this.INPUT_COST_PER_TOKEN +
        completionTokens * this.OUTPUT_COST_PER_TOKEN;

      await AIUsageLog.create({
        userId: params.userId as any,
        endpoint: params.endpoint,
        aiModel: params.model || 'gpt-4o-mini',
        promptTokens,
        completionTokens,
        totalTokens,
        latencyMs: params.latencyMs || 0,
        estimatedCostUsd,
        success: params.success !== false,
        errorMessage: params.errorMessage,
        plan: params.plan || 'free',
      });
    } catch {
      // Non-blocking telemetry failure
    }
  }

  public static async getUsageAnalytics(timeframe: 'today' | '7d' | '30d' | 'all' = '7d') {
    const now = new Date();
    let startDate: Date;

    if (timeframe === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (timeframe === '7d') {
      startDate = new Date(now.getTime() - 7 * 24 * 3600 * 1000);
    } else if (timeframe === '30d') {
      startDate = new Date(now.getTime() - 30 * 24 * 3600 * 1000);
    } else {
      startDate = new Date(0);
    }

    const logs = await AIUsageLog.find({ createdAt: { $gte: startDate } }).limit(5000);

    const totalRequests = logs.length;
    const successfulRequests = logs.filter((l) => l.success).length;
    const failedRequests = totalRequests - successfulRequests;
    const totalTokens = logs.reduce((acc, l) => acc + (l.totalTokens || 0), 0);
    const totalCostUsd = logs.reduce((acc, l) => acc + (l.estimatedCostUsd || 0), 0);
    const avgLatencyMs =
      totalRequests > 0
        ? Math.round(logs.reduce((acc, l) => acc + (l.latencyMs || 0), 0) / totalRequests)
        : 0;

    const endpointBreakdown: Record<string, { requests: number; tokens: number; cost: number }> = {};
    const planBreakdown: Record<string, { requests: number; tokens: number; cost: number }> = {};

    for (const log of logs) {
      if (!endpointBreakdown[log.endpoint]) {
        endpointBreakdown[log.endpoint] = { requests: 0, tokens: 0, cost: 0 };
      }
      endpointBreakdown[log.endpoint].requests++;
      endpointBreakdown[log.endpoint].tokens += log.totalTokens || 0;
      endpointBreakdown[log.endpoint].cost += log.estimatedCostUsd || 0;

      const planKey = log.plan || 'free';
      if (!planBreakdown[planKey]) {
        planBreakdown[planKey] = { requests: 0, tokens: 0, cost: 0 };
      }
      planBreakdown[planKey].requests++;
      planBreakdown[planKey].tokens += log.totalTokens || 0;
      planBreakdown[planKey].cost += log.estimatedCostUsd || 0;
    }

    return {
      timeframe,
      totalRequests,
      successfulRequests,
      failedRequests,
      totalTokens,
      totalCostUsd: parseFloat(totalCostUsd.toFixed(6)),
      avgLatencyMs,
      endpointBreakdown,
      planBreakdown,
    };
  }
}
