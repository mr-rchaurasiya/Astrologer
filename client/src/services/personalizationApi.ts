import { ApiClient } from './api';

export interface AIPersonalizationSettings {
  aiMemoryEnabled: boolean;
  recommendationsEnabled: boolean;
  dailyInsightEnabled: boolean;
  historyRetentionDays: number;
  languagePreference: string;
  astrologyTerminology: 'standard' | 'sanskrit' | 'simplified';
  responseStyle: 'concise' | 'balanced' | 'detailed';
}

export class PersonalizationApi {
  public static async getSettings(): Promise<{ success: boolean; data?: { settings: AIPersonalizationSettings } }> {
    const res = await ApiClient.fetchWithAuth<{ settings: AIPersonalizationSettings }>('/ai/personalization');
    return res;
  }

  public static async updateSettings(settings: Partial<AIPersonalizationSettings>) {
    const res = await ApiClient.fetchWithAuth<{ settings: AIPersonalizationSettings }>('/ai/personalization', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
    return res;
  }

  public static async submitFeedback(data: {
    messageId: string;
    sessionId?: string;
    rating: 'helpful' | 'not_helpful';
    category?: string;
    comment?: string;
    model?: string;
  }) {
    const res = await ApiClient.fetchWithAuth<{ feedback: any }>('/ai/personalization/feedback', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  }
}
