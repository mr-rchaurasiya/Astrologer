import { describe, it, expect } from 'vitest';
import { ShadbalaCalculator } from '../../src/astrology/strength';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Shadbala (Six-Fold Planetary Strength) Engine Suite', () => {
  const chart = AstrologyService.calculateBirthChart({
    dateOfBirth: '1990-05-15',
    timeOfBirth: '12:00:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  });

  it('calculates 6-fold strength breakdown in virupas and rupas for all 7 planets', () => {
    const shadbala = ShadbalaCalculator.calculate(chart.ascendant, chart.planets, chart.houses);

    const mainPlanets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'] as const;

    for (const p of mainPlanets) {
      const score = shadbala.scores[p];
      expect(score).toBeDefined();
      expect(score.sthanaBala).toBeGreaterThan(0);
      expect(score.digBala).toBeGreaterThanOrEqual(0);
      expect(score.kalaBala).toBeGreaterThan(0);
      expect(score.cheshtaBala).toBeGreaterThan(0);
      expect(score.naisargikaBala).toBeGreaterThan(0);
      expect(score.totalVirupas).toBeGreaterThan(150);
      expect(score.totalRupas).toBeGreaterThan(2.5);
      expect(score.rank).toBeGreaterThanOrEqual(1);
      expect(score.rank).toBeLessThanOrEqual(7);
    }

    expect(shadbala.strongestPlanet).toBeDefined();
    expect(shadbala.weakestPlanet).toBeDefined();
    expect(shadbala.strongestPlanet).not.toBe(shadbala.weakestPlanet);
  });
});
