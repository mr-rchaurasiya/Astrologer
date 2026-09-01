import {
  ApiSuccessResponse,
  HealthData,
  User,
  BirthProfile,
  AuthResponseData,
  AstrologyChartOutput,
  VimshottariDashaTree,
  PanchangInfo,
  TransitOutput,
} from '../types';
import {
  ChatSession,
  ChatMessage,
  ChatResponseData,
  PointContext,
  StreamChunkData,
} from '../types/ai';
import {
  LifeCurveResult,
  TransitTimelineResult,
  DailyInsightResponse,
  DailyInsightCategory,
  LifeCurveResolution,
} from '../types/analytics';
import { UserSubscriptionSummary, SubscriptionPlan } from '../types/subscription';

const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL.replace(/\/$/, '')}/api/v1` 
  : (import.meta.env.PROD ? 'https://astrologer-api-r3ix.onrender.com/api/v1' : '/api/v1');

let accessToken: string | null = localStorage.getItem('astrologer_access_token');

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem('astrologer_access_token', token);
  } else {
    localStorage.removeItem('astrologer_access_token');
  }
};

export const getAccessToken = () => accessToken;

export class ApiClient {
  private static isRefreshing = false;

  public static async fetchWithAuth<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiSuccessResponse<T>> {
    return this.request<T>(endpoint, options);
  }

  public static async request<T>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<ApiSuccessResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (accessToken) {
      defaultHeaders['Authorization'] = `Bearer ${accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...(options.headers as Record<string, string>),
        },
        credentials: 'include',
      });

      // Attempt token refresh on 401 UNAUTHORIZED / TOKEN_EXPIRED once
      if (
        response.status === 401 &&
        !isRetry &&
        !endpoint.includes('/auth/login') &&
        !endpoint.includes('/auth/register') &&
        !endpoint.includes('/auth/refresh')
      ) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshRes = await this.refreshToken();
            this.isRefreshing = false;
            if (refreshRes.data.accessToken) {
              setAccessToken(refreshRes.data.accessToken);
              return this.request<T>(endpoint, options, true);
            }
          } catch (refreshErr) {
            this.isRefreshing = false;
            setAccessToken(null);
            window.dispatchEvent(new Event('astrologer_auth_expired'));
            throw new Error('Session expired. Please sign in again.');
          }
        }
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || (data.error && data.error.code) || `HTTP error! Status: ${response.status}`);
      }

      return data;
    } catch (error: any) {
      throw error;
    }
  }

  // Health
  public static async getHealth(): Promise<ApiSuccessResponse<HealthData>> {
    return this.request<HealthData>('/health');
  }

  // Auth Methods
  public static async register(payload: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiSuccessResponse<AuthResponseData>> {
    const res = await this.request<AuthResponseData>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  }

  public static async login(payload: {
    email: string;
    password: string;
  }): Promise<ApiSuccessResponse<AuthResponseData>> {
    const res = await this.request<AuthResponseData>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (res.data.accessToken) {
      setAccessToken(res.data.accessToken);
    }
    return res;
  }

  public static async refreshToken(): Promise<ApiSuccessResponse<{ accessToken: string }>> {
    return this.request<{ accessToken: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  public static async logout(): Promise<ApiSuccessResponse<{}>> {
    try {
      return await this.request<{}>('/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  }

  public static async getMe(): Promise<ApiSuccessResponse<{ user: User }>> {
    return this.request<{ user: User }>('/auth/me');
  }

  public static async updatePassword(payload: {
    currentPassword: string;
    newPassword: string;
  }): Promise<ApiSuccessResponse<{}>> {
    return this.request<{}>('/auth/update-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  // Profile Methods
  public static async getProfiles(): Promise<ApiSuccessResponse<{ profiles: BirthProfile[]; count: number }>> {
    return this.request<{ profiles: BirthProfile[]; count: number }>('/profiles');
  }

  public static async getProfileById(id: string): Promise<ApiSuccessResponse<{ profile: BirthProfile }>> {
    return this.request<{ profile: BirthProfile }>(`/profiles/${id}`);
  }

  public static async createProfile(payload: Partial<BirthProfile>): Promise<ApiSuccessResponse<{ profile: BirthProfile }>> {
    return this.request<{ profile: BirthProfile }>('/profiles', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async updateProfile(id: string, payload: Partial<BirthProfile>): Promise<ApiSuccessResponse<{ profile: BirthProfile }>> {
    return this.request<{ profile: BirthProfile }>(`/profiles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  }

  public static async deleteProfile(id: string): Promise<ApiSuccessResponse<{}>> {
    return this.request<{}>(`/profiles/${id}`, {
      method: 'DELETE',
    });
  }

  // Astrology Calculation Methods
  public static async getAstrologyChart(profileId: string): Promise<ApiSuccessResponse<{ profileId: string; profileName: string; isPrimary: boolean; chart: AstrologyChartOutput }>> {
    return this.request<{ profileId: string; profileName: string; isPrimary: boolean; chart: AstrologyChartOutput }>(`/astrology/chart/${profileId}`);
  }

  public static async calculateAstrologyChart(payload: {
    profileId?: string;
    dateOfBirth?: string;
    timeOfBirth?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    timezoneOffset?: number;
  }): Promise<ApiSuccessResponse<{ chart: AstrologyChartOutput }>> {
    return this.request<{ chart: AstrologyChartOutput }>('/astrology/calculate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async getDasha(profileId: string): Promise<ApiSuccessResponse<{ profileId: string; dashas: VimshottariDashaTree }>> {
    return this.request<{ profileId: string; dashas: VimshottariDashaTree }>(`/astrology/dasha/${profileId}`);
  }

  public static async getPanchang(params: {
    date?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
    timezoneOffset?: number;
  } = {}): Promise<ApiSuccessResponse<{ panchang: PanchangInfo }>> {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.latitude !== undefined) query.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) query.append('longitude', params.longitude.toString());
    if (params.timezone) query.append('timezone', params.timezone);
    if (params.timezoneOffset !== undefined) query.append('timezoneOffset', params.timezoneOffset.toString());

    return this.request<{ panchang: PanchangInfo }>(`/astrology/panchang/daily?${query.toString()}`);
  }

  public static async getCurrentTransits(params: {
    date?: string;
    latitude?: number;
    longitude?: number;
  } = {}): Promise<ApiSuccessResponse<{ transits: TransitOutput }>> {
    const query = new URLSearchParams();
    if (params.date) query.append('date', params.date);
    if (params.latitude !== undefined) query.append('latitude', params.latitude.toString());
    if (params.longitude !== undefined) query.append('longitude', params.longitude.toString());

    return this.request<{ transits: TransitOutput }>(`/astrology/transits/current?${query.toString()}`);
  }

  // ----------------------------------------------------
  // Phase 5: AI Consultation & Chat APIs
  // ----------------------------------------------------

  public static async getChatSessions(profileId?: string): Promise<ApiSuccessResponse<{ sessions: ChatSession[]; count: number }>> {
    const query = profileId ? `?profileId=${profileId}` : '';
    return this.request<{ sessions: ChatSession[]; count: number }>(`/ai/sessions${query}`);
  }

  public static async createChatSession(payload: { profileId: string; title?: string }): Promise<ApiSuccessResponse<{ session: ChatSession }>> {
    return this.request<{ session: ChatSession }>('/ai/sessions', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async getChatSession(sessionId: string): Promise<ApiSuccessResponse<{ session: ChatSession }>> {
    return this.request<{ session: ChatSession }>(`/ai/sessions/${sessionId}`);
  }

  public static async deleteChatSession(sessionId: string): Promise<ApiSuccessResponse<{}>> {
    return this.request<{}>(`/ai/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  public static async getChatMessages(
    sessionId: string,
    limit = 50,
    before?: string
  ): Promise<ApiSuccessResponse<{ messages: ChatMessage[]; total: number }>> {
    const query = new URLSearchParams({ limit: limit.toString() });
    if (before) query.append('before', before);
    return this.request<{ messages: ChatMessage[]; total: number }>(`/ai/sessions/${sessionId}/messages?${query.toString()}`);
  }

  public static async sendChatMessage(payload: {
    profileId: string;
    sessionId?: string;
    message: string;
    pointContext?: PointContext;
  }): Promise<ApiSuccessResponse<ChatResponseData>> {
    return this.request<ChatResponseData>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async streamChatMessage(
    payload: {
      profileId: string;
      sessionId?: string;
      message: string;
      pointContext?: PointContext;
    },
    onChunk: (chunk: StreamChunkData) => void,
    signal?: AbortSignal
  ): Promise<void> {
    const url = `${API_BASE_URL}/ai/chat/stream`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'text/event-stream',
    };

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      credentials: 'include',
      signal,
    });

    if (!response.ok) {
      let errMessage = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        errMessage = errJson.message || errMessage;
      } catch {
        // Fallback to status text
      }
      throw new Error(errMessage);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable for streaming.');
    }

    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const dataStr = trimmed.slice(6);
        if (dataStr === '[DONE]') {
          onChunk({ isFinal: true });
          return;
        }

        try {
          const parsed = JSON.parse(dataStr);
          onChunk(parsed);
        } catch {
          // Ignore unparseable lines
        }
      }
    }
  }

  // ----------------------------------------------------
  // Phase 6: Life Curve, Transits, Insights & Subscriptions
  // ----------------------------------------------------

  public static async getLifeCurve(
    profileId: string,
    params: {
      startYear?: number;
      endYear?: number;
      resolution?: LifeCurveResolution;
    } = {}
  ): Promise<ApiSuccessResponse<LifeCurveResult>> {
    const query = new URLSearchParams();
    if (params.startYear) query.append('startYear', params.startYear.toString());
    if (params.endYear) query.append('endYear', params.endYear.toString());
    if (params.resolution) query.append('resolution', params.resolution);

    return this.request<LifeCurveResult>(`/astrology/life-curve/${profileId}?${query.toString()}`);
  }

  public static async getTransitTimeline(
    profileId: string,
    daysAhead = 365
  ): Promise<ApiSuccessResponse<TransitTimelineResult>> {
    const query = new URLSearchParams({
      profileId,
      daysAhead: daysAhead.toString(),
    });
    return this.request<TransitTimelineResult>(`/astrology/transits/timeline?${query.toString()}`);
  }

  public static async getDailyTransits(
    profileId: string,
    date?: string
  ): Promise<ApiSuccessResponse<{ profileId: string; date: string; transits: TransitOutput }>> {
    const query = new URLSearchParams({ profileId });
    if (date) query.append('date', date);
    return this.request<{ profileId: string; date: string; transits: TransitOutput }>(
      `/astrology/transits/daily?${query.toString()}`
    );
  }

  public static async getDailyInsight(payload: {
    profileId: string;
    date?: string;
    category?: DailyInsightCategory;
  }): Promise<ApiSuccessResponse<DailyInsightResponse>> {
    return this.request<DailyInsightResponse>('/ai/daily-insight', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  public static async getMySubscription(): Promise<ApiSuccessResponse<UserSubscriptionSummary>> {
    return this.request<UserSubscriptionSummary>('/subscription/me');
  }

  public static async upgradeSubscription(payload: {
    plan?: SubscriptionPlan;
    durationDays?: number;
  } = {}): Promise<ApiSuccessResponse<UserSubscriptionSummary>> {
    return this.request<UserSubscriptionSummary>('/subscription/upgrade', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }
}
