import { IBirthProfile } from '../../models/BirthProfile';
import { AstrologyService } from '../../astrology/service/astrology.service';
import { AdvancedAstrologyContextBuilder } from './astrologyContextBuilder';
import { SelectiveAstrologyContext } from './astrologyContext.types';
import { PointContext } from '../types/ai';

export class AstrologyContextService {
  /**
   * Generates a selective, domain-grounded context using Phase 12 verified calculations.
   */
  public static async getSelectiveContext(params: {
    profile: IBirthProfile;
    userMessage: string;
    pointContext?: PointContext;
    userMemories?: any[];
    conversationSummary?: string;
    personalization?: any;
    targetDate?: Date;
  }): Promise<SelectiveAstrologyContext> {
    const { profile, userMessage, pointContext, userMemories, conversationSummary, personalization, targetDate } = params;

    // Execute Phase 12 Advanced Astrology Analysis
    const analysis = AstrologyService.calculateAdvancedAnalysis(
      {
        dateOfBirth: profile.dateOfBirth,
        timeOfBirth: profile.timeOfBirth,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone,
        timezoneOffset: profile.timezoneOffset,
      },
      targetDate || new Date()
    );

    return AdvancedAstrologyContextBuilder.buildSelectiveContext({
      profile,
      analysis,
      userMessage,
      pointContext,
      userMemories,
      conversationSummary,
      personalization,
    });
  }
}
