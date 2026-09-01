import { normalizeDegrees } from '../zodiac/signs';

/**
 * Calculates high-precision Chitra Paksha / Lahiri Ayanamsa for a given Julian Day.
 * Reference: Standard Indian Ephemeris formula & IAU precession model
 */
export const calculateLahiriAyanamsa = (julianDay: number): number => {
  // T: Julian centuries from J2000.0 (JD 2451545.0)
  const T = (julianDay - 2451545.0) / 36525.0;

  // Base Lahiri value at J2000.0: 23° 51' 25.53" = 23.85709222°
  const baseAyanamsa = 23.85709222;

  // Precession terms (IAU precession rate: ~50.290966" / year = 1.3969713° / century)
  const precession = 1.39697128 * T + 0.0003086 * (T * T);

  // Mean Lahiri Ayanamsa
  const ayanamsa = baseAyanamsa + precession;

  return ayanamsa;
};

/**
 * Formats decimal degrees into Deg° Min' Sec" representation
 */
export const formatDegreesDMS = (deg: number): string => {
  const d = Math.floor(deg);
  const mFloat = (deg - d) * 60;
  const m = Math.floor(mFloat);
  const s = Math.round((mFloat - m) * 60 * 100) / 100;
  return `${d}° ${m}' ${s.toFixed(2)}"`;
};

/**
 * Transforms a tropical longitude to sidereal longitude using Lahiri Ayanamsa
 */
export const tropicalToSidereal = (tropicalLongitude: number, ayanamsa: number): number => {
  return normalizeDegrees(tropicalLongitude - ayanamsa);
};
