export type PredictionConfidence = 'HIGH' | 'MEDIUM' | 'LOW' | 'INSUFFICIENT_DATA';

export interface ResponseSafetyEvaluation {
  isSafe: boolean;
  confidence: PredictionConfidence;
  disclaimersNeeded: string[];
  safetyFlags: string[];
  sanitizedContent: string;
}

export class AIResponseValidator {
  private static readonly PROHIBITED_MEDICAL_PATTERNS = [
    /you\s+have\s+(cancer|tumor|diabetes|heart attack|stroke|terminal)/i,
    /stop\s+(taking\s+)?(your\s+)?(medicine|medication|doctor|chemo|insulin)/i,
    /diagnosed\s+with/i,
    /you\s+will\s+die\s+on/i,
  ];

  private static readonly PROHIBITED_FINANCIAL_PATTERNS = [
    /100%\s+guaranteed\s+(profit|wealth|jackpot|return)/i,
    /invest\s+all\s+your\s+money/i,
    /guaranteed\s+stock\s+win/i,
  ];

  private static readonly PROHIBITED_EXTREME_REMEDY_PATTERNS = [
    /fast\s+for\s+\d+\s+days\s+without\s+water/i,
    /sacrifice\s+(an\s+)?animal/i,
    /harm\s+yourself/i,
    /black\s+magic\s+curse/i,
  ];

  private static readonly SECRET_PATTERNS = [
    /jwt[\w-]+\.[\w-]+\.[\w-]+/i,
    /bearer\s+[\w-]{20,}/i,
    /mongodb(\+srv)?:\/\//i,
    /sk-[a-zA-Z0-9]{20,}/i,
  ];

  /**
   * Validates response safety, scans for secrets/unsupported certainty, and attaches disclaimer where needed.
   */
  public static evaluate(content: string, intent?: string): ResponseSafetyEvaluation {
    if (!content) {
      return {
        isSafe: true,
        confidence: 'INSUFFICIENT_DATA',
        disclaimersNeeded: [],
        safetyFlags: [],
        sanitizedContent: '',
      };
    }

    const safetyFlags: string[] = [];
    const disclaimersNeeded: string[] = [];
    let sanitizedContent = content;

    // 1. Scan for Secrets & API Keys
    for (const pattern of this.SECRET_PATTERNS) {
      if (pattern.test(sanitizedContent)) {
        safetyFlags.push('SECRET_LEAKAGE_DETECTED');
        sanitizedContent = sanitizedContent.replace(pattern, '[REDACTED]');
      }
    }

    // 2. Scan for Prohibited Medical Claims
    for (const pattern of this.PROHIBITED_MEDICAL_PATTERNS) {
      if (pattern.test(sanitizedContent)) {
        safetyFlags.push('PROHIBITED_MEDICAL_DIAGNOSIS');
      }
    }

    // 3. Scan for Prohibited Financial Guarantees
    for (const pattern of this.PROHIBITED_FINANCIAL_PATTERNS) {
      if (pattern.test(sanitizedContent)) {
        safetyFlags.push('PROHIBITED_FINANCIAL_GUARANTEE');
      }
    }

    // 4. Scan for Extreme / Harmful Remedies
    for (const pattern of this.PROHIBITED_EXTREME_REMEDY_PATTERNS) {
      if (pattern.test(sanitizedContent)) {
        safetyFlags.push('PROHIBITED_HARMFUL_REMEDY');
      }
    }

    // 5. Determine Needed Disclaimers based on Intent
    if (intent === 'HEALTH' || /health|medical|disease|surgery/i.test(sanitizedContent)) {
      disclaimersNeeded.push('Astrological health observations reflect subtle energetic tendencies and should never substitute qualified medical evaluation.');
    }
    if (intent === 'FINANCE' || /invest|wealth|crypto|stock/i.test(sanitizedContent)) {
      disclaimersNeeded.push('Financial astrology is for general interpretive guidance; please consult certified financial professionals for fiduciary advice.');
    }

    // 6. Compute Confidence Rating
    let confidence: PredictionConfidence = 'HIGH';
    if (safetyFlags.length > 0) {
      confidence = 'LOW';
    } else if (content.length < 60) {
      confidence = 'MEDIUM';
    }

    const isSafe = !safetyFlags.includes('PROHIBITED_MEDICAL_DIAGNOSIS') &&
                   !safetyFlags.includes('PROHIBITED_HARMFUL_REMEDY');

    return {
      isSafe,
      confidence,
      disclaimersNeeded,
      safetyFlags,
      sanitizedContent,
    };
  }
}
