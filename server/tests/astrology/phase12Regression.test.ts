import { describe, it, expect } from 'vitest';
import goldenDataset from './phase12GoldenDataset.json';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Golden Dataset Regression Suite', () => {
  it('validates all 5 golden reference charts against rigorous mathematical criteria', () => {
    for (const testCase of goldenDataset) {
      const chart = AstrologyService.calculateBirthChart(testCase.input as any);
      const analysis = AstrologyService.calculateAdvancedAnalysis(testCase.input as any);

      expect(chart.ascendant.sign).toBe(testCase.expected.ascendantSign);
      expect(chart.planets.find((p) => p.name === 'Sun')!.sign).toBe(testCase.expected.sunSign);
      expect(chart.dashas.mahadashas.length).toBe(9);
      expect(chart.dashas.balanceAtBirthYears).toBeGreaterThan(0);
      expect(analysis.ashtakavarga.totalSavBindus).toBe(337);
      expect(Object.keys(analysis.divisionalCharts).length).toBe(16);
    }
  });
});
