import { AIProvider } from '../providers/AIProvider';
import { OpenAIProvider } from '../providers/OpenAIProvider';
import { ContextBuilder } from '../context/contextBuilder';
import { AstrologyContextService } from '../astrology/astrologyContext.service';
import { SelectiveAstrologyContext } from '../astrology/astrologyContext.types';
import { SystemPromptBuilder, PROMPT_VERSION } from '../prompts/systemPrompt';
import {
  AstrologyAIContext,
  ChatMessageDTO,
  PointContext,
  AIResponse,
  StreamChunk,
} from '../types/ai';
import { IBirthProfile } from '../../models/BirthProfile';
import { AstrologyChartOutput } from '../../astrology/types/astrology';
import { AstrologyFactValidator } from '../validation/astrologyFactValidator';
import { AIResponseValidator, PredictionConfidence } from '../validation/aiResponseValidator';
import { ModelRouter, AITaskType } from '../providers/modelRouter';

export interface EnhancedAIResponse extends AIResponse {
  confidence: PredictionConfidence;
  groundingScore: number;
  intent: string;
  disclaimers: string[];
}

export class AIService {
  private provider: AIProvider;

  constructor(provider?: AIProvider) {
    this.provider = provider || new OpenAIProvider();
  }

  public setProvider(provider: AIProvider): void {
    this.provider = provider;
  }

  /**
   * Prepares the structured context and system prompt for a profile's chart.
   */
  public prepareContextAndPrompt(
    profile: IBirthProfile,
    chart: AstrologyChartOutput,
    pointContext?: PointContext,
    userMemories?: Array<{ category: string; key: string; value: string }>
  ): { context: AstrologyAIContext; systemPrompt: string } {
    const context = ContextBuilder.buildContext(profile, chart, pointContext, userMemories);
    const systemPrompt = SystemPromptBuilder.buildSystemPrompt(context);
    return { context, systemPrompt };
  }

  /**
   * Generates a selective, grounded, validated AI response (Phase 13).
   */
  public async generateAstrologyResponse(params: {
    profile: IBirthProfile;
    chart?: AstrologyChartOutput;
    messages: ChatMessageDTO[];
    pointContext?: PointContext;
    userMemories?: any[];
    conversationSummary?: string;
    personalization?: any;
    subscriptionTier?: string;
    taskType?: AITaskType;
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeoutMs?: number;
      signal?: AbortSignal;
    };
  }): Promise<{ response: EnhancedAIResponse; promptVersion: string; contextVersion: string }> {
    const latestUserMessage =
      params.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';

    // 1. Build Selective, Grounded Astrology Context
    const selectiveContext: SelectiveAstrologyContext = await AstrologyContextService.getSelectiveContext({
      profile: params.profile,
      userMessage: latestUserMessage,
      pointContext: params.pointContext,
      userMemories: params.userMemories,
      conversationSummary: params.conversationSummary,
      personalization: params.personalization,
    });

    const systemPrompt = SystemPromptBuilder.buildSystemPrompt(selectiveContext);

    // 2. Select Optimal Model using ModelRouter
    const route = ModelRouter.selectModel(
      params.taskType || 'SIMPLE_CHAT',
      params.subscriptionTier || 'free'
    );

    // 3. Window conversation history (last 20 messages)
    const windowedMessages = params.messages.slice(-20);

    // 4. Generate Raw AI Response
    const rawResponse = await this.provider.generateResponse({
      messages: windowedMessages,
      systemPrompt,
      options: {
        model: route.model,
        temperature: params.options?.temperature ?? route.temperature,
        maxTokens: params.options?.maxTokens ?? route.maxTokens,
        timeoutMs: params.options?.timeoutMs,
        signal: params.options?.signal,
      } as any,
    });

    // 5. Fact Grounding & Safety Validation
    const factCheck = AstrologyFactValidator.validate(rawResponse.content, selectiveContext.groundTruth);
    const safetyCheck = AIResponseValidator.evaluate(rawResponse.content, selectiveContext.intent);

    let finalContent = safetyCheck.sanitizedContent;
    if (safetyCheck.disclaimersNeeded.length > 0) {
      finalContent += `\n\n*Note: ${safetyCheck.disclaimersNeeded.join(' ')}*`;
    }

    const enhancedResponse: EnhancedAIResponse = {
      ...rawResponse,
      content: finalContent,
      model: rawResponse.model || route.model,
      usage: rawResponse.usage,
      confidence: safetyCheck.confidence,
      groundingScore: factCheck.groundingScore,
      intent: selectiveContext.intent,
      disclaimers: safetyCheck.disclaimersNeeded,
    };

    return {
      response: enhancedResponse,
      promptVersion: PROMPT_VERSION,
      contextVersion: selectiveContext.contextVersion,
    };
  }

  /**
   * Streams partial AI response tokens as they arrive.
   */
  public async streamAstrologyResponse(params: {
    profile: IBirthProfile;
    chart?: AstrologyChartOutput;
    messages: ChatMessageDTO[];
    pointContext?: PointContext;
    userMemories?: any[];
    conversationSummary?: string;
    personalization?: any;
    subscriptionTier?: string;
    options?: {
      temperature?: number;
      maxTokens?: number;
      timeoutMs?: number;
      signal?: AbortSignal;
    };
    onChunk: (chunk: StreamChunk) => void | Promise<void>;
  }): Promise<{ response: AIResponse; promptVersion: string; contextVersion: string }> {
    const latestUserMessage =
      params.messages.filter((m) => m.role === 'user').slice(-1)[0]?.content || '';

    const selectiveContext = await AstrologyContextService.getSelectiveContext({
      profile: params.profile,
      userMessage: latestUserMessage,
      pointContext: params.pointContext,
      userMemories: params.userMemories,
      conversationSummary: params.conversationSummary,
      personalization: params.personalization,
    });

    const systemPrompt = SystemPromptBuilder.buildSystemPrompt(selectiveContext);
    const route = ModelRouter.selectModel('SIMPLE_CHAT', params.subscriptionTier || 'free');
    const windowedMessages = params.messages.slice(-20);

    const response = await this.provider.streamResponse({
      messages: windowedMessages,
      systemPrompt,
      options: {
        model: route.model,
        temperature: params.options?.temperature ?? route.temperature,
        maxTokens: params.options?.maxTokens ?? route.maxTokens,
        timeoutMs: params.options?.timeoutMs,
        signal: params.options?.signal,
      } as any,
      onChunk: params.onChunk,
    });

    return {
      response,
      promptVersion: PROMPT_VERSION,
      contextVersion: selectiveContext.contextVersion,
    };
  }
}

export const aiService = new AIService();
