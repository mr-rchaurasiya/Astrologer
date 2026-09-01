import { PlanetName } from '../types/astrology';
import { normalizeDegrees } from '../zodiac/signs';

export interface NakshatraMetadata {
  number: number; // 1 to 27
  name: string;
  lord: PlanetName;
  startDegree: number; // in 0-360 zodiac
  endDegree: number;
  deity: string;
}

export const NAKSHATRA_SPAN = 360 / 27; // 13.333333333333334 degrees = 13° 20'
export const PADA_SPAN = NAKSHATRA_SPAN / 4; // 3.3333333333333335 degrees = 3° 20'

export const NAKSHATRAS: NakshatraMetadata[] = [
  { number: 1, name: 'Ashwini', lord: 'Ketu', startDegree: 0, endDegree: 13.333333, deity: 'Ashwini Kumaras' },
  { number: 2, name: 'Bharani', lord: 'Venus', startDegree: 13.333333, endDegree: 26.666667, deity: 'Yama' },
  { number: 3, name: 'Krittika', lord: 'Sun', startDegree: 26.666667, endDegree: 40.0, deity: 'Agni' },
  { number: 4, name: 'Rohini', lord: 'Moon', startDegree: 40.0, endDegree: 53.333333, deity: 'Brahma' },
  { number: 5, name: 'Mrigashira', lord: 'Mars', startDegree: 53.333333, endDegree: 66.666667, deity: 'Soma' },
  { number: 6, name: 'Ardra', lord: 'Rahu', startDegree: 66.666667, endDegree: 80.0, deity: 'Rudra' },
  { number: 7, name: 'Punarvasu', lord: 'Jupiter', startDegree: 80.0, endDegree: 93.333333, deity: 'Aditi' },
  { number: 8, name: 'Pushya', lord: 'Saturn', startDegree: 93.333333, endDegree: 106.666667, deity: 'Brihaspati' },
  { number: 9, name: 'Ashlesha', lord: 'Mercury', startDegree: 106.666667, endDegree: 120.0, deity: 'Nagas' },
  { number: 10, name: 'Magha', lord: 'Ketu', startDegree: 120.0, endDegree: 133.333333, deity: 'Pitris' },
  { number: 11, name: 'Purva Phalguni', lord: 'Venus', startDegree: 133.333333, endDegree: 146.666667, deity: 'Bhaga' },
  { number: 12, name: 'Uttara Phalguni', lord: 'Sun', startDegree: 146.666667, endDegree: 160.0, deity: 'Aryaman' },
  { number: 13, name: 'Hasta', lord: 'Moon', startDegree: 160.0, endDegree: 173.333333, deity: 'Savitr' },
  { number: 14, name: 'Chitra', lord: 'Mars', startDegree: 173.333333, endDegree: 186.666667, deity: 'Tvashtar' },
  { number: 15, name: 'Swati', lord: 'Rahu', startDegree: 186.666667, endDegree: 200.0, deity: 'Vayu' },
  { number: 16, name: 'Vishakha', lord: 'Jupiter', startDegree: 200.0, endDegree: 213.333333, deity: 'Indra-Agni' },
  { number: 17, name: 'Anuradha', lord: 'Saturn', startDegree: 213.333333, endDegree: 226.666667, deity: 'Mitra' },
  { number: 18, name: 'Jyeshtha', lord: 'Mercury', startDegree: 226.666667, endDegree: 240.0, deity: 'Indra' },
  { number: 19, name: 'Mula', lord: 'Ketu', startDegree: 240.0, endDegree: 253.333333, deity: 'Nirriti' },
  { number: 20, name: 'Purva Ashadha', lord: 'Venus', startDegree: 253.333333, endDegree: 266.666667, deity: 'Apas' },
  { number: 21, name: 'Uttara Ashadha', lord: 'Sun', startDegree: 266.666667, endDegree: 280.0, deity: 'Vishwadevas' },
  { number: 22, name: 'Shravana', lord: 'Moon', startDegree: 280.0, endDegree: 293.333333, deity: 'Vishnu' },
  { number: 23, name: 'Dhanishta', lord: 'Mars', startDegree: 293.333333, endDegree: 306.666667, deity: 'Ashta Vasus' },
  { number: 24, name: 'Shatabhisha', lord: 'Rahu', startDegree: 306.666667, endDegree: 320.0, deity: 'Varuna' },
  { number: 25, name: 'Purva Bhadrapada', lord: 'Jupiter', startDegree: 320.0, endDegree: 333.333333, deity: 'Aja Ekapada' },
  { number: 26, name: 'Uttara Bhadrapada', lord: 'Saturn', startDegree: 333.333333, endDegree: 346.666667, deity: 'Ahirbudhnya' },
  { number: 27, name: 'Revati', lord: 'Mercury', startDegree: 346.666667, endDegree: 360.0, deity: 'Pushan' },
];

export interface NakshatraPositionResult {
  number: number; // 1-27
  name: string;
  lord: PlanetName;
  pada: number; // 1-4
  degreeInNakshatra: number;
  percentageInNakshatra: number;
  metadata: NakshatraMetadata;
}

export const getNakshatraFromLongitude = (longitude: number): NakshatraPositionResult => {
  const norm = normalizeDegrees(longitude);
  const nakshatraIndex = Math.floor(norm / NAKSHATRA_SPAN);
  const safeIndex = Math.min(Math.max(nakshatraIndex, 0), 26);
  const metadata = NAKSHATRAS[safeIndex];

  const degreeInNakshatra = norm - metadata.startDegree;
  const pada = Math.min(Math.floor(degreeInNakshatra / PADA_SPAN) + 1, 4);
  const percentageInNakshatra = (degreeInNakshatra / NAKSHATRA_SPAN) * 100;

  return {
    number: metadata.number,
    name: metadata.name,
    lord: metadata.lord,
    pada,
    degreeInNakshatra,
    percentageInNakshatra,
    metadata,
  };
};
