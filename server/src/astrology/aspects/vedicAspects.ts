import { PlanetName, VedicAspect, ZodiacSignName } from '../types/astrology';
import { getSignByNumber } from '../zodiac/signs';

export interface PlanetAspectInput {
  name: PlanetName;
  house: number; // 1 to 12
  sign: ZodiacSignName;
  signNumber: number;
}

/**
 * Calculates all traditional Vedic Aspects (Drishti) cast by planets on houses and other planets
 */
export const calculateVedicAspects = (planets: PlanetAspectInput[]): VedicAspect[] => {
  const aspects: VedicAspect[] = [];

  for (const source of planets) {
    const aspectTargets: { aspectType: VedicAspect['aspectType']; houseOffset: number; strength: number }[] = [
      { aspectType: '7th', houseOffset: 7, strength: 100 },
    ];

    // Special Full Aspects
    if (source.name === 'Mars') {
      aspectTargets.push({ aspectType: '4th', houseOffset: 4, strength: 100 });
      aspectTargets.push({ aspectType: '8th', houseOffset: 8, strength: 100 });
    } else if (source.name === 'Jupiter') {
      aspectTargets.push({ aspectType: '5th', houseOffset: 5, strength: 100 });
      aspectTargets.push({ aspectType: '9th', houseOffset: 9, strength: 100 });
    } else if (source.name === 'Saturn') {
      aspectTargets.push({ aspectType: '3rd', houseOffset: 3, strength: 100 });
      aspectTargets.push({ aspectType: '10th', houseOffset: 10, strength: 100 });
    } else if (source.name === 'Rahu' || source.name === 'Ketu') {
      aspectTargets.push({ aspectType: '5th', houseOffset: 5, strength: 100 });
      aspectTargets.push({ aspectType: '9th', houseOffset: 9, strength: 100 });
    }

    for (const target of aspectTargets) {
      const toHouse = (((source.house - 1 + (target.houseOffset - 1)) % 12) + 1);
      const toSignNum = (((source.signNumber - 1 + (target.houseOffset - 1)) % 12) + 1);
      const toSign = getSignByNumber(toSignNum).name;

      // Check if any other planet resides in the target house
      const targetPlanets = planets.filter((p) => p.name !== source.name && p.house === toHouse);

      if (targetPlanets.length > 0) {
        for (const targetPlanet of targetPlanets) {
          aspects.push({
            fromPlanet: source.name,
            toHouse,
            toSign,
            targetPlanet: targetPlanet.name,
            aspectType: target.aspectType,
            strength: target.strength,
          });
        }
      } else {
        aspects.push({
          fromPlanet: source.name,
          toHouse,
          toSign,
          aspectType: target.aspectType,
          strength: target.strength,
        });
      }
    }
  }

  return aspects;
};
