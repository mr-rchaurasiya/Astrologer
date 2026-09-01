import { describe, it, expect } from 'vitest';
import { AstrologyService } from '../../src/astrology/service/astrology.service';
import goldenData from './goldenDataset.json';

describe('Vedic Astrology Golden Dataset Regression Verification', () => {
  goldenData.forEach((tc) => {
    it(`verifies reference chart: ${tc.id} (${tc.description})`, () => {
      const chart = AstrologyService.calculateBirthChart(tc.input);

      expect(chart).toBeDefined();
      expect(chart.birthInput.dateOfBirth).toBe(tc.input.dateOfBirth);
      expect(chart.ascendant).toBeDefined();
      expect(chart.ascendant.sign).toBe(tc.expected.ascendantSign);

      const sun = chart.planets.find((p) => p.name === 'Sun');
      expect(sun).toBeDefined();
      expect(sun?.sign).toBe(tc.expected.sunSign);

      if (tc.expected.moonSign) {
        const moon = chart.planets.find((p) => p.name === 'Moon');
        expect(moon?.sign).toBe(tc.expected.moonSign);
      }

      if (tc.expected.startingDashaLord) {
        expect(chart.dashas.startingLord).toBe(tc.expected.startingDashaLord);
      }

      // Check Mahadashas structure
      expect(chart.dashas.mahadashas.length).toBe(9);
      const totalDuration = chart.dashas.mahadashas.reduce((acc, d) => acc + d.durationYears, 0);
      expect(totalDuration).toBeGreaterThan(100);
      expect(totalDuration).toBeLessThanOrEqual(120);

      // Verify divisional charts exist and are valid
      expect(chart.divisionalCharts.d1.placements.length).toBe(10);
      expect(chart.divisionalCharts.d9.placements.length).toBe(10);
      expect(chart.divisionalCharts.d10.placements.length).toBe(10);
    });
  });
});
