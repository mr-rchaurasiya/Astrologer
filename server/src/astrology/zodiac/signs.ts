import { ZodiacSignName, PlanetName } from '../types/astrology';

export interface SignMetadata {
  number: number; // 1 to 12
  name: ZodiacSignName;
  sanskritName: string;
  lord: PlanetName;
  element: 'Fire' | 'Earth' | 'Air' | 'Water';
  quality: 'Movable' | 'Fixed' | 'Dual';
  gender: 'Male' | 'Female';
}

export const ZODIAC_SIGNS: SignMetadata[] = [
  { number: 1, name: 'Aries', sanskritName: 'Mesha', lord: 'Mars', element: 'Fire', quality: 'Movable', gender: 'Male' },
  { number: 2, name: 'Taurus', sanskritName: 'Vrishabha', lord: 'Venus', element: 'Earth', quality: 'Fixed', gender: 'Female' },
  { number: 3, name: 'Gemini', sanskritName: 'Mithuna', lord: 'Mercury', element: 'Air', quality: 'Dual', gender: 'Male' },
  { number: 4, name: 'Cancer', sanskritName: 'Karka', lord: 'Moon', element: 'Water', quality: 'Movable', gender: 'Female' },
  { number: 5, name: 'Leo', sanskritName: 'Simha', lord: 'Sun', element: 'Fire', quality: 'Fixed', gender: 'Male' },
  { number: 6, name: 'Virgo', sanskritName: 'Kanya', lord: 'Mercury', element: 'Earth', quality: 'Dual', gender: 'Female' },
  { number: 7, name: 'Libra', sanskritName: 'Tula', lord: 'Venus', element: 'Air', quality: 'Movable', gender: 'Male' },
  { number: 8, name: 'Scorpio', sanskritName: 'Vrishchika', lord: 'Mars', element: 'Water', quality: 'Fixed', gender: 'Female' },
  { number: 9, name: 'Sagittarius', sanskritName: 'Dhanu', lord: 'Jupiter', element: 'Fire', quality: 'Dual', gender: 'Male' },
  { number: 10, name: 'Capricorn', sanskritName: 'Makara', lord: 'Saturn', element: 'Earth', quality: 'Movable', gender: 'Female' },
  { number: 11, name: 'Aquarius', sanskritName: 'Kumbha', lord: 'Saturn', element: 'Air', quality: 'Fixed', gender: 'Male' },
  { number: 12, name: 'Pisces', sanskritName: 'Meena', lord: 'Jupiter', element: 'Water', quality: 'Dual', gender: 'Female' },
];

/**
 * Normalizes an angle in degrees into [0, 360)
 */
export const normalizeDegrees = (deg: number): number => {
  let normalized = deg % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
};

/**
 * Maps a sidereal longitude (0-360) to Sign and Degree within sign
 */
export const getSignFromLongitude = (longitude: number): { sign: ZodiacSignName; signNumber: number; signDegree: number; metadata: SignMetadata } => {
  const norm = normalizeDegrees(longitude);
  const signIndex = Math.floor(norm / 30); // 0 to 11
  const signNumber = signIndex + 1; // 1 to 12
  const signDegree = norm % 30;
  const metadata = ZODIAC_SIGNS[signIndex];

  return {
    sign: metadata.name,
    signNumber,
    signDegree,
    metadata,
  };
};

export const getSignByNumber = (signNumber: number): SignMetadata => {
  const index = ((signNumber - 1) % 12 + 12) % 12;
  return ZODIAC_SIGNS[index];
};
