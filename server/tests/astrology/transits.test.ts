import { describe, it, expect } from 'vitest';
import { AdvancedTransitCalculator } from '../../src/astrology/transits';
import { AstrologyService } from '../../src/astrology/service/astrology.service';

describe('Phase 12: Advanced Transit & Sade Sati Engine Suite', () => {
  const chart = AstrologyService.calculateBirthChart({
    dateOfBirth: '1990-05-15',
    timeOfBirth: '12:00:00',
    latitude: 28.6139,
    longitude: 77.2090,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
  });

  it('calculates dynamic Gochar transits and evaluates Sade Sati status', () => {
    const transits = AdvancedTransitCalculator.calculateTransits(
      chart.ascendant,
      chart.planets,
      new Date('2026-09-01')
    );

    expect(transits.planets.length).toBe(9);
    expect(transits.sadeSati).toHaveProperty('isActive');
    expect(transits.sadeSati).toHaveProperty('phase');
    expect(transits.sadeSati).toHaveProperty('saturnSign');
    expect(transits.sadeSati).toHaveProperty('moonSign');
    expect(typeof transits.isAshtamaShani).toBe('boolean');
    expect(typeof transits.isKantakaShani).toBe('boolean');
    expect(typeof transits.isJupiterAuspicious).toBe('boolean');
    expect(Array.isArray(transits.activeEvents)).toBe(true);
  });
});
