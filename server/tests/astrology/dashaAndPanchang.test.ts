import { describe, it, expect } from 'vitest';
import { calculateVimshottariDasha, TOTAL_VIMSHOTTARI_YEARS } from '../../src/astrology/dasha/vimshottari';
import { calculatePanchang } from '../../src/astrology/panchang/panchang';
import { calculateMuhurtas } from '../../src/astrology/muhurta/muhurta';

describe('Vimshottari Dasha, Panchang & Muhurta Engines', () => {
  describe('Vimshottari Dasha Tree', () => {
    it('should calculate 120-year cycle and starting balance from Moon Nakshatra', () => {
      // Moon at 0° (Ashwini nakshatra, Lord = Ketu, total 7 years)
      const birthDate = new Date('2000-01-01T00:00:00Z');
      const dasha = calculateVimshottariDasha(0.0, birthDate);

      expect(dasha.startingLord).toBe('Ketu');
      expect(dasha.balanceAtBirthYears).toBeCloseTo(7.0, 3); // 100% remaining
      expect(dasha.mahadashas.length).toBe(9);

      // Total sum of 9 mahadashas from birth should equal 120 years
      const totalYears = dasha.mahadashas.reduce((acc, m) => acc + m.durationYears, 0);
      expect(totalYears).toBeCloseTo(TOTAL_VIMSHOTTARI_YEARS, 2);

      // Verify each Mahadasha contains 9 Antardashas
      expect(dasha.mahadashas[0].subPeriods?.length).toBe(9);
      // Verify each Antardasha contains 9 Pratyantardashas
      expect(dasha.mahadashas[0].subPeriods?.[0].subPeriods?.length).toBe(9);
    });

    it('should correctly calculate partial balance when Moon is midway through Nakshatra', () => {
      // Ashwini spans 0° to 13°20'. If Moon is at 6°40' (50% through), remaining balance is 50% of 7 = 3.5 yrs
      const birthDate = new Date('2000-01-01T00:00:00Z');
      const dasha = calculateVimshottariDasha(13.333333 / 2, birthDate);

      expect(dasha.startingLord).toBe('Ketu');
      expect(dasha.balanceAtBirthYears).toBeCloseTo(3.5, 2);
    });
  });

  describe('Panchang Calculation', () => {
    it('should calculate Tithi, Vara, Nakshatra, Yoga, and Karana', () => {
      const utcDate = new Date('2024-05-15T06:30:00Z');
      // Sun at 30° (Taurus 0°), Moon at 90° (Cancer 0°) -> diff = 60° -> Tithi = 60/12 = 5th Tithi (Shukla Panchami)
      const panchang = calculatePanchang(utcDate, 30.0, 90.0, 23.1765, 75.7885);

      expect(panchang.tithi.number).toBe(6); // 60° exact is boundary of 5th/6th (Shashthi)
      expect(panchang.tithi.paksha).toBe('Shukla');
      expect(panchang.vara.name).toContain('Wednesday');
      expect(panchang.sunTimes.sunrise).toBeDefined();
      expect(panchang.sunTimes.sunset).toBeDefined();
    });
  });

  describe('Muhurta Windows', () => {
    it('should compute Rahu Kaal, Gulika, Yamaganda, Abhijit, and Brahma Muhurta', () => {
      const utcDate = new Date('2024-05-15T06:30:00Z');
      const sunrise = '2024-05-15T05:30:00.000Z';
      const sunset = '2024-05-15T18:30:00.000Z';

      const muhurta = calculateMuhurtas('2024-05-15', utcDate, sunrise, sunset);

      expect(muhurta.rahuKaal.startTime).toBeDefined();
      expect(muhurta.rahuKaal.endTime).toBeDefined();
      expect(muhurta.abhijitMuhurta.type).toBe('auspicious');
      expect(muhurta.brahmaMuhurta.type).toBe('auspicious');
    });
  });
});
