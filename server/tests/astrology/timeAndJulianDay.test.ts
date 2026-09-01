import { describe, it, expect } from 'vitest';
import { dateToJulianDay, julianDayToDate, parseBirthTimeToUtc } from '../../src/astrology/coordinates/time';

describe('Astrological Time & Julian Day Transformations', () => {
  it('should accurately calculate Julian Day for J2000.0 standard epoch', () => {
    // 2000-01-01 12:00:00 UTC = JD 2451545.0
    const j2000 = new Date('2000-01-01T12:00:00Z');
    const jd = dateToJulianDay(j2000);
    expect(jd).toBeCloseTo(2451545.0, 4);
  });

  it('should accurately calculate Julian Day for midnight 2000-01-01 00:00:00 UTC', () => {
    const j2000Midnight = new Date('2000-01-01T00:00:00Z');
    const jd = dateToJulianDay(j2000Midnight);
    expect(jd).toBeCloseTo(2451544.5, 4);
  });

  it('should handle leap year dates (e.g. 2024-02-29 12:00:00 UTC)', () => {
    const leapDate = new Date('2024-02-29T12:00:00Z');
    const jd = dateToJulianDay(leapDate);
    expect(jd).toBeCloseTo(2460370.0, 4);
  });

  it('should round-trip between Julian Day and UTC Date', () => {
    const originalDate = new Date('1998-05-21T09:00:00Z');
    const jd = dateToJulianDay(originalDate);
    const roundTripDate = julianDayToDate(jd);

    expect(roundTripDate.getUTCFullYear()).toBe(1998);
    expect(roundTripDate.getUTCMonth()).toBe(4); // 0-indexed May
    expect(roundTripDate.getUTCDate()).toBe(21);
    expect(roundTripDate.getUTCHours()).toBe(9);
    expect(roundTripDate.getUTCMinutes()).toBe(0);
  });

  it('should convert local birth time with timezone offset (+05:30) to correct UTC Date', () => {
    // 14:30:00 local with +5.5 offset = 09:00:00 UTC
    const parsed = parseBirthTimeToUtc('1998-05-21', '14:30:00', 5.5);

    expect(parsed.utcDate.toISOString()).toBe('1998-05-21T09:00:00.000Z');
    expect(parsed.julianDay).toBeCloseTo(2450954.875, 3);
  });
});
