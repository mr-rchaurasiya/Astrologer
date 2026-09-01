import { PlanetPosition } from '../types/astrology';
import { dateToJulianDay } from '../coordinates/time';
import { calculateLahiriAyanamsa } from '../ephemeris/ayanamsa';
import { calculateAscendant } from '../houses/ascendant';
import { calculatePlanetaryPositions } from '../ephemeris/planetaryPositions';

export interface TransitCalculationResult {
  timestamp: string;
  julianDay: number;
  ayanamsa: number;
  ascendant: ReturnType<typeof calculateAscendant>;
  planets: PlanetPosition[];
}

/**
 * Calculates current or target sidereal planetary transits (Gochar) for a given timestamp and location
 */
export const calculateTransits = (
  utcDate: Date = new Date(),
  latitude = 23.1765, // default to reference coords (e.g. Ujjain)
  longitude = 75.7885
): TransitCalculationResult => {
  const julianDay = dateToJulianDay(utcDate);
  const ayanamsa = calculateLahiriAyanamsa(julianDay);

  const ascendant = calculateAscendant(utcDate, latitude, longitude, ayanamsa);
  const planets = calculatePlanetaryPositions(utcDate, julianDay, ayanamsa, ascendant.signNumber);

  return {
    timestamp: utcDate.toISOString(),
    julianDay,
    ayanamsa,
    ascendant,
    planets,
  };
};
