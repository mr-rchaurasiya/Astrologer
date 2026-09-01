import * as Astronomy from 'astronomy-engine';
import { PlanetName, PlanetPosition } from '../types/astrology';
import { normalizeDegrees, getSignFromLongitude } from '../zodiac/signs';
import { getNakshatraFromLongitude } from '../nakshatra/nakshatras';
import { calculateDignity } from '../dignity/dignity';
import { getHouseFromAscendant } from '../houses/houses';

const BODY_MAPPINGS: { name: PlanetName; body?: Astronomy.Body }[] = [
  { name: 'Sun', body: Astronomy.Body.Sun },
  { name: 'Moon', body: Astronomy.Body.Moon },
  { name: 'Mars', body: Astronomy.Body.Mars },
  { name: 'Mercury', body: Astronomy.Body.Mercury },
  { name: 'Jupiter', body: Astronomy.Body.Jupiter },
  { name: 'Venus', body: Astronomy.Body.Venus },
  { name: 'Saturn', body: Astronomy.Body.Saturn },
  { name: 'Rahu' },
  { name: 'Ketu' },
];

/**
 * Combustion threshold angles (degrees from Sun)
 */
const COMBUSTION_THRESHOLDS: Record<string, number> = {
  Moon: 12.0,
  Mars: 17.0,
  Mercury: 14.0,
  Jupiter: 11.0,
  Venus: 10.0,
  Saturn: 15.0,
};

/**
 * Calculates Mean Lunar Ascending Node (Rahu) tropical longitude using standard IAU polynomial
 */
const calculateMeanRahuTropical = (julianDay: number): number => {
  const T = (julianDay - 2451545.0) / 36525.0;
  // IAU Mean Longitude of the Ascending Node (Omega)
  const omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + (T * T * T) / 450000.0;
  return normalizeDegrees(omega);
};

/**
 * Calculates raw tropical longitude and latitude for a celestial body at a given UTC Date
 */
const getRawTropicalCoordinates = (
  name: PlanetName,
  body: Astronomy.Body | undefined,
  astroTime: Astronomy.AstroTime,
  julianDay: number
): { tropicalLon: number; lat: number } => {
  if (name === 'Rahu') {
    const tropicalLon = calculateMeanRahuTropical(julianDay);
    return { tropicalLon, lat: 0 };
  }

  if (name === 'Ketu') {
    const rahuLon = calculateMeanRahuTropical(julianDay);
    const tropicalLon = normalizeDegrees(rahuLon + 180.0);
    return { tropicalLon, lat: 0 };
  }

  if (body) {
    const geoVec = Astronomy.GeoVector(body, astroTime, true);
    const ecl = Astronomy.Ecliptic(geoVec);
    return { tropicalLon: normalizeDegrees(ecl.elon), lat: ecl.elat };
  }

  return { tropicalLon: 0, lat: 0 };
};

/**
 * Calculates full planetary positions, speeds, retrograde, combustion, and dignities
 */
export const calculatePlanetaryPositions = (
  utcDate: Date,
  julianDay: number,
  ayanamsa: number,
  ascendantSignNumber: number
): PlanetPosition[] => {
  const astroTime = new Astronomy.AstroTime(utcDate);

  // Time +1 hour for differential speed calculation
  const deltaHours = 1.0;
  const datePlus1h = new Date(utcDate.getTime() + deltaHours * 3600 * 1000);
  const astroTimePlus1h = new Astronomy.AstroTime(datePlus1h);
  const jdPlus1h = julianDay + deltaHours / 24.0;

  // First calculate Sun position for combustion detection
  const sunRaw = getRawTropicalCoordinates('Sun', Astronomy.Body.Sun, astroTime, julianDay);
  const sunSidereal = normalizeDegrees(sunRaw.tropicalLon - ayanamsa);

  const results: PlanetPosition[] = [];

  for (const item of BODY_MAPPINGS) {
    const raw = getRawTropicalCoordinates(item.name, item.body, astroTime, julianDay);
    const rawPlus = getRawTropicalCoordinates(item.name, item.body, astroTimePlus1h, jdPlus1h);

    // Speed in degrees per day
    let deltaLon = rawPlus.tropicalLon - raw.tropicalLon;
    if (deltaLon > 180) deltaLon -= 360;
    if (deltaLon < -180) deltaLon += 360;
    const speedDegPerDay = (deltaLon / deltaHours) * 24.0;

    // Retrograde determination
    let retrograde = false;
    if (item.name === 'Rahu' || item.name === 'Ketu') {
      retrograde = true; // Mean nodes are perpetually retrograde
    } else if (item.name === 'Sun' || item.name === 'Moon') {
      retrograde = false; // Luminaries are never retrograde
    } else {
      retrograde = speedDegPerDay < 0;
    }

    const siderealLon = normalizeDegrees(raw.tropicalLon - ayanamsa);
    const signInfo = getSignFromLongitude(siderealLon);
    const nakshatraInfo = getNakshatraFromLongitude(siderealLon);
    const house = getHouseFromAscendant(signInfo.signNumber, ascendantSignNumber);

    // Combustion check
    let combust = false;
    let distanceFromSun: number | undefined;

    if (item.name !== 'Sun' && item.name !== 'Rahu' && item.name !== 'Ketu') {
      let diff = Math.abs(siderealLon - sunSidereal);
      if (diff > 180) diff = 360 - diff;
      distanceFromSun = diff;

      const threshold = COMBUSTION_THRESHOLDS[item.name];
      if (threshold && diff <= threshold) {
        combust = true;
      }
    }

    // Dignity calculation
    const dignity = calculateDignity(item.name, signInfo.sign, signInfo.signDegree, signInfo.metadata.lord);

    results.push({
      name: item.name,
      longitude: siderealLon,
      tropicalLongitude: raw.tropicalLon,
      latitude: raw.lat,
      speed: speedDegPerDay,
      retrograde,
      sign: signInfo.sign,
      signNumber: signInfo.signNumber,
      signDegree: signInfo.signDegree,
      house,
      nakshatra: nakshatraInfo.name,
      nakshatraNumber: nakshatraInfo.number,
      nakshatraLord: nakshatraInfo.lord,
      pada: nakshatraInfo.pada,
      combust,
      distanceFromSun,
      dignity,
    });
  }

  return results;
};
