import { describe, it, expect } from 'vitest';
import { calculateAllDivisionalCharts } from '../../src/astrology/divisional/divisionalCharts';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Shodashavarga (16 Divisional Charts) Suite', () => {
  const chart = AstrologyService.calculateBirthChart({
    dateOfBirth: '1990-05-15',
    timeOfBirth: '12:00:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  });

  it('calculates all 16 classical divisional charts without error', () => {
    const allDivisions = calculateAllDivisionalCharts(chart.ascendant, chart.planets);

    const expectedKeys = [
      'D1', 'D2', 'D3', 'D4', 'D7', 'D9', 'D10', 'D12',
      'D16', 'D20', 'D24', 'D27', 'D30', 'D40', 'D45', 'D60',
    ];

    expectedKeys.forEach((key) => {
      expect(allDivisions[key as any]).toBeDefined();
      expect(allDivisions[key as any].name).toBe(key);
      expect(allDivisions[key as any].placements.length).toBe(10); // Ascendant + 9 planets
      expect(allDivisions[key as any].ascendantSignNumber).toBeGreaterThanOrEqual(1);
      expect(allDivisions[key as any].ascendantSignNumber).toBeLessThanOrEqual(12);
    });
  });

  it('verifies D9 (Navamsha) and D10 (Dashamsha) sign calculation accuracy', () => {
    const allDivisions = calculateAllDivisionalCharts(chart.ascendant, chart.planets);

    expect(allDivisions.D1.ascendantSign).toBe('Capricorn');
    expect(allDivisions.D9.ascendantSign).toBe('Virgo');
    expect(allDivisions.D10.ascendantSign).toBe('Gemini');
  });
});
