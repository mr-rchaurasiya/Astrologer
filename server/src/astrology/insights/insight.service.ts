import { BirthProfile } from '../../models/BirthProfile';
import { AstrologyService } from '../service/astrology.service';
import { InsightCorrelationRules } from './insightRules';
import { CorrelatedInsight } from './insight.types';
import { NotFoundError } from '../../middleware/errorHandler';

export class AstrologyInsightService {
  public static async getCorrelatedInsights(userId: string, profileId: string): Promise<CorrelatedInsight[]> {
    const profile = await BirthProfile.findOne({ _id: profileId as any, userId: userId as any });
    if (!profile) {
      throw new NotFoundError('Birth profile not found or unauthorized');
    }

    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    return InsightCorrelationRules.correlate(chart);
  }
}
