import { describe, it, expect } from 'vitest';
import { YogaDetector } from '../../src/astrology/yogas';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Classical Yoga Detection Engine Suite', () => {
  it('detects classical Yogas deterministically for Delhi chart', () => {
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: '1990-05-15',
      timeOfBirth: '12:00:00',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata',
      timezoneOffset: 5.5,
    });

    const yogas = YogaDetector.detectAllYogas(chart.ascendant, chart.planets, chart.houses);
    expect(yogas.length).toBeGreaterThan(0);

    // Each detected Yoga has full structured explanation and supporting factors
    for (const yoga of yogas) {
      expect(yoga.yogaId).toBeDefined();
      expect(yoga.name).toBeDefined();
      expect(yoga.category).toBeDefined();
      expect(yoga.detected).toBe(true);
      expect(['High', 'Medium', 'Low', 'Potential']).toContain(yoga.strength);
      expect(yoga.conditions.length).toBeGreaterThan(0);
      expect(yoga.explanation.length).toBeGreaterThan(10);
      expect(yoga.supportingPlanets.length).toBeGreaterThan(0);
      expect(yoga.supportingHouses.length).toBeGreaterThan(0);
    }
  });
});
