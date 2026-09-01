import { BirthProfile } from '../../models/BirthProfile';
import { DailyInsight, DailyInsightCategory, IDailyInsight } from '../../models/DailyInsight';
import { AstrologyService } from '../../astrology/service/astrology.service';
import { calculateTransits } from '../../astrology/transit/transits';
import { findActiveDashaAtDate } from '../../astrology/lifeCurve/lifeCurve';
import { aiService } from './ai.service';
import { config } from '../../config/environment';
import { AIMemoryService } from '../memory/memory.service';
import { AIUsageService } from '../usage/aiUsage.service';

export interface DailyInsightResponse {
  id?: string;
  profileId: string;
  date: string;
  category: DailyInsightCategory;
  content: string;
  cached: boolean;
  model: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export class DailyInsightService {
  /**
   * Retrieves or generates a personalized daily astrological insight
   */
  public static async getDailyInsight(
    userId: string,
    profileId: string,
    targetDateStr: string = new Date().toISOString().split('T')[0],
    category: DailyInsightCategory = 'overall'
  ): Promise<DailyInsightResponse> {
    // 1. Ownership & Profile Verification
    const profile = await BirthProfile.findOne({ _id: profileId, userId });
    if (!profile) {
      throw new Error('Birth profile not found or unauthorized');
    }

    // 2. Check Cache
    const cachedInsight = await DailyInsight.findOne({
      profileId,
      date: targetDateStr,
      category,
    });

    if (cachedInsight) {
      return {
        id: cachedInsight._id.toString(),
        profileId,
        date: cachedInsight.date,
        category: cachedInsight.category,
        content: cachedInsight.content,
        cached: true,
        model: cachedInsight.aiModel || 'gpt-4o-mini',
        metadata: cachedInsight.metadata,
        createdAt: cachedInsight.createdAt.toISOString(),
      };
    }

    // 3. Calculate Authoritative Natal Chart & Active Dasha
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    const targetDate = new Date(`${targetDateStr}T12:00:00.000Z`);
    const activeDasha = findActiveDashaAtDate(chart.dashas.mahadashas, targetDate);

    // 4. Calculate Authoritative Transit for target date
    const transit = calculateTransits(targetDate, profile.latitude, profile.longitude);
    const transitMoon = transit.planets.find((p) => p.name === 'Moon');
    const natalMoon = chart.planets.find((p) => p.name === 'Moon');

    // 5. Construct Category Focus Prompt
    const categoryInstruction =
      category === 'career'
        ? 'Focus primarily on professional focus, karma, workplace dynamics, decision-making, and leadership.'
        : category === 'finance'
        ? 'Focus on resource management, financial prudence, transactions, and long-term security.'
        : category === 'relationships'
        ? 'Focus on emotional harmony, interpersonal communication, family, and partnership dynamics.'
        : category === 'learning'
        ? 'Focus on intellectual absorption, study, cognitive clarity, and skill acquisition.'
        : category === 'spirituality'
        ? 'Focus on mindfulness, meditation, spiritual awareness, and philosophical reflections.'
        : 'Provide a balanced overview covering emotional state, daily productivity, mindset, and opportunities.';

    const userMessageContent = `Please provide today's (${targetDateStr}) personalized Vedic astrological insight for the ${category.toUpperCase()} dimension.
${categoryInstruction}
Contextual alignment:
- Active Mahadasha: ${activeDasha.mahadasha} (${activeDasha.antardasha ? `Antardasha: ${activeDasha.antardasha}` : ''})
- Transit Moon is in ${transitMoon ? `${transitMoon.sign} (${transitMoon.nakshatra} Nakshatra)` : 'its current sign'}
- Natal Moon is in ${natalMoon ? natalMoon.sign : 'its natal sign'}
- Ascendant (Lagna) is ${chart.ascendant.sign}

Format with a clear key theme, detailed paragraph, and 2-3 practical astrological tips. Remember to remain non-medical and non-fatalistic.`;

    // 6. Generate AI Response
    let aiContent = '';
    let usedModel = config.ai.model || 'gpt-4o-mini';
    const startTime = Date.now();
    const userMemories = await AIMemoryService.getRelevantContextSnippets(userId, 5).catch(() => []);

    try {
      const result = await aiService.generateAstrologyResponse({
        profile,
        chart,
        messages: [{ role: 'user', content: userMessageContent }],
        userMemories,
        pointContext: {
          type: 'planet',
          id: activeDasha.mahadasha,
          label: `Active ${activeDasha.mahadasha} Dasha Period`,
        },
      });

      aiContent = result.response.content;
      usedModel = result.response.model || usedModel;

      AIUsageService.logUsage({
        userId,
        endpoint: 'daily_insight',
        model: usedModel,
        promptTokens: result.response.usage?.promptTokens || 150,
        completionTokens: result.response.usage?.completionTokens || 100,
        latencyMs: Date.now() - startTime,
        success: true,
      }).catch(() => {});
    } catch (err: any) {
      AIUsageService.logUsage({
        userId,
        endpoint: 'daily_insight',
        model: usedModel,
        latencyMs: Date.now() - startTime,
        success: false,
        errorMessage: err.message,
      }).catch(() => {});

      // Graceful fallback if AI is offline / unconfigured
      aiContent = `## Daily Vedic Transit Overview (${targetDateStr})\n\nToday, the celestial transit highlights your active **${activeDasha.mahadasha} Mahadasha**${
        activeDasha.antardasha ? ` with **${activeDasha.antardasha} Antardasha**` : ''
      }. The transiting Moon is traversing **${
        transitMoon ? transitMoon.sign : 'its current sign'
      }**.\n\n*Traditional Jyotish guidance encourages centered mindfulness, constructive effort, and balanced contemplation in your ${category} pursuits today.*`;
    }

    // 7. Persist in Cache
    const metadata = {
      mahadasha: activeDasha.mahadasha,
      antardasha: activeDasha.antardasha,
      moonSign: natalMoon?.sign,
      transitMoonSign: transitMoon?.sign,
    };

    const newInsight = await DailyInsight.create({
      userId,
      profileId,
      date: targetDateStr,
      category,
      content: aiContent,
      contextVersion: '1.0',
      aiModel: usedModel,
      metadata,
    });

    return {
      id: newInsight._id.toString(),
      profileId,
      date: targetDateStr,
      category,
      content: aiContent,
      cached: false,
      model: usedModel,
      metadata,
      createdAt: newInsight.createdAt.toISOString(),
    };
  }
}
