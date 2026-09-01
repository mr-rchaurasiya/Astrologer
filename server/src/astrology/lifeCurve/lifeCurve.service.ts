import { BirthProfile } from '../../models/BirthProfile';
import { AstrologyService } from '../service/astrology.service';
import { generateLifeCurve } from './lifeCurve';
import { LifeCurveResult, LifeCurveOptions } from './lifeCurve.types';

export class LifeCurveService {
  /**
   * Computes the Life Curve analytics for a user's verified birth profile
   */
  public static async getLifeCurve(
    userId: string,
    profileId: string,
    options: LifeCurveOptions = {}
  ): Promise<LifeCurveResult> {
    const profile = await BirthProfile.findOne({ _id: profileId, userId });
    if (!profile) {
      throw new Error('Birth profile not found or unauthorized');
    }

    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    return generateLifeCurve(profileId, chart, options);
  }
}
