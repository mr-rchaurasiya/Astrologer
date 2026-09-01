import { describe, it, expect } from 'vitest';
import {
  calculateVimshottariDasha,
  calculateYoginiDasha,
  calculateAshtottariDasha,
  findActiveVimshottariPeriod,
} from '../../src/astrology/dashas';

describe('Phase 12: Advanced Dasha Engine Suite (Vimshottari, Yogini, Ashtottari)', () => {
  const moonLongitude = 275.5; // Capricorn (Uttarashadha)
  const birthDate = new Date('1990-05-15T06:30:00.000Z');

  it('calculates Vimshottari Dasha with 9 Mahadashas and active period finder', () => {
    const vimshottari = calculateVimshottariDasha(moonLongitude, birthDate);

    expect(vimshottari.startingLord).toBe('Sun');
    expect(vimshottari.mahadashas.length).toBe(9);
    expect(vimshottari.balanceAtBirthYears).toBeGreaterThan(0);

    const active = findActiveVimshottariPeriod(vimshottari, new Date('2026-09-01'));
    expect(active).toHaveProperty('mahadasha');
    expect(active).toHaveProperty('antardasha');
    expect(active).toHaveProperty('startDate');
    expect(active).toHaveProperty('endDate');
  });

  it('calculates Yogini Dasha (36-year repeating cycle)', () => {
    const yogini = calculateYoginiDasha(moonLongitude, birthDate);

    expect(yogini.startingLord).toContain('(');
    expect(yogini.mahadashas.length).toBe(16); // 2 full 36-year cycles
    expect(yogini.balanceAtBirthYears).toBeGreaterThan(0);
  });

  it('calculates Ashtottari Dasha (108-year cycle)', () => {
    const ashtottari = calculateAshtottariDasha(moonLongitude, birthDate);

    expect(ashtottari.startingLord).toBeDefined();
    expect(ashtottari.mahadashas.length).toBe(8);
  });
});
