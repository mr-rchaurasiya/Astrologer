import { PlanetName, DashaPeriod, VimshottariDashaTree } from '../types/astrology';
import { getNakshatraFromLongitude, NAKSHATRA_SPAN } from '../nakshatra/nakshatras';

export interface VimshottariLordRule {
  lord: PlanetName;
  years: number;
}

export const VIMSHOTTARI_LORDS: VimshottariLordRule[] = [
  { lord: 'Ketu', years: 7 },
  { lord: 'Venus', years: 20 },
  { lord: 'Sun', years: 6 },
  { lord: 'Moon', years: 10 },
  { lord: 'Mars', years: 7 },
  { lord: 'Rahu', years: 18 },
  { lord: 'Jupiter', years: 16 },
  { lord: 'Saturn', years: 19 },
  { lord: 'Mercury', years: 17 },
];

export const TOTAL_VIMSHOTTARI_YEARS = 120;
const DAYS_PER_YEAR = 365.2425; // standard astronomical tropical year

/**
 * Adds fractional years to a Date safely
 */
export const addYearsToDate = (startDate: Date, years: number): Date => {
  const msToAdd = years * DAYS_PER_YEAR * 24 * 3600 * 1000;
  return new Date(startDate.getTime() + msToAdd);
};

/**
 * Generates the full 3-level hierarchical Vimshottari Dasha Tree (Maha, Antar, Pratyantar)
 */
export const calculateVimshottariDasha = (
  moonLongitude: number,
  birthUtcDate: Date
): VimshottariDashaTree => {
  const nakshatraInfo = getNakshatraFromLongitude(moonLongitude);
  const startingLord = nakshatraInfo.lord;

  // Find index of starting lord
  const startingLordIndex = VIMSHOTTARI_LORDS.findIndex((l) => l.lord === startingLord);
  const startingLordRule = VIMSHOTTARI_LORDS[startingLordIndex >= 0 ? startingLordIndex : 0];

  // Fraction of nakshatra remaining at birth
  const elapsedFraction = nakshatraInfo.degreeInNakshatra / NAKSHATRA_SPAN;
  const remainingFraction = Math.max(0, Math.min(1.0, 1.0 - elapsedFraction));
  const balanceAtBirthYears = remainingFraction * startingLordRule.years;

  const mahadashas: DashaPeriod[] = [];
  let currentPeriodStart = new Date(birthUtcDate.getTime());

  // Generate 9 Mahadashas (covering full 120-year cycle from birth)
  for (let i = 0; i < 9; i++) {
    const lordIdx = (startingLordIndex + i) % 9;
    const rule = VIMSHOTTARI_LORDS[lordIdx];

    // For the first Mahadasha at birth, only the remaining balance is active
    const mahaDuration = i === 0 ? balanceAtBirthYears : rule.years;
    const mahaEndDate = addYearsToDate(currentPeriodStart, mahaDuration);

    // Calculate Antardashas
    const antardashas: DashaPeriod[] = [];
    let currentAntarStart = new Date(currentPeriodStart.getTime());

    // 9 Antardashas starting with the Mahadasha lord
    for (let j = 0; j < 9; j++) {
      const antarLordIdx = (lordIdx + j) % 9;
      const antarRule = VIMSHOTTARI_LORDS[antarLordIdx];

      // Full proportional duration
      const fullAntarDuration = (rule.years * antarRule.years) / TOTAL_VIMSHOTTARI_YEARS;
      const antarDuration = (mahaDuration / rule.years) * fullAntarDuration;
      const antarEndDate = addYearsToDate(currentAntarStart, antarDuration);

      // Calculate Pratyantardashas
      const pratyantardashas: DashaPeriod[] = [];
      let currentPratyantarStart = new Date(currentAntarStart.getTime());

      for (let k = 0; k < 9; k++) {
        const pratyantarLordIdx = (antarLordIdx + k) % 9;
        const pratyantarRule = VIMSHOTTARI_LORDS[pratyantarLordIdx];

        const pratyantarDuration =
          (antarDuration / antarRule.years) *
          ((antarRule.years * pratyantarRule.years) / TOTAL_VIMSHOTTARI_YEARS);
        const pratyantarEndDate = addYearsToDate(currentPratyantarStart, pratyantarDuration);

        pratyantardashas.push({
          lord: pratyantarRule.lord,
          startDate: currentPratyantarStart.toISOString(),
          endDate: pratyantarEndDate.toISOString(),
          durationYears: pratyantarDuration,
        });

        currentPratyantarStart = antarEndDate < pratyantarEndDate ? antarEndDate : pratyantarEndDate;
      }

      antardashas.push({
        lord: antarRule.lord,
        startDate: currentAntarStart.toISOString(),
        endDate: antarEndDate.toISOString(),
        durationYears: antarDuration,
        subPeriods: pratyantardashas,
      });

      currentAntarStart = mahaEndDate < antarEndDate ? mahaEndDate : antarEndDate;
    }

    mahadashas.push({
      lord: rule.lord,
      startDate: currentPeriodStart.toISOString(),
      endDate: mahaEndDate.toISOString(),
      durationYears: mahaDuration,
      subPeriods: antardashas,
    });

    currentPeriodStart = mahaEndDate;
  }

  return {
    balanceAtBirthYears,
    startingLord,
    mahadashas,
  };
};

/**
 * Finds the currently active Mahadasha and Antardasha for a given target date
 */
export const findActiveVimshottariPeriod = (
  dashaTree: VimshottariDashaTree,
  targetDate: Date = new Date()
) => {
  const targetTime = targetDate.getTime();

  for (const maha of dashaTree.mahadashas) {
    const start = new Date(maha.startDate).getTime();
    const end = new Date(maha.endDate).getTime();

    if (targetTime >= start && targetTime <= end) {
      let activeAntar = maha.subPeriods?.[0];
      let activePratyantar = activeAntar?.subPeriods?.[0];

      if (maha.subPeriods) {
        for (const antar of maha.subPeriods) {
          const aStart = new Date(antar.startDate).getTime();
          const aEnd = new Date(antar.endDate).getTime();
          if (targetTime >= aStart && targetTime <= aEnd) {
            activeAntar = antar;
            if (antar.subPeriods) {
              for (const prat of antar.subPeriods) {
                const pStart = new Date(prat.startDate).getTime();
                const pEnd = new Date(prat.endDate).getTime();
                if (targetTime >= pStart && targetTime <= pEnd) {
                  activePratyantar = prat;
                  break;
                }
              }
            }
            break;
          }
        }
      }

      return {
        mahadasha: maha.lord,
        antardasha: activeAntar ? activeAntar.lord : maha.lord,
        pratyantardasha: activePratyantar ? activePratyantar.lord : undefined,
        startDate: activeAntar?.startDate || maha.startDate,
        endDate: activeAntar?.endDate || maha.endDate,
      };
    }
  }

  // Fallback to first or last period
  const firstMaha = dashaTree.mahadashas[0];
  return {
    mahadasha: firstMaha.lord,
    antardasha: firstMaha.subPeriods?.[0]?.lord || firstMaha.lord,
    startDate: firstMaha.startDate,
    endDate: firstMaha.endDate,
  };
};
