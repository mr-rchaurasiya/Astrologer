import { describe, it, expect } from 'vitest';
import { AdvancedAstrologyContextBuilder } from '../../src/ai/astrology/astrologyContextBuilder';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 13: Advanced Astrology Context Builder Suite', () => {
  const dummyProfile = {
    name: 'Arjun Sharma',
    relationship: 'Self',
    dateOfBirth: '1990-05-15',
    timeOfBirth: '12:00:00',
    placeName: 'New Delhi',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  } as any;

  const analysis = AstrologyService.calculateAdvancedAnalysis({
    dateOfBirth: dummyProfile.dateOfBirth,
    timeOfBirth: dummyProfile.timeOfBirth,
    latitude: dummyProfile.latitude,
    longitude: dummyProfile.longitude,
    timezone: dummyProfile.timezone,
    timezoneOffset: dummyProfile.timezoneOffset,
  });

  it('selectively injects D10 for career intent', () => {
    const context = AdvancedAstrologyContextBuilder.buildSelectiveContext({
      profile: dummyProfile,
      analysis,
      userMessage: 'How will my career and job transition go this year?',
    });

    expect(context.intent).toBe('CAREER');
    expect(context.divisionalCharts.D1).toBeDefined();
    expect(context.divisionalCharts.D10).toBeDefined();
    expect(context.groundTruth.ascendantSign).toBe('Capricorn');
    expect(context.groundTruth.activeMahadasha).toBeDefined();
  });

  it('selectively injects D9 for marriage intent', () => {
    const context = AdvancedAstrologyContextBuilder.buildSelectiveContext({
      profile: dummyProfile,
      analysis,
      userMessage: 'When will I get married to my spouse?',
    });

    expect(context.intent).toBe('MARRIAGE');
    expect(context.divisionalCharts.D1).toBeDefined();
    expect(context.divisionalCharts.D9).toBeDefined();
  });

  it('selectively injects D24 for education intent', () => {
    const context = AdvancedAstrologyContextBuilder.buildSelectiveContext({
      profile: dummyProfile,
      analysis,
      userMessage: 'Will I clear my university exam?',
    });

    expect(context.intent).toBe('EDUCATION');
    expect(context.divisionalCharts.D24).toBeDefined();
  });

  it('creates comprehensive ground truth facts for fact-checking', () => {
    const context = AdvancedAstrologyContextBuilder.buildSelectiveContext({
      profile: dummyProfile,
      analysis,
      userMessage: 'What is my chart overview?',
    });

    expect(context.groundTruth).toHaveProperty('ascendantSign');
    expect(context.groundTruth).toHaveProperty('moonSign');
    expect(context.groundTruth).toHaveProperty('sunSign');
    expect(context.groundTruth).toHaveProperty('planetHouses');
    expect(context.groundTruth).toHaveProperty('strongestPlanet');
  });
});
