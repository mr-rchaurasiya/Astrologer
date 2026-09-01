import { DashaPeriod, YoginiDashaTree } from '../types/astrology';
import { getNakshatraFromLongitude, NAKSHATRA_SPAN } from '../nakshatra/nakshatras';
import { addYearsToDate } from './vimshottari.dasha';

export interface YoginiRule {
  name: string;
  rulingPlanet: string;
  years: number;
}

export const YOGINI_LORDS: YoginiRule[] = [
  { name: 'Mangala', rulingPlanet: 'Moon', years: 1 },
  { name: 'Pingala', rulingPlanet: 'Sun', years: 2 },
  { name: 'Dhanya', rulingPlanet: 'Jupiter', years: 3 },
  { name: 'Bhramari', rulingPlanet: 'Mars', years: 4 },
  { name: 'Bhadrika', rulingPlanet: 'Mercury', years: 5 },
  { name: 'Ulka', rulingPlanet: 'Saturn', years: 6 },
  { name: 'Siddha', rulingPlanet: 'Venus', years: 7 },
  { name: 'Sankata', rulingPlanet: 'Rahu', years: 8 },
];

export const TOTAL_YOGINI_YEARS = 36;

/**
 * Calculates Yogini Dasha (36-year repeating planetary cycle)
 * Formula: ((Nakshatra Number + 3) % 8) || 8 -> Yogini Index (1 to 8)
 */
export const calculateYoginiDasha = (
  moonLongitude: number,
  birthUtcDate: Date
): YoginiDashaTree => {
  const nakshatraInfo = getNakshatraFromLongitude(moonLongitude);
  const nNum = nakshatraInfo.number; // 1 to 27

  // Starting Yogini Index (0 to 7)
  const startingIdx = ((nNum + 3 - 1) % 8);
  const startingYogini = YOGINI_LORDS[startingIdx];

  // Remaining balance at birth
  const elapsedFraction = nakshatraInfo.degreeInNakshatra / NAKSHATRA_SPAN;
  const remainingFraction = Math.max(0, Math.min(1.0, 1.0 - elapsedFraction));
  const balanceAtBirthYears = remainingFraction * startingYogini.years;

  const mahadashas: DashaPeriod[] = [];
  let currentPeriodStart = new Date(birthUtcDate.getTime());

  // Generate 2 full cycles (72 years)
  const totalPeriodsToGenerate = 16;

  for (let i = 0; i < totalPeriodsToGenerate; i++) {
    const idx = (startingIdx + i) % 8;
    const yogini = YOGINI_LORDS[idx];

    const duration = i === 0 ? balanceAtBirthYears : yogini.years;
    const endDate = addYearsToDate(currentPeriodStart, duration);

    // Calculate Yogini Antardashas
    const subPeriods: DashaPeriod[] = [];
    let currentSubStart = new Date(currentPeriodStart.getTime());

    for (let j = 0; j < 8; j++) {
      const subIdx = (idx + j) % 8;
      const subYogini = YOGINI_LORDS[subIdx];

      const fullSubDuration = (yogini.years * subYogini.years) / TOTAL_YOGINI_YEARS;
      const subDuration = (duration / yogini.years) * fullSubDuration;
      const subEndDate = addYearsToDate(currentSubStart, subDuration);

      subPeriods.push({
        lord: `${subYogini.name} (${subYogini.rulingPlanet})`,
        startDate: currentSubStart.toISOString(),
        endDate: subEndDate.toISOString(),
        durationYears: subDuration,
      });

      currentSubStart = endDate < subEndDate ? endDate : subEndDate;
    }

    mahadashas.push({
      lord: `${yogini.name} (${yogini.rulingPlanet})`,
      startDate: currentPeriodStart.toISOString(),
      endDate: endDate.toISOString(),
      durationYears: duration,
      subPeriods,
    });

    currentPeriodStart = endDate;
  }

  return {
    startingLord: `${startingYogini.name} (${startingYogini.rulingPlanet})`,
    balanceAtBirthYears,
    mahadashas,
  };
};
