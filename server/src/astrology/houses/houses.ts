import { HouseInfo, PlanetName, PlanetPosition } from '../types/astrology';
import { getSignByNumber, normalizeDegrees } from '../zodiac/signs';

/**
 * Calculates the 12 Vedic Houses (Bhavas) using the traditional Whole Sign system
 * (where House 1 = Ascendant Sign, House 2 = Ascendant Sign + 1, etc.)
 */
export const calculateVedicHouses = (
  ascendantSignNumber: number, // 1 to 12
  planets: { name: PlanetName; longitude: number; signNumber: number }[]
): HouseInfo[] => {
  const houses: HouseInfo[] = [];

  for (let h = 1; h <= 12; h++) {
    // Whole sign house mapping
    const signNum = ((ascendantSignNumber - 1 + (h - 1)) % 12) + 1;
    const signMeta = getSignByNumber(signNum);

    const startDeg = normalizeDegrees((signNum - 1) * 30);
    const midDeg = normalizeDegrees(startDeg + 15);
    const endDeg = normalizeDegrees(startDeg + 30);

    // Find occupants in this house
    const occupants = planets
      .filter((p) => p.signNumber === signNum)
      .map((p) => p.name);

    houses.push({
      houseNumber: h,
      sign: signMeta.name,
      signNumber: signNum,
      startDegree: startDeg,
      midDegree: midDeg,
      endDegree: endDeg,
      lord: signMeta.lord,
      occupants,
    });
  }

  return houses;
};

/**
 * Computes which house (1-12) a given planet or point occupies relative to the Ascendant sign
 */
export const getHouseFromAscendant = (planetSignNumber: number, ascendantSignNumber: number): number => {
  return (((planetSignNumber - ascendantSignNumber) % 12 + 12) % 12) + 1;
};
