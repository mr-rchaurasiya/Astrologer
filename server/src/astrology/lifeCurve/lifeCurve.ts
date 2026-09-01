import { AstrologyChartOutput, PlanetName, DashaPeriod } from '../types/astrology';
import { calculateTransits } from '../transit/transits';
import { LifeCurvePoint, LifeCurveResult, LifeCurveOptions } from './lifeCurve.types';
import { calculateLifeCurveScores, NatalAstrologyProfile, PlanetaryTransitPlacement } from './lifeCurveScoring';

const SCORE_DISCLAIMER =
  'Life Curve scores (0–100) are application-defined visualization metrics synthesized from classical Parashari Dasha progressions and major planetary transits. They are intended for self-reflection and philosophical insight, not deterministic guarantees or medical advice.';

/**
 * Finds the active Mahadasha, Antardasha, and Pratyantardasha for a given target date
 */
export const findActiveDashaAtDate = (
  mahadashas: DashaPeriod[],
  targetDate: Date
): {
  mahadasha: PlanetName;
  antardasha?: PlanetName;
  pratyantardasha?: PlanetName;
} => {
  const targetTime = targetDate.getTime();

  for (const maha of mahadashas) {
    const mahaStart = new Date(maha.startDate).getTime();
    const mahaEnd = new Date(maha.endDate).getTime();

    if (targetTime >= mahaStart && targetTime < mahaEnd) {
      let activeAntar: PlanetName | undefined;
      let activePratyantar: PlanetName | undefined;

      if (maha.subPeriods) {
        for (const antar of maha.subPeriods) {
          const antarStart = new Date(antar.startDate).getTime();
          const antarEnd = new Date(antar.endDate).getTime();

          if (targetTime >= antarStart && targetTime < antarEnd) {
            activeAntar = antar.lord as PlanetName;

            if (antar.subPeriods) {
              for (const praty of antar.subPeriods) {
                const pratyStart = new Date(praty.startDate).getTime();
                const pratyEnd = new Date(praty.endDate).getTime();

                if (targetTime >= pratyStart && targetTime < pratyEnd) {
                  activePratyantar = praty.lord as PlanetName;
                  break;
                }
              }
            }
            break;
          }
        }
      }

      return {
        mahadasha: maha.lord as PlanetName,
        antardasha: activeAntar,
        pratyantardasha: activePratyantar,
      };
    }
  }

  // Fallback to first or last
  const fallback = mahadashas[mahadashas.length - 1];
  return { mahadasha: fallback.lord as PlanetName };
};

/**
 * Generates the multi-decade Life Curve time-series
 */
export const generateLifeCurve = (
  profileId: string,
  chart: AstrologyChartOutput,
  options: LifeCurveOptions = {}
): LifeCurveResult => {
  const birthDate = new Date(chart.birthInput.utcDateTime);
  const birthYear = birthDate.getUTCFullYear();

  const horizonYears = options.horizonYears || 80;
  const startYear = options.startYear || birthYear;
  const endYear = options.endYear || birthYear + horizonYears;
  const resolution = options.resolution || 'year';

  // Extract Natal Profile
  const moon = chart.planets.find((p) => p.name === 'Moon');
  const natalProfile: NatalAstrologyProfile = {
    ascendantSignNumber: chart.ascendant.signNumber,
    moonSignNumber: moon ? moon.signNumber : chart.ascendant.signNumber,
    planets: chart.planets,
    houses: chart.houses,
  };

  // Determine step interval in months
  const monthStep = resolution === 'month' ? 1 : resolution === 'quarter' ? 3 : 12;

  const points: LifeCurvePoint[] = [];
  const startSampleDate = new Date(Date.UTC(startYear, 0, 1));
  const endSampleDate = new Date(Date.UTC(endYear, 11, 31));

  let currentSample = new Date(startSampleDate.getTime());
  const birthTime = birthDate.getTime();

  // Safety cap on points to prevent resource exhaustion
  const maxPoints = resolution === 'month' ? 1000 : resolution === 'quarter' ? 400 : 100;
  let count = 0;

  while (currentSample <= endSampleDate && count < maxPoints) {
    const sampleTime = currentSample.getTime();
    const age = Math.max(0, parseFloat(((sampleTime - birthTime) / (365.2425 * 24 * 3600 * 1000)).toFixed(2)));

    // 1. Resolve Active Dasha
    const activeDasha = findActiveDashaAtDate(chart.dashas.mahadashas, currentSample);

    // 2. Resolve Transits for slow moving planets (Saturn, Jupiter, Rahu, Ketu)
    let transitPlacements: PlanetaryTransitPlacement[] = [];
    try {
      const transitResult = calculateTransits(
        currentSample,
        chart.birthInput.latitude,
        chart.birthInput.longitude
      );

      transitPlacements = transitResult.planets
        .filter((p) => ['Saturn', 'Jupiter', 'Rahu', 'Ketu'].includes(p.name))
        .map((p) => ({
          name: p.name,
          signNumber: p.signNumber,
          sign: p.sign,
          isRetrograde: p.retrograde,
        }));
    } catch {
      // Gracefully handle transit calculation errors for historical edge cases
    }

    // 3. Score point
    const { scores, influences } = calculateLifeCurveScores(
      natalProfile,
      activeDasha.mahadasha,
      activeDasha.antardasha,
      transitPlacements
    );

    // Construct point
    points.push({
      date: currentSample.toISOString(),
      year: currentSample.getUTCFullYear(),
      age,
      scores,
      mahadasha: activeDasha.mahadasha,
      antardasha: activeDasha.antardasha,
      pratyantardasha: activeDasha.pratyantardasha,
      majorTransits: influences,
      keyHighlight: influences.length > 0 ? influences[0].relationToNatalMoon : undefined,
    });

    // Advance sample date
    currentSample = new Date(
      Date.UTC(
        currentSample.getUTCFullYear(),
        currentSample.getUTCMonth() + monthStep,
        1
      )
    );
    count++;
  }

  // 4. Mahadasha Transitions summary for visual timeline bands
  const mahadashaTransitions = chart.dashas.mahadashas.map((m) => {
    const sDate = new Date(m.startDate);
    const eDate = new Date(m.endDate);
    const ageStart = Math.max(0, parseFloat(((sDate.getTime() - birthTime) / (365.2425 * 24 * 3600 * 1000)).toFixed(1)));
    const ageEnd = Math.max(0, parseFloat(((eDate.getTime() - birthTime) / (365.2425 * 24 * 3600 * 1000)).toFixed(1)));

    return {
      lord: m.lord as PlanetName,
      startDate: m.startDate,
      endDate: m.endDate,
      ageStart,
      ageEnd,
    };
  });

  return {
    profileId,
    birthDate: chart.birthInput.utcDateTime,
    startDate: startSampleDate.toISOString(),
    endDate: endSampleDate.toISOString(),
    totalPoints: points.length,
    resolution,
    points,
    mahadashaTransitions,
    scoreDisclaimer: SCORE_DISCLAIMER,
  };
};
