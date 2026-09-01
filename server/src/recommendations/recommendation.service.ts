import { BirthProfile } from '../models/BirthProfile';
import { AstrologyService } from '../astrology/service/astrology.service';
import { RecommendationRulesEngine } from './recommendation.rules';
import { RecommendationItem } from './recommendation.types';

export class RecommendationService {
  private static dismissedIds: Set<string> = new Set();

  public static async getRecommendations(userId: string): Promise<RecommendationItem[]> {
    // 1. Fetch user's primary or latest profile
    const profiles = await BirthProfile.find({ userId: userId as any }).sort({ isPrimary: -1, createdAt: -1 }).limit(3);
    if (profiles.length === 0) {
      return [
        {
          id: 'rec_create_profile',
          type: 'consultation_followup',
          title: 'Create Your Primary Birth Chart',
          description: 'Add your exact birth date, time, and coordinates to unlock authoritative Vedic calculations, D1/D9 charts, and AI consultation.',
          reason: 'A birth profile is required for personalized astrological analysis.',
          priority: 'high',
          action: {
            route: '/profile',
            label: 'Add Birth Profile',
          },
          expiresAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
        },
      ];
    }

    const primaryProfile = profiles[0];
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: primaryProfile.dateOfBirth,
      timeOfBirth: primaryProfile.timeOfBirth,
      latitude: primaryProfile.latitude,
      longitude: primaryProfile.longitude,
      timezone: primaryProfile.timezone,
      timezoneOffset: primaryProfile.timezoneOffset,
    });

    const profileId = primaryProfile.id || (primaryProfile as any)._id?.toString() || 'primary';
    const recommendations = RecommendationRulesEngine.evaluateChartRecommendations(
      profileId,
      primaryProfile.name,
      chart
    );

    // Filter out dismissed recommendations
    return recommendations.filter((r) => !this.dismissedIds.has(`${userId}:${r.id}`));
  }

  public static dismissRecommendation(userId: string, recommendationId: string): void {
    this.dismissedIds.add(`${userId}:${recommendationId}`);
  }
}
