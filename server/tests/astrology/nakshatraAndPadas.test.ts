import { describe, it, expect } from 'vitest';
import { getNakshatraFromLongitude, NAKSHATRAS, NAKSHATRA_SPAN, PADA_SPAN } from '../../src/astrology/nakshatra/nakshatras';

describe('Nakshatra & Pada System', () => {
  it('should contain exactly 27 Nakshatras spanning 13°20\' each', () => {
    expect(NAKSHATRAS.length).toBe(27);
    expect(NAKSHATRA_SPAN).toBeCloseTo(13.333333, 5);
    expect(PADA_SPAN).toBeCloseTo(3.333333, 5);
  });

  it('should identify Ashwini pada 1 at 0° longitude', () => {
    const res = getNakshatraFromLongitude(0);
    expect(res.name).toBe('Ashwini');
    expect(res.number).toBe(1);
    expect(res.lord).toBe('Ketu');
    expect(res.pada).toBe(1);
  });

  it('should identify Rohini pada 2 at 45° longitude', () => {
    // Rohini spans 40° to 53°20'. 45° is 5° into Rohini. Pada 2 is 3°20' to 6°40'.
    const res = getNakshatraFromLongitude(45);
    expect(res.name).toBe('Rohini');
    expect(res.number).toBe(4);
    expect(res.lord).toBe('Moon');
    expect(res.pada).toBe(2);
  });

  it('should identify Revati pada 4 at 359° longitude', () => {
    // Revati spans 346°40' to 360°
    const res = getNakshatraFromLongitude(359.0);
    expect(res.name).toBe('Revati');
    expect(res.number).toBe(27);
    expect(res.lord).toBe('Mercury');
    expect(res.pada).toBe(4);
  });

  it('should handle exact boundaries across all 27 nakshatras', () => {
    for (let i = 0; i < 27; i++) {
      const nak = NAKSHATRAS[i];
      const startRes = getNakshatraFromLongitude(nak.startDegree + 0.001);
      expect(startRes.name).toBe(nak.name);
      expect(startRes.number).toBe(nak.number);
      expect(startRes.pada).toBe(1);

      const endRes = getNakshatraFromLongitude(nak.endDegree - 0.001);
      expect(endRes.name).toBe(nak.name);
      expect(endRes.number).toBe(nak.number);
      expect(endRes.pada).toBe(4);
    }
  });
});
