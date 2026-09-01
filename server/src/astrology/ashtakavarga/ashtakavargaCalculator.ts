import {
  PlanetName,
  PlanetPosition,
  AscendantInfo,
  AshtakavargaResult,
  BhinnashtakavargaMatrix,
} from '../types/astrology';

// Parashari Benefic Contributor Rules
// For each planet receiving bindus, houses (1-indexed from reference planet) where it contributes a bindu
type ContributorKey = PlanetName | 'Lagna';

const BAV_RULES: Record<PlanetName, Record<ContributorKey, number[]>> = {
  Sun: {
    Sun: [1, 2, 4, 7, 8, 9, 10, 11],
    Moon: [3, 6, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [3, 5, 6, 9, 10, 11, 12],
    Jupiter: [5, 6, 9, 11],
    Venus: [6, 7, 12],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [3, 4, 6, 10, 11, 12],
    Rahu: [],
    Ketu: [],
  },
  Moon: {
    Sun: [3, 6, 7, 8, 10, 11],
    Moon: [1, 3, 6, 7, 10, 11],
    Mars: [2, 3, 5, 6, 9, 10, 11],
    Mercury: [1, 3, 4, 5, 7, 8, 10, 11],
    Jupiter: [1, 4, 7, 8, 10, 11, 12],
    Venus: [3, 4, 5, 7, 9, 10, 11],
    Saturn: [3, 5, 6, 11],
    Lagna: [3, 6, 10, 11],
    Rahu: [],
    Ketu: [],
  },
  Mars: {
    Sun: [3, 5, 6, 10, 11],
    Moon: [3, 6, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [3, 5, 6, 11],
    Jupiter: [6, 10, 11, 12],
    Venus: [6, 8, 11, 12],
    Saturn: [1, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 3, 6, 10, 11],
    Rahu: [],
    Ketu: [],
  },
  Mercury: {
    Sun: [5, 6, 9, 11, 12],
    Moon: [2, 4, 6, 8, 10, 11],
    Mars: [1, 2, 4, 7, 8, 9, 10, 11],
    Mercury: [1, 3, 5, 6, 9, 10, 11, 12],
    Jupiter: [6, 8, 11, 12],
    Venus: [1, 2, 3, 4, 5, 8, 9, 11],
    Saturn: [1, 2, 4, 7, 8, 9, 10, 11],
    Lagna: [1, 2, 4, 6, 8, 10, 11],
    Rahu: [],
    Ketu: [],
  },
  Jupiter: {
    Sun: [1, 2, 3, 4, 7, 8, 9, 10, 11],
    Moon: [2, 5, 7, 9, 11],
    Mars: [1, 2, 4, 7, 8, 10, 11],
    Mercury: [1, 2, 4, 5, 6, 9, 10, 11],
    Jupiter: [1, 2, 3, 4, 7, 8, 10, 11],
    Venus: [2, 5, 6, 9, 10, 11],
    Saturn: [3, 5, 6, 12],
    Lagna: [1, 2, 4, 5, 6, 7, 9, 10, 11],
    Rahu: [],
    Ketu: [],
  },
  Venus: {
    Sun: [8, 11, 12],
    Moon: [1, 2, 3, 4, 5, 8, 9, 11, 12],
    Mars: [3, 5, 6, 9, 11, 12],
    Mercury: [3, 5, 6, 9, 11],
    Jupiter: [5, 8, 9, 10, 11],
    Venus: [1, 2, 3, 4, 5, 8, 9, 10, 11],
    Saturn: [3, 4, 5, 8, 9, 10, 11],
    Lagna: [1, 2, 3, 4, 5, 8, 9, 11],
    Rahu: [],
    Ketu: [],
  },
  Saturn: {
    Sun: [1, 2, 4, 7, 8, 10, 11],
    Moon: [3, 6, 11],
    Mars: [3, 5, 6, 10, 11, 12],
    Mercury: [6, 8, 9, 10, 11, 12],
    Jupiter: [5, 6, 11, 12],
    Venus: [6, 11, 12],
    Saturn: [3, 5, 6, 11],
    Lagna: [1, 3, 4, 6, 10, 11],
    Rahu: [],
    Ketu: [],
  },
  Rahu: {
    Sun: [], Moon: [], Mars: [], Mercury: [], Jupiter: [], Venus: [], Saturn: [], Lagna: [], Rahu: [], Ketu: [],
  },
  Ketu: {
    Sun: [], Moon: [], Mars: [], Mercury: [], Jupiter: [], Venus: [], Saturn: [], Lagna: [], Rahu: [], Ketu: [],
  },
};

export class AshtakavargaCalculator {
  /**
   * Calculates Bhinnashtakavarga (BAV) and Sarvashtakavarga (SAV) for the chart
   */
  public static calculate(
    ascendant: AscendantInfo,
    planets: PlanetPosition[]
  ): AshtakavargaResult {
    const planetPositions: Record<ContributorKey, number> = {
      Sun: planets.find((p) => p.name === 'Sun')!.signNumber,
      Moon: planets.find((p) => p.name === 'Moon')!.signNumber,
      Mars: planets.find((p) => p.name === 'Mars')!.signNumber,
      Mercury: planets.find((p) => p.name === 'Mercury')!.signNumber,
      Jupiter: planets.find((p) => p.name === 'Jupiter')!.signNumber,
      Venus: planets.find((p) => p.name === 'Venus')!.signNumber,
      Saturn: planets.find((p) => p.name === 'Saturn')!.signNumber,
      Lagna: ascendant.signNumber,
      Rahu: planets.find((p) => p.name === 'Rahu')?.signNumber || 1,
      Ketu: planets.find((p) => p.name === 'Ketu')?.signNumber || 7,
    };

    const mainPlanets: PlanetName[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const contributors: ContributorKey[] = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Lagna'];

    const bhinnashtakavarga: BhinnashtakavargaMatrix[] = [];
    const sarvashtakavarga: number[] = new Array(12).fill(0);

    for (const targetPlanet of mainPlanets) {
      const bindus = new Array(12).fill(0); // index 0 = Aries (Sign 1) .. index 11 = Pisces (Sign 12)
      const rules = BAV_RULES[targetPlanet];

      for (const contrib of contributors) {
        const contribSign = planetPositions[contrib]; // 1 to 12
        const contributingHouses = rules[contrib] || [];

        for (const houseOffset of contributingHouses) {
          // target sign = (contribSign + houseOffset - 1) % 12
          const targetSignIndex = ((contribSign - 1 + houseOffset - 1) % 12);
          bindus[targetSignIndex] += 1;
        }
      }

      const totalBindus = bindus.reduce((sum, val) => sum + val, 0);
      bhinnashtakavarga.push({
        planet: targetPlanet,
        bindus,
        totalBindus,
      });

      for (let s = 0; s < 12; s++) {
        sarvashtakavarga[s] += bindus[s];
      }
    }

    const totalSavBindus = sarvashtakavarga.reduce((sum, val) => sum + val, 0);

    // Calculate house-wise bindus starting from Lagna (House 1 = Lagna sign)
    const houseBindus = new Array(12).fill(0);
    for (let h = 1; h <= 12; h++) {
      const signIdx = ((ascendant.signNumber - 1 + h - 1) % 12);
      houseBindus[h - 1] = sarvashtakavarga[signIdx];
    }

    return {
      bhinnashtakavarga,
      sarvashtakavarga,
      houseBindus,
      totalSavBindus,
    };
  }
}
