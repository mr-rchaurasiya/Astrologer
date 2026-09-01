import * as Astronomy from 'astronomy-engine';
import { PanchangInfo, PlanetName } from '../types/astrology';
import { normalizeDegrees } from '../zodiac/signs';
import { getNakshatraFromLongitude, NAKSHATRA_SPAN } from '../nakshatra/nakshatras';

export const TITHI_NAMES: string[] = [
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Purnima', // 15
  'Pratipada',
  'Dwitiya',
  'Tritiya',
  'Chaturthi',
  'Panchami',
  'Shashthi',
  'Saptami',
  'Ashtami',
  'Navami',
  'Dashami',
  'Ekadashi',
  'Dwadashi',
  'Trayodashi',
  'Chaturdashi',
  'Amavasya', // 30
];

export const VARA_NAMES: { name: string; rulingPlanet: PlanetName }[] = [
  { name: 'Ravivara (Sunday)', rulingPlanet: 'Sun' },
  { name: 'Somavara (Monday)', rulingPlanet: 'Moon' },
  { name: 'Mangalavara (Tuesday)', rulingPlanet: 'Mars' },
  { name: 'Budhavara (Wednesday)', rulingPlanet: 'Mercury' },
  { name: 'Guruvara (Thursday)', rulingPlanet: 'Jupiter' },
  { name: 'Shukravara (Friday)', rulingPlanet: 'Venus' },
  { name: 'Shanivara (Saturday)', rulingPlanet: 'Saturn' },
];

export const YOGA_NAMES: string[] = [
  'Vishkambha',
  'Priti',
  'Ayushman',
  'Saubhagya',
  'Shobhana',
  'Atiganda',
  'Sukarma',
  'Dhriti',
  'Shula',
  'Ganda',
  'Vriddhi',
  'Dhruva',
  'Vyaghata',
  'Harshana',
  'Vajra',
  'Siddhi',
  'Vyatipata',
  'Variyan',
  'Parigha',
  'Shiva',
  'Siddha',
  'Sadhya',
  'Shubha',
  'Shukla',
  'Brahma',
  'Indra',
  'Vaidhriti',
];

const REPEATING_KARANAS = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti'];

/**
 * Calculates the Karana name and type for a given Karana index (1 to 60)
 */
export const getKaranaInfo = (karanaNumber: number): { name: string; type: 'movable' | 'fixed' } => {
  if (karanaNumber === 1) return { name: 'Kintughna', type: 'fixed' };
  if (karanaNumber >= 2 && karanaNumber <= 57) {
    const idx = (karanaNumber - 2) % 7;
    return { name: REPEATING_KARANAS[idx], type: 'movable' };
  }
  if (karanaNumber === 58) return { name: 'Shakuni', type: 'fixed' };
  if (karanaNumber === 59) return { name: 'Chatushpada', type: 'fixed' };
  return { name: 'Naga', type: 'fixed' };
};

/**
 * Calculates Sunrise, Sunset, and Solar Noon for geographic observer on a given Date
 */
export const calculateSunTimes = (
  utcDate: Date,
  latitude: number,
  longitude: number
): { sunrise: string; sunset: string; solarNoon: string; dayDurationMinutes: number } => {
  const observer = new Astronomy.Observer(latitude, longitude, 0);

  // Midnight of the UTC date as starting search boundary
  const dayStart = new Date(Date.UTC(utcDate.getUTCFullYear(), utcDate.getUTCMonth(), utcDate.getUTCDate(), 0, 0, 0));
  const astroStart = new Astronomy.AstroTime(dayStart);

  const riseTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, +1, astroStart, 1.0);
  const setTime = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, astroStart, 1.0);

  let sunriseDate = riseTime ? riseTime.date : new Date(dayStart.getTime() + 6 * 3600 * 1000);
  let sunsetDate = setTime ? setTime.date : new Date(dayStart.getTime() + 18 * 3600 * 1000);

  // Ensure sunset is after sunrise
  if (sunsetDate < sunriseDate) {
    const nextSet = Astronomy.SearchRiseSet(Astronomy.Body.Sun, observer, -1, new Astronomy.AstroTime(sunriseDate), 1.0);
    if (nextSet) sunsetDate = nextSet.date;
  }

  const durationMs = sunsetDate.getTime() - sunriseDate.getTime();
  const dayDurationMinutes = Math.round(durationMs / 60000);
  const solarNoonDate = new Date(sunriseDate.getTime() + durationMs / 2);

  return {
    sunrise: sunriseDate.toISOString(),
    sunset: sunsetDate.toISOString(),
    solarNoon: solarNoonDate.toISOString(),
    dayDurationMinutes,
  };
};

/**
 * Calculates the complete 5 Panchang attributes (Tithi, Vara, Nakshatra, Yoga, Karana) + Sun Times
 */
export const calculatePanchang = (
  utcDate: Date,
  sunLongitude: number,
  moonLongitude: number,
  latitude: number,
  longitude: number
): PanchangInfo => {
  // 1. Tithi: Angular distance between Moon and Sun (0 to 360) / 12 deg
  const diffDeg = normalizeDegrees(moonLongitude - sunLongitude);
  const tithiIndex = Math.floor(diffDeg / 12.0); // 0 to 29
  const tithiNumber = tithiIndex + 1; // 1 to 30
  const tithiName = TITHI_NAMES[tithiIndex];
  const paksha: 'Shukla' | 'Krishna' = tithiNumber <= 15 ? 'Shukla' : 'Krishna';
  const tithiPercentage = ((diffDeg % 12.0) / 12.0) * 100;

  // 2. Vara (Weekday)
  const dayOfWeek = utcDate.getUTCDay(); // 0 (Sun) to 6 (Sat)
  const varaInfo = VARA_NAMES[dayOfWeek];

  // 3. Moon Nakshatra
  const moonNak = getNakshatraFromLongitude(moonLongitude);

  // 4. Yoga: (Sun Longitude + Moon Longitude) / 13°20'
  const yogaSum = normalizeDegrees(sunLongitude + moonLongitude);
  const yogaIndex = Math.floor(yogaSum / NAKSHATRA_SPAN);
  const safeYogaIndex = Math.min(Math.max(yogaIndex, 0), 26);
  const yogaName = YOGA_NAMES[safeYogaIndex];

  // 5. Karana: Half-tithi = 6 degrees
  const karanaIndex = Math.floor(diffDeg / 6.0); // 0 to 59
  const karanaNumber = karanaIndex + 1; // 1 to 60
  const karanaInfo = getKaranaInfo(karanaNumber);

  // Sun Times
  const sunTimes = calculateSunTimes(utcDate, latitude, longitude);

  return {
    date: utcDate.toISOString().split('T')[0],
    tithi: {
      number: tithiNumber,
      name: tithiName,
      paksha,
      percentage: tithiPercentage,
    },
    vara: {
      number: dayOfWeek,
      name: varaInfo.name,
      rulingPlanet: varaInfo.rulingPlanet,
    },
    nakshatra: {
      number: moonNak.number,
      name: moonNak.name,
      lord: moonNak.lord,
      degreeInNakshatra: moonNak.degreeInNakshatra,
    },
    yoga: {
      number: safeYogaIndex + 1,
      name: yogaName,
    },
    karana: {
      number: karanaNumber,
      name: karanaInfo.name,
      type: karanaInfo.type,
    },
    sunTimes,
  };
};
