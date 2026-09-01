import { describe, it, expect } from 'vitest';
import { AstrologyService } from '../../src/astrology/service/astrology.service';
import { calculateLahiriAyanamsa } from '../../src/astrology/ephemeris/ayanamsa';
import { dateToJulianDay } from '../../src/astrology/coordinates/time';
import { getSignFromLongitude } from '../../src/astrology/zodiac/signs';
import { getNakshatraFromLongitude } from '../../src/astrology/nakshatra/nakshatras';

describe('Astrology Engine Quality & Boundary Edge Cases', () => {
  describe('Temporal Boundaries (Midnight, Noon, Leap Year)', () => {
    it('calculates deterministically for midnight birth (00:00:00)', () => {
      const chart = AstrologyService.calculateBirthChart({
        dateOfBirth: '1995-01-01',
        timeOfBirth: '00:00:00',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata',
        timezoneOffset: 5.5,
      });

      expect(chart).toBeDefined();
      expect(chart.ascendant.signNumber).toBeGreaterThanOrEqual(1);
      expect(chart.ascendant.signNumber).toBeLessThanOrEqual(12);
      expect(chart.planets.length).toBe(9);
    });

    it('calculates deterministically for noon birth (12:00:00)', () => {
      const chart = AstrologyService.calculateBirthChart({
        dateOfBirth: '1995-01-01',
        timeOfBirth: '12:00:00',
        latitude: 28.6139,
        longitude: 77.2090,
        timezone: 'Asia/Kolkata',
        timezoneOffset: 5.5,
      });

      expect(chart).toBeDefined();
      expect(chart.planets.every((p) => p.longitude >= 0 && p.longitude < 360)).toBe(true);
    });

    it('handles leap year birth on February 29 seamlessly', () => {
      const chart2024 = AstrologyService.calculateBirthChart({
        dateOfBirth: '2024-02-29',
        timeOfBirth: '14:30:00',
        latitude: 19.0760,
        longitude: 72.8777,
        timezone: 'Asia/Kolkata',
        timezoneOffset: 5.5,
      });

      expect(chart2024.birthInput.dateOfBirth).toBe('2024-02-29');
      expect(chart2024.dashas.mahadashas.length).toBe(9);
    });
  });

  describe('Geographical Coordinate Boundaries', () => {
    it('calculates for Equator (0° Latitude)', () => {
      const chart = AstrologyService.calculateBirthChart({
        dateOfBirth: '2000-06-15',
        timeOfBirth: '06:00:00',
        latitude: 0.0,
        longitude: 0.0,
        timezone: 'UTC',
        timezoneOffset: 0.0,
      });

      expect(chart.ascendant.signDegree).toBeGreaterThanOrEqual(0);
      expect(chart.ascendant.signDegree).toBeLessThan(30);
      expect(chart.houses.length).toBe(12);
    });

    it('calculates for extreme Northern latitude (+64.1466° Reykjavik)', () => {
      const chart = AstrologyService.calculateBirthChart({
        dateOfBirth: '2000-06-21',
        timeOfBirth: '12:00:00',
        latitude: 64.1466,
        longitude: -21.9426,
        timezone: 'Atlantic/Reykjavik',
        timezoneOffset: 0.0,
      });

      expect(chart.ascendant).toBeDefined();
      expect(chart.houses.length).toBe(12);
    });

    it('calculates for extreme Southern latitude (-54.8019° Ushuaia)', () => {
      const chart = AstrologyService.calculateBirthChart({
        dateOfBirth: '2000-12-21',
        timeOfBirth: '12:00:00',
        latitude: -54.8019,
        longitude: -68.3030,
        timezone: 'America/Argentina/Ushuaia',
        timezoneOffset: -3.0,
      });

      expect(chart.ascendant).toBeDefined();
      expect(chart.houses.length).toBe(12);
    });

    it('handles International Date Line boundary longitudes (-180° and +180°)', () => {
      const chartWest = AstrologyService.calculateBirthChart({
        dateOfBirth: '2005-03-21',
        timeOfBirth: '10:00:00',
        latitude: 20.0,
        longitude: -179.9999,
        timezone: 'Pacific/Pago_Pago',
        timezoneOffset: -11.0,
      });

      const chartEast = AstrologyService.calculateBirthChart({
        dateOfBirth: '2005-03-21',
        timeOfBirth: '10:00:00',
        latitude: 20.0,
        longitude: 179.9999,
        timezone: 'Pacific/Auckland',
        timezoneOffset: 12.0,
      });

      expect(chartWest).toBeDefined();
      expect(chartEast).toBeDefined();
      expect(chartWest.houses.length).toBe(12);
      expect(chartEast.houses.length).toBe(12);
    });
  });

  describe('Zodiac & Nakshatra Angular Boundaries', () => {
    it('maps 0° longitude correctly to 0° Aries', () => {
      const signInfo = getSignFromLongitude(0.0);
      expect(signInfo.sign).toBe('Aries');
      expect(signInfo.signNumber).toBe(1);
      expect(signInfo.signDegree).toBe(0);
    });

    it('maps 29.9999° correctly to 29.9999° Aries', () => {
      const signInfo = getSignFromLongitude(29.9999);
      expect(signInfo.sign).toBe('Aries');
      expect(signInfo.signNumber).toBe(1);
    });

    it('maps 30.0001° correctly to 0.0001° Taurus', () => {
      const signInfo = getSignFromLongitude(30.0001);
      expect(signInfo.sign).toBe('Taurus');
      expect(signInfo.signNumber).toBe(2);
      expect(signInfo.signDegree).toBeCloseTo(0.0001, 3);
    });

    it('maps 359.9999° correctly to 29.9999° Pisces', () => {
      const signInfo = getSignFromLongitude(359.9999);
      expect(signInfo.sign).toBe('Pisces');
      expect(signInfo.signNumber).toBe(12);
    });

    it('calculates exact Nakshatra and Pada transitions (Ashwini to Bharani at 13°20\')', () => {
      const ashwiniPada4 = getNakshatraFromLongitude(13.33); // just below 13°20' (13.3333°)
      expect(ashwiniPada4.name).toBe('Ashwini');
      expect(ashwiniPada4.pada).toBe(4);

      const bharaniPada1 = getNakshatraFromLongitude(13.34); // just above 13°20'
      expect(bharaniPada1.name).toBe('Bharani');
      expect(bharaniPada1.pada).toBe(1);
    });
  });

  describe('Lahiri Ayanamsa Continuity', () => {
    it('produces monotonically increasing Lahiri Ayanamsa values over chronological time', () => {
      const jd1950 = dateToJulianDay(new Date('1950-01-01T00:00:00Z'));
      const jd2000 = dateToJulianDay(new Date('2000-01-01T00:00:00Z'));
      const jd2050 = dateToJulianDay(new Date('2050-01-01T00:00:00Z'));

      const ayanamsa1950 = calculateLahiriAyanamsa(jd1950);
      const ayanamsa2000 = calculateLahiriAyanamsa(jd2000);
      const ayanamsa2050 = calculateLahiriAyanamsa(jd2050);

      expect(ayanamsa2000).toBeGreaterThan(ayanamsa1950);
      expect(ayanamsa2050).toBeGreaterThan(ayanamsa2000);
      // In year 2000, Lahiri ayanamsa is approx ~23.85°
      expect(ayanamsa2000).toBeGreaterThan(23.8);
      expect(ayanamsa2000).toBeLessThan(23.9);
    });
  });
});
