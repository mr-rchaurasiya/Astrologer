import { describe, it, expect } from 'vitest';
import { AstrologyService } from '../../src/astrology/service/astrology.service';
import { normalizeDegrees } from '../../src/astrology/zodiac/signs';

describe('Phase 12: Astronomical Accuracy & Boundary Verification Suite', () => {
  it('strictly bounds longitudes within [0, 360) degrees', () => {
    expect(normalizeDegrees(0)).toBe(0);
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(360.5)).toBe(0.5);
    expect(normalizeDegrees(-10)).toBe(350);
    expect(normalizeDegrees(-370)).toBe(350);
    expect(normalizeDegrees(725)).toBe(5);
  });

  it('calculates deterministic chart at midnight in a leap year (2000-02-29)', () => {
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: '2000-02-29',
      timeOfBirth: '00:00:00',
      latitude: 51.5074,
      longitude: -0.1278,
      timezone: 'Europe/London',
      timezoneOffset: 0,
    });

    expect(chart.ascendant.sign).toBe('Aries');
    expect(chart.planets.length).toBe(9);
    expect(chart.calculationVersion).toBe('2.0.0');
    expect(chart.ephemerisVersion).toContain('AstronomyEngine');
  });

  it('detects retrograde planets accurately', () => {
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: '1978-07-07',
      timeOfBirth: '18:45:00',
      latitude: 35.6762,
      longitude: 139.6503,
      timezone: 'Asia/Tokyo',
      timezoneOffset: 9.0,
    });

    // Sun and Moon can never be retrograde
    const sun = chart.planets.find((p) => p.name === 'Sun')!;
    const moon = chart.planets.find((p) => p.name === 'Moon')!;
    expect(sun.retrograde).toBe(false);
    expect(moon.retrograde).toBe(false);

    // Rahu and Ketu are always retrograde in mean node motion
    const rahu = chart.planets.find((p) => p.name === 'Rahu')!;
    const ketu = chart.planets.find((p) => p.name === 'Ketu')!;
    expect(rahu.retrograde).toBe(true);
    expect(ketu.retrograde).toBe(true);
  });
});
