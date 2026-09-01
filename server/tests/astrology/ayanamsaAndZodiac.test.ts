import { describe, it, expect } from 'vitest';
import { calculateLahiriAyanamsa, formatDegreesDMS, tropicalToSidereal } from '../../src/astrology/ephemeris/ayanamsa';
import { normalizeDegrees, getSignFromLongitude, ZODIAC_SIGNS } from '../../src/astrology/zodiac/signs';

describe('Lahiri Ayanamsa & Zodiac System', () => {
  it('should return approximately 23.857° (23°51\'25") for J2000.0 epoch', () => {
    const jd2000 = 2451545.0;
    const ayanamsa = calculateLahiriAyanamsa(jd2000);
    expect(ayanamsa).toBeCloseTo(23.85709, 3);

    const formatted = formatDegreesDMS(ayanamsa);
    expect(formatted).toContain('23° 51\'');
  });

  it('should increase monotonically over time at ~50.29 arcseconds per year', () => {
    const jd1950 = 2433282.5;
    const jd2000 = 2451545.0;
    const jd2050 = 2469807.5;

    const ayanamsa1950 = calculateLahiriAyanamsa(jd1950);
    const ayanamsa2000 = calculateLahiriAyanamsa(jd2000);
    const ayanamsa2050 = calculateLahiriAyanamsa(jd2050);

    expect(ayanamsa1950).toBeLessThan(ayanamsa2000);
    expect(ayanamsa2000).toBeLessThan(ayanamsa2050);
    expect(ayanamsa2050 - ayanamsa2000).toBeCloseTo(0.698, 2); // ~50 years * 50.29" = ~2514" = ~0.698°
  });

  it('should normalize angles into [0, 360) range', () => {
    expect(normalizeDegrees(0)).toBe(0);
    expect(normalizeDegrees(360)).toBe(0);
    expect(normalizeDegrees(370)).toBe(10);
    expect(normalizeDegrees(-10)).toBe(350);
    expect(normalizeDegrees(-730)).toBe(350);
  });

  it('should map longitudes to correct zodiac signs and degrees', () => {
    // 0° = Aries 0°
    const aries = getSignFromLongitude(0);
    expect(aries.sign).toBe('Aries');
    expect(aries.signNumber).toBe(1);
    expect(aries.signDegree).toBe(0);

    // 45° = Taurus 15°
    const taurus = getSignFromLongitude(45);
    expect(taurus.sign).toBe('Taurus');
    expect(taurus.signNumber).toBe(2);
    expect(taurus.signDegree).toBe(15);

    // 359.5° = Pisces 29.5°
    const pisces = getSignFromLongitude(359.5);
    expect(pisces.sign).toBe('Pisces');
    expect(pisces.signNumber).toBe(12);
    expect(pisces.signDegree).toBeCloseTo(29.5, 4);
  });

  it('should test critical 30-degree sign boundaries', () => {
    const signs = [
      { deg: 29.9999, expectedSign: 'Aries', expectedNum: 1 },
      { deg: 30.0001, expectedSign: 'Taurus', expectedNum: 2 },
      { deg: 59.9999, expectedSign: 'Taurus', expectedNum: 2 },
      { deg: 60.0001, expectedSign: 'Gemini', expectedNum: 3 },
      { deg: 89.9999, expectedSign: 'Gemini', expectedNum: 3 },
      { deg: 90.0001, expectedSign: 'Cancer', expectedNum: 4 },
      { deg: 119.9999, expectedSign: 'Cancer', expectedNum: 4 },
      { deg: 120.0001, expectedSign: 'Leo', expectedNum: 5 },
      { deg: 149.9999, expectedSign: 'Leo', expectedNum: 5 },
      { deg: 150.0001, expectedSign: 'Virgo', expectedNum: 6 },
      { deg: 179.9999, expectedSign: 'Virgo', expectedNum: 6 },
      { deg: 180.0001, expectedSign: 'Libra', expectedNum: 7 },
      { deg: 209.9999, expectedSign: 'Libra', expectedNum: 7 },
      { deg: 210.0001, expectedSign: 'Scorpio', expectedNum: 8 },
      { deg: 239.9999, expectedSign: 'Scorpio', expectedNum: 8 },
      { deg: 240.0001, expectedSign: 'Sagittarius', expectedNum: 9 },
      { deg: 269.9999, expectedSign: 'Sagittarius', expectedNum: 9 },
      { deg: 270.0001, expectedSign: 'Capricorn', expectedNum: 10 },
      { deg: 299.9999, expectedSign: 'Capricorn', expectedNum: 10 },
      { deg: 300.0001, expectedSign: 'Aquarius', expectedNum: 11 },
      { deg: 329.9999, expectedSign: 'Aquarius', expectedNum: 11 },
      { deg: 330.0001, expectedSign: 'Pisces', expectedNum: 12 },
    ];

    for (const b of signs) {
      const res = getSignFromLongitude(b.deg);
      expect(res.sign).toBe(b.expectedSign);
      expect(res.signNumber).toBe(b.expectedNum);
    }
  });
});
