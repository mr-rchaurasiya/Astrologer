export interface AttributionData {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
  referralCode?: string;
  affiliateCode?: string;
  landingPage?: string;
  referrer?: string;
  timestamp: number;
}

const STORAGE_KEY = 'astrologer_marketing_attribution';

/**
 * Sanitizes a URL parameter string to prevent XSS / script injection
 */
export function sanitizeParam(param: string | null | undefined): string | undefined {
  if (!param) return undefined;
  // Allow alphanumeric, dashes, underscores, and dots, truncate to 100 chars
  const cleaned = param.trim().replace(/[^\w\s-._]/gi, '').substring(0, 100);
  return cleaned || undefined;
}

export class AttributionManager {
  /**
   * Captures UTM & referral parameters from current URL and persists in sessionStorage
   */
  public static capture(): AttributionData | null {
    if (typeof window === 'undefined') return null;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const utmSource = sanitizeParam(searchParams.get('utm_source'));
      const utmMedium = sanitizeParam(searchParams.get('utm_medium'));
      const utmCampaign = sanitizeParam(searchParams.get('utm_campaign'));
      const utmTerm = sanitizeParam(searchParams.get('utm_term'));
      const utmContent = sanitizeParam(searchParams.get('utm_content'));
      const referralCode = sanitizeParam(searchParams.get('ref') || searchParams.get('referral'));
      const affiliateCode = sanitizeParam(searchParams.get('aff') || searchParams.get('affiliate'));

      // If any marketing parameters exist, record attribution
      if (utmSource || utmCampaign || referralCode || affiliateCode) {
        const attribution: AttributionData = {
          utmSource,
          utmMedium,
          utmCampaign,
          utmTerm,
          utmContent,
          referralCode,
          affiliateCode,
          landingPage: window.location.pathname.substring(0, 200),
          referrer: document.referrer ? document.referrer.substring(0, 200) : undefined,
          timestamp: Date.now(),
        };

        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));

        // If affiliate code is present, notify backend click tracker
        if (affiliateCode) {
          fetch(`/api/v1/affiliates/track-click/${encodeURIComponent(affiliateCode)}`, {
            method: 'POST',
          }).catch(() => {});
        }

        return attribution;
      }
    } catch {
      // Graceful fallback
    }

    return this.getStored();
  }

  /**
   * Retrieves stored attribution data from session
   */
  public static getStored(): AttributionData | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  /**
   * Clears stored attribution
   */
  public static clear(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  }
}
