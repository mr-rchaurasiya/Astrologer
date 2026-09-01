import { describe, it, expect } from 'vitest';
import { AshtakavargaCalculator } from '../../src/astrology/ashtakavarga';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Ashtakavarga (BAV & SAV) Engine Suite', () => {
  const chart = AstrologyService.calculateBirthChart({
    dateOfBirth: '1990-05-15',
    timeOfBirth: '12:00:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  });

  it('calculates Bhinnashtakavarga with classical fixed planet bindu totals', () => {
    const av = AshtakavargaCalculator.calculate(chart.ascendant, chart.planets);

    expect(av.bhinnashtakavarga.length).toBe(7); // Sun to Saturn

    const getBavTotal = (p: string) => av.bhinnashtakavarga.find((x) => x.planet === p)!.totalBindus;
    expect(getBavTotal('Sun')).toBe(48);
    expect(getBavTotal('Moon')).toBe(49);
    expect(getBavTotal('Mars')).toBe(39);
    expect(getBavTotal('Mercury')).toBe(54);
    expect(getBavTotal('Jupiter')).toBe(56);
    expect(getBavTotal('Venus')).toBe(52);
    expect(getBavTotal('Saturn')).toBe(39);
  });

  it('verifies Sarvashtakavarga sums exactly to 337 bindus', () => {
    const av = AshtakavargaCalculator.calculate(chart.ascendant, chart.planets);

    expect(av.totalSavBindus).toBe(337);
    expect(av.sarvashtakavarga.length).toBe(12);
    expect(av.houseBindus.length).toBe(12);

    const sumSigns = av.sarvashtakavarga.reduce((a, b) => a + b, 0);
    expect(sumSigns).toBe(337);

    const sumHouses = av.houseBindus.reduce((a, b) => a + b, 0);
    expect(sumHouses).toBe(337);
  });
});
