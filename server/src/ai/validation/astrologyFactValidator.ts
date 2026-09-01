import { GroundTruthFacts } from '../astrology/astrologyContext.types';
import { PlanetName, ZodiacSignName } from '../../astrology/types/astrology';

export interface FactValidationResult {
  isValid: boolean;
  contradictions: string[];
  groundingScore: number; // 0.0 to 1.0
}

export class AstrologyFactValidator {
  /**
   * Cross-checks AI generated text against deterministic ground truth astrological facts.
   */
  public static validate(text: string, groundTruth: GroundTruthFacts): FactValidationResult {
    if (!text || !groundTruth) {
      return { isValid: true, contradictions: [], groundingScore: 1.0 };
    }

    const lower = text.toLowerCase();
    const contradictions: string[] = [];

    // 1. Check Ascendant (Lagna) Sign
    const ascSign = groundTruth.ascendantSign.toLowerCase();
    const allSigns = [
      'aries', 'taurus', 'gemini', 'cancer',
      'leo', 'virgo', 'libra', 'scorpio',
      'sagittarius', 'capricorn', 'aquarius', 'pisces',
    ];

    // Check if text explicitly says "ascendant is [other_sign]" or "lagna is [other_sign]"
    for (const sign of allSigns) {
      if (sign !== ascSign) {
        const patternAsc = new RegExp(`(ascendant|lagna)\\s+(is|in)\\s+${sign}\\b`, 'i');
        if (patternAsc.test(lower)) {
          contradictions.push(`Claimed Ascendant is ${sign}, but deterministic Lagna is ${groundTruth.ascendantSign}.`);
        }
      }
    }

    // 2. Check Moon Sign
    const moonSign = groundTruth.moonSign.toLowerCase();
    for (const sign of allSigns) {
      if (sign !== moonSign) {
        const patternMoon = new RegExp(`(moon\\s+sign|rashi)\\s+(is|in)\\s+${sign}\\b`, 'i');
        if (patternMoon.test(lower)) {
          contradictions.push(`Claimed Moon sign is ${sign}, but deterministic Moon sign is ${groundTruth.moonSign}.`);
        }
      }
    }

    // 3. Check Sun Sign
    const sunSign = groundTruth.sunSign.toLowerCase();
    for (const sign of allSigns) {
      if (sign !== sunSign) {
        const patternSun = new RegExp(`sun\\s+sign\\s+(is|in)\\s+${sign}\\b`, 'i');
        if (patternSun.test(lower)) {
          contradictions.push(`Claimed Sun sign is ${sign}, but deterministic Sun sign is ${groundTruth.sunSign}.`);
        }
      }
    }

    // 4. Check Major Planetary Houses (for Sun, Moon, Jupiter, Saturn, Mars)
    const majorPlanets: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Jupiter', 'Saturn'];
    for (const p of majorPlanets) {
      const actualHouse = groundTruth.planetHouses[p];
      if (!actualHouse) continue;

      for (let h = 1; h <= 12; h++) {
        if (h !== actualHouse) {
          const houseWords = [
            `${h}th house`, `${h}st house`, `${h}nd house`, `${h}rd house`,
            `house ${h}`, `${h}th bhava`,
          ];
          for (const hw of houseWords) {
            const pRegex = new RegExp(`\\b${p.toLowerCase()}\\s+(is\\s+in|placed\\s+in|occupies)\\s+(the\\s+)?${hw}\\b`, 'i');
            if (pRegex.test(lower)) {
              contradictions.push(`Claimed ${p} is in house ${h}, but deterministic position is house ${actualHouse}.`);
            }
          }
        }
      }
    }

    // Calculate grounding score
    const groundingScore = Math.max(0, 1.0 - contradictions.length * 0.25);
    const isValid = contradictions.length === 0;

    return {
      isValid,
      contradictions,
      groundingScore,
    };
  }
}
