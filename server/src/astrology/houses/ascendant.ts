import * as Astronomy from 'astronomy-engine';
import { AscendantInfo } from '../types/astrology';
import { normalizeDegrees, getSignFromLongitude } from '../zodiac/signs';
import { getNakshatraFromLongitude } from '../nakshatra/nakshatras';

/**
 * Calculates the exact Ascendant (Lagna) for a given UTC Date, Geographic Latitude & Longitude, and Lahiri Ayanamsa
 */
export const calculateAscendant = (
  utcDate: Date,
  latitude: number, // degrees (-90 to +90)
  longitude: number, // degrees (-180 to +180)
  ayanamsa: number
): AscendantInfo => {
  const astroTime = new Astronomy.AstroTime(utcDate);

  // Greenwich Mean Sidereal Time in hours (0 to 24)
  const gmstHours = Astronomy.SiderealTime(astroTime);
  const gmstDeg = gmstHours * 15.0; // convert to degrees

  // Local Sidereal Time (RAMC) in degrees
  const lstDeg = normalizeDegrees(gmstDeg + longitude);
  const ramcRad = (lstDeg * Math.PI) / 180.0;

  // True Obliquity of the Ecliptic
  const tilt = Astronomy.e_tilt(astroTime);
  const epsRad = (tilt.tobl * Math.PI) / 180.0;

  // Geographic Latitude in radians
  const latRad = (latitude * Math.PI) / 180.0;

  // Ascendant formula in celestial mechanics:
  // tan(Asc) = -cos(RAMC) / (sin(RAMC) * cos(eps) + tan(lat) * sin(eps))
  const y = -Math.cos(ramcRad);
  const x = Math.sin(ramcRad) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad);

  let ascendantTropDeg = (Math.atan2(y, x) * 180.0) / Math.PI;
  ascendantTropDeg = normalizeDegrees(ascendantTropDeg);

  // Apply Lahiri Ayanamsa to derive Sidereal Ascendant
  const siderealAscDeg = normalizeDegrees(ascendantTropDeg - ayanamsa);

  const signInfo = getSignFromLongitude(siderealAscDeg);
  const nakshatraInfo = getNakshatraFromLongitude(siderealAscDeg);

  return {
    longitude: siderealAscDeg,
    tropicalLongitude: ascendantTropDeg,
    sign: signInfo.sign,
    signNumber: signInfo.signNumber,
    signDegree: signInfo.signDegree,
    nakshatra: nakshatraInfo.name,
    nakshatraNumber: nakshatraInfo.number,
    nakshatraLord: nakshatraInfo.lord,
    pada: nakshatraInfo.pada,
  };
};
