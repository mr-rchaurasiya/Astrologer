import { describe, it, expect } from 'vitest';
import { ContextBuilder } from '../../src/ai/context/contextBuilder';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Astrology AI Context Builder & Point & Ask Resolution', () => {
  const mockProfile: any = {
    _id: '507f1f77bcf86cd799439011',
    userId: '507f191e810c19729de860ea',
    name: 'Ramnevas',
    relationship: 'self',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30:00',
    placeName: 'Ujjain, Madhya Pradesh, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'male',
    isPrimary: true,
  };

  const chart = AstrologyService.calculateBirthChart({
    dateOfBirth: mockProfile.dateOfBirth,
    timeOfBirth: mockProfile.timeOfBirth,
    latitude: mockProfile.latitude,
    longitude: mockProfile.longitude,
    timezone: mockProfile.timezone,
    timezoneOffset: mockProfile.timezoneOffset,
  });

  it('builds a sanitized, strongly typed context without sensitive security fields', () => {
    const context = ContextBuilder.buildContext(mockProfile, chart);

    expect(context.contextVersion).toBe('1.0');
    expect(context.profile.name).toBe('Ramnevas');
    expect(context.profile.dateOfBirth).toBe('1995-05-15');

    // Verify sensitive properties are NOT in the context
    expect((context.profile as any)._id).toBeUndefined();
    expect((context.profile as any).userId).toBeUndefined();
    expect((context as any).passwordHash).toBeUndefined();
    expect((context as any).tokens).toBeUndefined();

    // Verify factual astrological data is present
    expect(context.ascendant.sign).toBeDefined();
    expect(context.ascendant.degree).toBeGreaterThanOrEqual(0);
    expect(context.planets.length).toBe(9);
    expect(context.houses.length).toBe(12);
    expect(context.divisionalCharts.d1.length).toBe(10);
    expect(context.divisionalCharts.d9.length).toBe(10);
    expect(context.divisionalCharts.d10.length).toBe(10);
    expect(context.panchangSummary).toBeDefined();
  });

  it('resolves Point & Ask context for a Planet', () => {
    const context = ContextBuilder.buildContext(mockProfile, chart, {
      type: 'planet',
      id: 'Mars',
      label: 'Mars in 1st House',
    });

    expect(context.highlightedPoint).toBeDefined();
    expect(context.highlightedPoint?.type).toBe('planet');
    expect(context.highlightedPoint?.id).toBe('Mars');
    expect(context.highlightedPoint?.details.planetData.name).toBe('Mars');
    expect(Array.isArray(context.highlightedPoint?.details.aspectsCast)).toBe(true);
  });

  it('resolves Point & Ask context for a House', () => {
    const context = ContextBuilder.buildContext(mockProfile, chart, {
      type: 'house',
      id: '10',
      label: '10th House (Karma)',
    });

    expect(context.highlightedPoint).toBeDefined();
    expect(context.highlightedPoint?.type).toBe('house');
    expect(context.highlightedPoint?.id).toBe('10');
    expect(context.highlightedPoint?.details.houseData.houseNumber).toBe(10);
    expect(Array.isArray(context.highlightedPoint?.details.aspectsHittingHouse)).toBe(true);
  });

  it('resolves Point & Ask context for a Nakshatra', () => {
    const context = ContextBuilder.buildContext(mockProfile, chart, {
      type: 'nakshatra',
      id: 'Anuradha',
    });

    expect(context.highlightedPoint).toBeDefined();
    expect(context.highlightedPoint?.type).toBe('nakshatra');
    expect(context.highlightedPoint?.details.nakshatraName).toBeDefined();
  });

  it('resolves Point & Ask context for a Dasha', () => {
    const context = ContextBuilder.buildContext(mockProfile, chart, {
      type: 'dasha',
      id: 'Saturn Mahadasha',
    });

    expect(context.highlightedPoint).toBeDefined();
    expect(context.highlightedPoint?.type).toBe('dasha');
    expect(context.highlightedPoint?.details.mahadashasSummary.length).toBeGreaterThan(0);
  });
});
