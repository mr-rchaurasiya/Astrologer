import { describe, it, expect } from 'vitest';
import { AstrologyFactValidator } from '../../src/ai/validation/astrologyFactValidator';
import { AIResponseValidator } from '../../src/ai/validation/aiResponseValidator';
import { GroundTruthFacts } from '../../src/ai/astrology/astrologyContext.types';

describe('Phase 13: Fact Grounding & Safety Validation Suite', () => {
  const dummyGroundTruth: GroundTruthFacts = {
    ascendantSign: 'Capricorn',
    ascendantDegree: 27.2,
    ascendantLord: 'Saturn',
    moonSign: 'Capricorn',
    moonNakshatra: 'Uttarashadha',
    sunSign: 'Taurus',
    activeMahadasha: 'Sun',
    planetSigns: {
      Sun: 'Taurus',
      Moon: 'Capricorn',
      Mars: 'Aquarius',
      Mercury: 'Aries',
      Jupiter: 'Gemini',
      Venus: 'Aries',
      Saturn: 'Sagittarius',
      Rahu: 'Capricorn',
      Ketu: 'Cancer',
    },
    planetHouses: {
      Sun: 5,
      Moon: 1,
      Mars: 2,
      Mercury: 4,
      Jupiter: 6,
      Venus: 4,
      Saturn: 12,
      Rahu: 1,
      Ketu: 7,
    },
    planetDignities: {
      Sun: 'own_sign',
      Moon: 'neutral',
      Mars: 'friendly',
      Mercury: 'neutral',
      Jupiter: 'enemy',
      Venus: 'neutral',
      Saturn: 'friendly',
      Rahu: 'neutral',
      Ketu: 'neutral',
    },
    detectedYogaNames: ['Budha-Aditya Yoga'],
    sadeSatiActive: false,
  };

  it('passes when AI output accurately matches ground truth', () => {
    const aiText = 'Your Ascendant is Capricorn and your Sun is in Taurus in the 5th house.';
    const result = AstrologyFactValidator.validate(aiText, dummyGroundTruth);

    expect(result.isValid).toBe(true);
    expect(result.contradictions.length).toBe(0);
    expect(result.groundingScore).toBe(1.0);
  });

  it('detects contradiction when AI claims an incorrect Ascendant sign', () => {
    const aiText = 'Since your Ascendant is Leo, you have a fiery temperament.';
    const result = AstrologyFactValidator.validate(aiText, dummyGroundTruth);

    expect(result.isValid).toBe(false);
    expect(result.contradictions.length).toBeGreaterThan(0);
    expect(result.contradictions[0]).toContain('Claimed Ascendant is leo');
  });

  it('detects contradiction when AI claims incorrect planetary house placement', () => {
    const aiText = 'Your Sun is in the 10th house indicating public authority.';
    const result = AstrologyFactValidator.validate(aiText, dummyGroundTruth);

    expect(result.isValid).toBe(false);
    expect(result.contradictions.some((c) => c.includes('Sun is in house 10'))).toBe(true);
  });

  it('enforces safety boundaries against medical diagnosis and financial guarantees', () => {
    const medicalText = 'You have cancer and must stop taking medicine.';
    const medResult = AIResponseValidator.evaluate(medicalText);
    expect(medResult.isSafe).toBe(false);
    expect(medResult.safetyFlags).toContain('PROHIBITED_MEDICAL_DIAGNOSIS');

    const financialText = 'This period gives you 100% guaranteed profit in stock trading.';
    const finResult = AIResponseValidator.evaluate(financialText);
    expect(finResult.safetyFlags).toContain('PROHIBITED_FINANCIAL_GUARANTEE');
  });

  it('redacts secret credentials if accidentally surfaced in text', () => {
    const textWithSecret = 'Your configuration key is sk-12345678901234567890abcdef.';
    const result = AIResponseValidator.evaluate(textWithSecret);

    expect(result.safetyFlags).toContain('SECRET_LEAKAGE_DETECTED');
    expect(result.sanitizedContent).toContain('[REDACTED]');
    expect(result.sanitizedContent).not.toContain('sk-12345678901234567890abcdef');
  });
});
