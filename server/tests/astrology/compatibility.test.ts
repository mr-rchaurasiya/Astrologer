import { describe, it, expect } from 'vitest';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Compatibility (Ashtakoota Milan) Engine Suite', () => {
  const p1 = {
    dateOfBirth: '1990-05-15',
    timeOfBirth: '12:00:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  };

  const p2 = {
    dateOfBirth: '1992-08-20',
    timeOfBirth: '15:30:00',
    latitude: 19.0760,
    longitude: 72.8777,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  };

  it('calculates 36-guna Ashtakoota Milan and Kuja Dosha', () => {
    const result = AstrologyService.calculateCompatibility(p1, p2);

    expect(result.totalScore).toBeGreaterThanOrEqual(0);
    expect(result.totalScore).toBeLessThanOrEqual(36);
    expect(result.maxScore).toBe(36);
    expect(result.factors.length).toBe(8); // 8 kootas
    expect(result.kootas).toHaveProperty('varna');
    expect(result.kootas).toHaveProperty('vashya');
    expect(result.kootas).toHaveProperty('tara');
    expect(result.kootas).toHaveProperty('yoni');
    expect(result.kootas).toHaveProperty('grahaMaitri');
    expect(result.kootas).toHaveProperty('gana');
    expect(result.kootas).toHaveProperty('bhakoot');
    expect(result.kootas).toHaveProperty('nadi');
    expect(result.mangalDosha).toHaveProperty('isCancelled');
    expect(result.recommendation.length).toBeGreaterThan(10);
  });
});
