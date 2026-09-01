import { PlanetName, DashaPeriod, AshtottariDashaTree } from '../types/astrology';
import { getNakshatraFromLongitude, NAKSHATRA_SPAN } from '../nakshatra/nakshatras';
import { addYearsToDate } from './vimshottari.dasha';

export interface AshtottariRule {
  lord: PlanetName;
  years: number;
}

export const ASHTOTTARI_LORDS: AshtottariRule[] = [
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 15 },
  { lord: 'Mars', years: 8 },
  { lord: 'Mercury', years: 17 },
  { lord: 'Saturn', years: 10 },
  { lord: 'Jupiter', years: 19 },
  { lord: 'Rahu', years: 12 },
  { lord: 'Venus', years: 21 },
];

export const TOTAL_ASHTOTTARI_YEARS = 108;

/**
 * Ashtottari Dasha mapping based on Moon's nakshatra (Ardra-based classical order)
 */
export const getAshtottariLordForNakshatra = (nakshatraNum: number): { lordIndex: number; lord: PlanetName } => {
  // Mapping of 27 nakshatras (1: Ashwini .. 27: Revati) to 8 Ashtottari lords
  if ([3, 4, 5, 6].includes(nakshatraNum)) return { lordIndex: 0, lord: 'Sun' }; // Krittika, Rohini, Mrigashira, Ardra
  if ([7, 8, 9].includes(nakshatraNum)) return { lordIndex: 1, lord: 'Moon' };    // Punarvasu, Pushya, Ashlesha
  if ([10, 11, 12, 13].includes(nakshatraNum)) return { lordIndex: 2, lord: 'Mars' }; // Magha, P.Phalguni, U.Phalguni, Hasta
  if ([14, 15, 16].includes(nakshatraNum)) return { lordIndex: 3, lord: 'Mercury' }; // Chitra, Swati, Vishakha
  if ([17, 18, 19, 20].includes(nakshatraNum)) return { lordIndex: 4, lord: 'Saturn' }; // Anuradha, Jyeshtha, Mula, P.Ashadha
  if ([21, 22].includes(nakshatraNum)) return { lordIndex: 5, lord: 'Jupiter' }; // U.Ashadha, Shravana
  if ([23, 24, 25, 26].includes(nakshatraNum)) return { lordIndex: 6, lord: 'Rahu' }; // Dhanishta, Shatabhisha, P.Bhadra, U.Bhadra
  return { lordIndex: 7, lord: 'Venus' }; // Revati, Ashwini, Bharani
};

/**
 * Calculates Ashtottari Dasha (108-year cycle)
 */
export const calculateAshtottariDasha = (
  moonLongitude: number,
  birthUtcDate: Date
): AshtottariDashaTree => {
  const nakshatraInfo = getNakshatraFromLongitude(moonLongitude);
  const { lordIndex, lord } = getAshtottariLordForNakshatra(nakshatraInfo.number);
  const startingRule = ASHTOTTARI_LORDS[lordIndex];

  // Fraction of nakshatra remaining at birth
  const elapsedFraction = nakshatraInfo.degreeInNakshatra / NAKSHATRA_SPAN;
  const remainingFraction = Math.max(0, Math.min(1.0, 1.0 - elapsedFraction));
  const balanceAtBirthYears = remainingFraction * startingRule.years;

  const mahadashas: DashaPeriod[] = [];
  let currentPeriodStart = new Date(birthUtcDate.getTime());

  for (let i = 0; i < 8; i++) {
    const idx = (lordIndex + i) % 8;
    const rule = ASHTOTTARI_LORDS[idx];

    const duration = i === 0 ? balanceAtBirthYears : rule.years;
    const endDate = addYearsToDate(currentPeriodStart, duration);

    // Antardashas
    const subPeriods: DashaPeriod[] = [];
    let currentSubStart = new Date(currentPeriodStart.getTime());

    for (let j = 0; j < 8; j++) {
      const subIdx = (idx + j) % 8;
      const subRule = ASHTOTTARI_LORDS[subIdx];

      const fullSubDuration = (rule.years * subRule.years) / TOTAL_ASHTOTTARI_YEARS;
      const subDuration = (duration / rule.years) * fullSubDuration;
      const subEndDate = addYearsToDate(currentSubStart, subDuration);

      subPeriods.push({
        lord: subRule.lord,
        startDate: currentSubStart.toISOString(),
        endDate: subEndDate.toISOString(),
        durationYears: subDuration,
      });

      currentSubStart = endDate < subEndDate ? endDate : subEndDate;
    }

    mahadashas.push({
      lord: rule.lord,
      startDate: currentPeriodStart.toISOString(),
      endDate: endDate.toISOString(),
      durationYears: duration,
      subPeriods,
    });

    currentPeriodStart = endDate;
  }

  return {
    startingLord: lord,
    balanceAtBirthYears,
    mahadashas,
  };
};
