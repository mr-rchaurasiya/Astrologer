import { AnalyticsEvent, AnalyticsEventType } from '../models/AnalyticsEvent';
import { NotificationPreference } from '../models/NotificationPreference';

export interface TrackEventParams {
  userId?: string;
  profileId?: string;
  event: AnalyticsEventType;
  metadata?: Record<string, any>;
}

export class AnalyticsService {
  public static async trackEvent(params: TrackEventParams): Promise<void> {
    try {
      // Check user preferences if opt-out
      if (params.userId) {
        const pref = await NotificationPreference.findOne({ userId: params.userId as any });
        // Respect privacy if user opted out
        if (pref && (pref as any).analyticsOptOut === true) {
          return;
        }
      }

      await AnalyticsEvent.create({
        userId: params.userId ? (params.userId as any) : undefined,
        profileId: params.profileId ? (params.profileId as any) : undefined,
        event: params.event,
        metadata: params.metadata,
        timestamp: new Date(),
      });
    } catch {
      // Non-blocking telemetry
    }
  }

  public static async getUserActivity(userId: string, limit: number = 20) {
    return AnalyticsEvent.find({ userId: userId as any })
      .sort({ timestamp: -1 })
      .limit(limit);
  }

  public static async getBusinessIntelligence(days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 3600 * 1000);

    const events = await AnalyticsEvent.find({ timestamp: { $gte: startDate } }).limit(10000);

    const eventCounts: Record<string, number> = {};
    for (const ev of events) {
      eventCounts[ev.event] = (eventCounts[ev.event] || 0) + 1;
    }

    return {
      timeframeDays: days,
      totalEvents: events.length,
      eventCounts,
    };
  }
}
