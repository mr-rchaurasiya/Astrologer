import { describe, it, expect } from 'vitest';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Golden Test Chart — Deterministic Vedic Astrology Verification', () => {
  const referenceBirthData = {
    dateOfBirth: '1990-05-15',
    timeOfBirth: '06:30:00',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  };

  it('should generate a complete, deterministic, strongly typed Vedic Astrology Chart', () => {
    const chart = AstrologyService.calculateBirthChart(referenceBirthData);

    // 1. Birth Input & Ephemeris
    expect(chart.birthInput.dateOfBirth).toBe('1990-05-15');
    expect(chart.birthInput.utcDateTime).toBe('1990-05-15T01:00:00.000Z');
    expect(chart.birthInput.julianDay).toBeCloseTo(2448026.54167, 3);
    expect(chart.ayanamsa.system).toBe('Lahiri');
    expect(chart.ayanamsa.value).toBeCloseTo(23.722, 2);

    // 2. Ascendant (Lagna)
    expect(chart.ascendant).toBeDefined();
    expect(chart.ascendant.sign).toBeDefined();
    expect(chart.ascendant.signNumber).toBeGreaterThanOrEqual(1);
    expect(chart.ascendant.signNumber).toBeLessThanOrEqual(12);
    expect(chart.ascendant.signDegree).toBeGreaterThanOrEqual(0);
    expect(chart.ascendant.signDegree).toBeLessThan(30);
    expect(chart.ascendant.nakshatra).toBeDefined();

    // 3. Planets & Nodes
    expect(chart.planets.length).toBe(9);
    const planetNames = chart.planets.map((p) => p.name);
    expect(planetNames).toContain('Sun');
    expect(planetNames).toContain('Moon');
    expect(planetNames).toContain('Mars');
    expect(planetNames).toContain('Mercury');
    expect(planetNames).toContain('Jupiter');
    expect(planetNames).toContain('Venus');
    expect(planetNames).toContain('Saturn');
    expect(planetNames).toContain('Rahu');
    expect(planetNames).toContain('Ketu');

    // Sun in mid-May is in Taurus in Sidereal zodiac (~0° to 30° Taurus)
    const sun = chart.planets.find((p) => p.name === 'Sun')!;
    expect(sun.sign).toBe('Taurus');
    expect(sun.retrograde).toBe(false);

    // Rahu and Ketu are exactly 180° apart
    const rahu = chart.planets.find((p) => p.name === 'Rahu')!;
    const ketu = chart.planets.find((p) => p.name === 'Ketu')!;
    let nodeDiff = Math.abs(rahu.longitude - ketu.longitude);
    if (nodeDiff > 180) nodeDiff = 360 - nodeDiff;
    expect(nodeDiff).toBeCloseTo(180, 2);
    expect(rahu.retrograde).toBe(true);
    expect(ketu.retrograde).toBe(true);

    // 4. 12 Vedic Houses
    expect(chart.houses.length).toBe(12);
    expect(chart.houses[0].houseNumber).toBe(1);
    expect(chart.houses[0].sign).toBe(chart.ascendant.sign);

    // 5. Divisional Charts (D1, D9, D10)
    expect(chart.divisionalCharts.d1.placements.length).toBe(10); // 9 planets + Ascendant
    expect(chart.divisionalCharts.d9.placements.length).toBe(10);
    expect(chart.divisionalCharts.d10.placements.length).toBe(10);

    // 6. Vimshottari Dasha Tree
    expect(chart.dashas.mahadashas.length).toBe(9);
    expect(chart.dashas.balanceAtBirthYears).toBeGreaterThan(0);

    // 7. Panchang & Muhurta
    expect(chart.panchang.tithi.number).toBeGreaterThanOrEqual(1);
    expect(chart.panchang.tithi.number).toBeLessThanOrEqual(30);
    expect(chart.muhurta.rahuKaal.startTime).toBeDefined();
    expect(chart.muhurta.abhijitMuhurta.startTime).toBeDefined();

    // 8. Determinism test: calling again with identical parameters yields identical outputs
    const chart2 = AstrologyService.calculateBirthChart(referenceBirthData);
    expect(chart2.ascendant.longitude).toBe(chart.ascendant.longitude);
    expect(chart2.planets[0].longitude).toBe(chart.planets[0].longitude);
  });
});
