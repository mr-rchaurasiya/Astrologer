export interface AnalyticsEventPayload {
  eventName: string;
  properties?: Record<string, any>;
  userId?: string;
  timestamp?: number;
}

export interface IAnalyticsProvider {
  name: string;
  trackEvent(event: AnalyticsEventPayload): Promise<void>;
  trackPageView(url: string, title?: string): Promise<void>;
  identifyUser(userId: string, traits?: Record<string, any>): Promise<void>;
}

// Strictly forbidden keys that MUST NEVER be tracked in analytics
const SENSITIVE_PROPERTY_KEYS = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'jwt',
  'creditCard',
  'card',
  'cvv',
  'messageText',
  'chatText',
  'privateMemory',
  'secret',
  'authHeader',
];

/**
 * Sanitizes event properties to eliminate sensitive data & secrets
 */
export function sanitizeAnalyticsProperties(props: Record<string, any> = {}): Record<string, any> {
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(props)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_PROPERTY_KEYS.some((forbidden) => lowerKey.includes(forbidden))) {
      continue; // Discard sensitive fields
    }

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      sanitized[key] = sanitizeAnalyticsProperties(value);
    } else if (typeof value === 'string' && value.length > 500) {
      sanitized[key] = value.substring(0, 500) + '...[truncated]';
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Default in-memory / backend fallback analytics provider
 */
export class SafeBackendAnalyticsProvider implements IAnalyticsProvider {
  public readonly name = 'SafeBackendAnalytics';

  public async trackEvent(event: AnalyticsEventPayload): Promise<void> {
    try {
      const sanitized = {
        ...event,
        properties: sanitizeAnalyticsProperties(event.properties),
        timestamp: event.timestamp || Date.now(),
      };

      // Best effort send to backend telemetry endpoint if online
      if (typeof window !== 'undefined' && window.navigator.onLine) {
        fetch('/api/v1/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventType: sanitized.eventName,
            metadata: sanitized.properties,
          }),
        }).catch(() => {
          // Gracefully swallow network errors; analytics must never crash user flow
        });
      }
    } catch {
      // Graceful error handling
    }
  }

  public async trackPageView(url: string, title?: string): Promise<void> {
    return this.trackEvent({
      eventName: 'page_view',
      properties: { url, title: title || document?.title },
    });
  }

  public async identifyUser(userId: string, traits?: Record<string, any>): Promise<void> {
    // Intentionally omit sensitive traits
    return this.trackEvent({
      eventName: 'user_identified',
      userId,
      properties: {
        registered: true,
        plan: traits?.plan || 'free',
      },
    });
  }
}

/**
 * Centralized Analytics Facade
 */
class AnalyticsService {
  private provider: IAnalyticsProvider;

  constructor(provider?: IAnalyticsProvider) {
    this.provider = provider || new SafeBackendAnalyticsProvider();
  }

  public setProvider(provider: IAnalyticsProvider) {
    this.provider = provider;
  }

  public track(eventName: string, properties: Record<string, any> = {}) {
    this.provider.trackEvent({
      eventName,
      properties,
    }).catch(() => {});
  }

  public page(url?: string, title?: string) {
    const currentUrl = url || (typeof window !== 'undefined' ? window.location.pathname : '/');
    this.provider.trackPageView(currentUrl, title).catch(() => {});
  }

  public identify(userId: string, traits?: Record<string, any>) {
    this.provider.identifyUser(userId, traits).catch(() => {});
  }
}

export const Analytics = new AnalyticsService();
