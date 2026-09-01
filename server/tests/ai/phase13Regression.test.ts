import { describe, it, expect } from 'vitest';
import goldenDataset from '../fixtures/aiGoldenDataset.json';
import { IntentClassifier } from '../../src/ai/astrology/intentClassifier';
import { AdvancedAstrologyContextBuilder } from '../../src/ai/astrology/astrologyContextBuilder';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 13: Golden Dataset AI Regression Suite', () => {
  const dummyProfile = {
    name: 'Priya Sharma',
    relationship: 'Self',
    dateOfBirth: '1992-08-20',
    timeOfBirth: '15:30:00',
    placeName: 'Mumbai',
    latitude: 19.0760,
    longitude: 72.8777,
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

  it('validates all 10 golden benchmark queries for accurate intent & divisional chart selection', () => {
    for (const testCase of goldenDataset) {
      const intentRes = IntentClassifier.classify(testCase.query);
      expect(intentRes.intent).toBe(testCase.expectedIntent);

      const context = AdvancedAstrologyContextBuilder.buildSelectiveContext({
        profile: dummyProfile,
        analysis,
        userMessage: testCase.query,
      });

      for (const division of testCase.expectedDivisions) {
        expect(context.divisionalCharts[division as any]).toBeDefined();
      }
    }
  });
});
