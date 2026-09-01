export type AITaskType =
  | 'SIMPLE_CHAT'
  | 'DEEP_SYNTHESIS'
  | 'REPORT_GENERATION'
  | 'CONVERSATION_SUMMARY'
  | 'INTENT_CLASSIFICATION'
  | 'VOICE_TRANSCRIPTION';

export interface ModelRouteDecision {
  model: string;
  maxTokens: number;
  temperature: number;
  reason: string;
}

export class ModelRouter {
  public static selectModel(
    task: AITaskType,
    subscriptionTier: string = 'free',
    hasFeatureFlag: boolean = true
  ): ModelRouteDecision {
    const isPremium = subscriptionTier === 'premium' || subscriptionTier === 'pro';

    switch (task) {
      case 'REPORT_GENERATION':
        return {
          model: isPremium ? 'gpt-4o' : 'gpt-4o-mini',
          maxTokens: 3000,
          temperature: 0.3,
          reason: 'High-precision multi-section report compilation',
        };

      case 'DEEP_SYNTHESIS':
        return {
          model: isPremium ? 'gpt-4o' : 'gpt-4o-mini',
          maxTokens: 1500,
          temperature: 0.4,
          reason: 'Complex multi-varga correlation and classical yoga synthesis',
        };

      case 'CONVERSATION_SUMMARY':
        return {
          model: 'gpt-4o-mini',
          maxTokens: 600,
          temperature: 0.2,
          reason: 'Fast token-budgeted memory and summary distillation',
        };

      case 'INTENT_CLASSIFICATION':
        return {
          model: 'gpt-4o-mini',
          maxTokens: 100,
          temperature: 0.1,
          reason: 'Lightweight intent verification',
        };

      case 'SIMPLE_CHAT':
      default:
        return {
          model: isPremium ? 'gpt-4o' : 'gpt-4o-mini',
          maxTokens: 1000,
          temperature: 0.5,
          reason: 'Standard conversational consultation',
        };
    }
  }
}
