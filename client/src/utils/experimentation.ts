import { Analytics } from './analytics';

export interface ExperimentConfig {
  id: string;
  name: string;
  variants: string[];
  weights?: number[]; // default equal weights
}

export class ExperimentManager {
  /**
   * Deterministic hash function mapping string to 0..99
   */
  private static hash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) % 100;
  }

  /**
   * Gets or assigns an anonymous session ID
   */
  public static getSessionId(): string {
    if (typeof window === 'undefined') return 'server_session';
    let sid = sessionStorage.getItem('astrologer_exp_session_id');
    if (!sid) {
      sid = 'exp_' + Math.random().toString(36).substring(2, 10);
      sessionStorage.setItem('astrologer_exp_session_id', sid);
    }
    return sid;
  }

  /**
   * Evaluates experiment variant deterministically and tracks exposure
   */
  public static getVariant(config: ExperimentConfig, userId?: string): string {
    const subjectId = userId || this.getSessionId();
    const hashVal = this.hash(`${config.id}_${subjectId}`);

    const variants = config.variants || ['control', 'variant_a'];
    const weights = config.weights || variants.map(() => 100 / variants.length);

    let cumulative = 0;
    let selectedVariant = variants[0];

    for (let i = 0; i < variants.length; i++) {
      cumulative += weights[i];
      if (hashVal < cumulative) {
        selectedVariant = variants[i];
        break;
      }
    }

    // Track experiment exposure
    Analytics.track('experiment_exposure', {
      experimentId: config.id,
      experimentName: config.name,
      variant: selectedVariant,
    });

    return selectedVariant;
  }
}
