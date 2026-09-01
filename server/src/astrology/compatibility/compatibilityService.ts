import {
  PlanetPosition,
  AscendantInfo,
  CompatibilityResult,
  AshtakootaFactor,
} from '../types/astrology';
import { getNakshatraFromLongitude } from '../nakshatra/nakshatras';
import { getSignByNumber } from '../zodiac/signs';

// 14 Yoni Animals mapping for 27 Nakshatras (1: Ashwini .. 27: Revati)
const NAKSHATRA_YONI: string[] = [
  'Horse', 'Elephant', 'Sheep', 'Serpent', 'Serpent', 'Dog', 'Cat', 'Sheep', 'Cat', // 1-9
  'Rat', 'Rat', 'Cow', 'Buffalo', 'Tiger', 'Buffalo', 'Tiger', 'Deer', 'Deer',      // 10-18
  'Dog', 'Monkey', 'Mongoose', 'Monkey', 'Lion', 'Horse', 'Lion', 'Cow', 'Elephant', // 19-27
];

// Sworn enemy Yoni pairs (0 score)
const YONI_ENEMIES: Record<string, string> = {
  Horse: 'Buffalo',
  Buffalo: 'Horse',
  Elephant: 'Lion',
  Lion: 'Elephant',
  Sheep: 'Monkey',
  Monkey: 'Sheep',
  Serpent: 'Mongoose',
  Mongoose: 'Serpent',
  Dog: 'Hare',
  Hare: 'Dog',
  Cat: 'Rat',
  Rat: 'Cat',
  Cow: 'Tiger',
  Tiger: 'Cow',
  Deer: 'Dog',
};

// 3 Ganas: 0 = Deva, 1 = Manushya, 2 = Rakshasa
const NAKSHATRA_GANA: Array<'Deva' | 'Manushya' | 'Rakshasa'> = [
  'Deva', 'Manushya', 'Rakshasa', 'Manushya', 'Deva', 'Manushya', 'Deva', 'Deva', 'Rakshasa',      // 1-9
  'Rakshasa', 'Manushya', 'Manushya', 'Deva', 'Rakshasa', 'Deva', 'Deva', 'Deva', 'Rakshasa',     // 10-18
  'Rakshasa', 'Manushya', 'Deva', 'Deva', 'Rakshasa', 'Rakshasa', 'Manushya', 'Manushya', 'Deva', // 19-27
];

// 3 Nadis: 0 = Adi, 1 = Madhya, 2 = Antya
const NAKSHATRA_NADI: Array<'Adi' | 'Madhya' | 'Antya'> = [
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya',      // 1-9
  'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi',     // 10-18
  'Adi', 'Madhya', 'Antya', 'Antya', 'Madhya', 'Adi', 'Adi', 'Madhya', 'Antya',     // 19-27
];

// 4 Varnas by Sign (1: Aries .. 12: Pisces)
const SIGN_VARNA: number[] = [
  2, 3, 4, 1, // Aries (Kshatriya), Taurus (Vaishya), Gemini (Shudra), Cancer (Brahmin)
  2, 3, 4, 1, // Leo, Virgo, Libra, Scorpio
  2, 3, 4, 1, // Sag, Cap, Aqua, Pisces
]; // 1 = Brahmin, 2 = Kshatriya, 3 = Vaishya, 4 = Shudra (higher rank = smaller number)

export class CompatibilityService {
  /**
   * Evaluates classical 36-Guna Ashtakoota Milan and Kuja Dosha between two birth charts
   */
  public static calculateCompatibility(
    profile1: { ascendant: AscendantInfo; planets: PlanetPosition[] },
    profile2: { ascendant: AscendantInfo; planets: PlanetPosition[] }
  ): CompatibilityResult {
    const moon1 = profile1.planets.find((p) => p.name === 'Moon')!;
    const moon2 = profile2.planets.find((p) => p.name === 'Moon')!;

    const nak1 = getNakshatraFromLongitude(moon1.longitude);
    const nak2 = getNakshatraFromLongitude(moon2.longitude);

    const n1 = nak1.number; // 1 to 27 (Profile 1)
    const n2 = nak2.number; // 1 to 27 (Profile 2)

    const sign1 = moon1.signNumber; // 1 to 12
    const sign2 = moon2.signNumber; // 1 to 12

    // 1. Varna Koota (1 point)
    const varna1 = SIGN_VARNA[sign1 - 1];
    const varna2 = SIGN_VARNA[sign2 - 1];
    const varnaScore = varna1 <= varna2 ? 1 : 0; // Profile 1 >= Profile 2
    const varnaFactor: AshtakootaFactor = {
      name: 'Varna (Ego & Temperament)',
      maxScore: 1,
      obtainedScore: varnaScore,
      description: varnaScore === 1 ? 'Harmonious spiritual alignment' : 'Subtle ego friction',
      status: varnaScore === 1 ? 'excellent' : 'average',
    };

    // 2. Vashya Koota (2 points)
    const vashyaScore = sign1 === sign2 ? 2 : Math.abs(sign1 - sign2) === 6 ? 1 : 1;
    const vashyaFactor: AshtakootaFactor = {
      name: 'Vashya (Mutual Attraction & Harmony)',
      maxScore: 2,
      obtainedScore: vashyaScore,
      description: vashyaScore >= 2 ? 'Strong mutual attraction' : 'Balanced compatibility',
      status: vashyaScore >= 2 ? 'excellent' : 'good',
    };

    // 3. Tara Koota (3 points)
    const taraCount1 = (((n2 - n1 + 27) % 27) + 1) % 9;
    const taraCount2 = (((n1 - n2 + 27) % 27) + 1) % 9;
    const badTaras = [3, 5, 7]; // Vipat, Pratyak, Naidhana
    const isT1Good = !badTaras.includes(taraCount1);
    const isT2Good = !badTaras.includes(taraCount2);
    let taraScore = 0;
    if (isT1Good && isT2Good) taraScore = 3;
    else if (isT1Good || isT2Good) taraScore = 1.5;
    const taraFactor: AshtakootaFactor = {
      name: 'Tara (Destiny & Well-being)',
      maxScore: 3,
      obtainedScore: taraScore,
      description: taraScore === 3 ? 'Auspicious health and destiny alignment' : 'Moderate destiny harmony',
      status: taraScore >= 3 ? 'excellent' : taraScore > 0 ? 'good' : 'dosha',
    };

    // 4. Yoni Koota (4 points)
    const yoni1 = NAKSHATRA_YONI[n1 - 1];
    const yoni2 = NAKSHATRA_YONI[n2 - 1];
    let yoniScore = 2;
    if (yoni1 === yoni2) {
      yoniScore = 4;
    } else if (YONI_ENEMIES[yoni1] === yoni2) {
      yoniScore = 0;
    } else {
      yoniScore = 2;
    }
    const yoniFactor: AshtakootaFactor = {
      name: 'Yoni (Physical & Biological Harmony)',
      maxScore: 4,
      obtainedScore: yoniScore,
      description:
        yoniScore === 4
          ? 'Exceptional biological and lifestyle compatibility'
          : yoniScore === 0
          ? 'Yoni enmity requires mutual patience'
          : 'Normal mutual compatibility',
      status: yoniScore === 4 ? 'excellent' : yoniScore > 0 ? 'good' : 'dosha',
    };

    // 5. Graha Maitri (5 points)
    const lord1 = getSignByNumber(sign1).lord;
    const lord2 = getSignByNumber(sign2).lord;
    let grahaMaitriScore = 3;
    if (lord1 === lord2) {
      grahaMaitriScore = 5;
    } else if (
      (['Sun', 'Moon', 'Mars', 'Jupiter'].includes(lord1) && ['Sun', 'Moon', 'Mars', 'Jupiter'].includes(lord2)) ||
      (['Mercury', 'Venus', 'Saturn'].includes(lord1) && ['Mercury', 'Venus', 'Saturn'].includes(lord2))
    ) {
      grahaMaitriScore = 4;
    } else {
      grahaMaitriScore = 2;
    }
    const grahaMaitriFactor: AshtakootaFactor = {
      name: 'Graha Maitri (Psychological Alignment)',
      maxScore: 5,
      obtainedScore: grahaMaitriScore,
      description:
        grahaMaitriScore >= 4 ? 'Strong intellectual affinity and friendship' : 'Healthy respect with differing viewpoints',
      status: grahaMaitriScore >= 4 ? 'excellent' : 'good',
    };

    // 6. Gana Koota (6 points)
    const gana1 = NAKSHATRA_GANA[n1 - 1];
    const gana2 = NAKSHATRA_GANA[n2 - 1];
    let ganaScore = 0;
    if (gana1 === gana2) {
      ganaScore = 6;
    } else if ((gana1 === 'Deva' && gana2 === 'Manushya') || (gana1 === 'Manushya' && gana2 === 'Deva')) {
      ganaScore = 5;
    } else {
      ganaScore = 1;
    }
    const ganaFactor: AshtakootaFactor = {
      name: 'Gana (Temperament & Life Philosophy)',
      maxScore: 6,
      obtainedScore: ganaScore,
      description:
        ganaScore >= 5 ? 'Natural temperamental harmony' : 'Complementary temperaments requiring empathy',
      status: ganaScore >= 5 ? 'excellent' : 'average',
    };

    // 7. Bhakoot Koota (7 points)
    const distFrom1 = ((sign2 - sign1 + 12) % 12) + 1;
    const isBhakootDosha = [2, 6, 8, 12].includes(distFrom1);
    const bhakootScore = isBhakootDosha ? 0 : 7;
    const bhakootFactor: AshtakootaFactor = {
      name: 'Bhakoot (Emotional Fulfillment & Growth)',
      maxScore: 7,
      obtainedScore: bhakootScore,
      description:
        bhakootScore === 7 ? 'Excellent emotional depth and prosperity' : 'Bhakoot relationship suggests emotional mindfulness',
      status: bhakootScore === 7 ? 'excellent' : 'dosha',
    };

    // 8. Nadi Koota (8 points)
    const nadi1 = NAKSHATRA_NADI[n1 - 1];
    const nadi2 = NAKSHATRA_NADI[n2 - 1];
    const nadiScore = nadi1 !== nadi2 ? 8 : 0;
    const nadiFactor: AshtakootaFactor = {
      name: 'Nadi (Physiological & Genetic Harmony)',
      maxScore: 8,
      obtainedScore: nadiScore,
      description:
        nadiScore === 8 ? 'Complete genetic and constitutional balance' : 'Same Nadi indicates physiological similarity',
      status: nadiScore === 8 ? 'excellent' : 'dosha',
    };

    // Total Score calculation
    const totalScore =
      varnaScore +
      vashyaScore +
      taraScore +
      yoniScore +
      grahaMaitriScore +
      ganaScore +
      bhakootScore +
      nadiScore;

    const percentage = Number(((totalScore / 36) * 100).toFixed(1));

    let grade: 'Highly Auspicious' | 'Auspicious' | 'Moderate' | 'Challenging' = 'Moderate';
    if (totalScore >= 28) grade = 'Highly Auspicious';
    else if (totalScore >= 18) grade = 'Auspicious';
    else if (totalScore >= 12) grade = 'Moderate';
    else grade = 'Challenging';

    // Manglik (Kuja Dosha) check for both charts
    // Mars in 1, 2, 4, 7, 8, 12 from Lagna or Moon
    const checkManglik = (chart: { ascendant: AscendantInfo; planets: PlanetPosition[] }) => {
      const mars = chart.planets.find((p) => p.name === 'Mars')!;
      return [1, 2, 4, 7, 8, 12].includes(mars.house);
    };

    const isP1Manglik = checkManglik(profile1);
    const isP2Manglik = checkManglik(profile2);
    const isCancelled = (isP1Manglik && isP2Manglik) || (!isP1Manglik && !isP2Manglik);

    let manglikSummary = 'Neither individual has prominent Kuja (Mangal) Dosha.';
    if (isP1Manglik && isP2Manglik) {
      manglikSummary = 'Both charts show Kuja Dosha, resulting in mutual classical cancellation (Mangal Dosha Samyam).';
    } else if (isP1Manglik || isP2Manglik) {
      manglikSummary = 'One chart shows Kuja Dosha placement; traditional wisdom suggests thoughtful mutual understanding.';
    }

    const recommendation =
      totalScore >= 18
        ? 'Traditional Ashtakoota metrics suggest strong foundational compatibility and mutual harmony.'
        : 'Traditional metrics suggest areas of divergence; mutual understanding, communication, and shared values are recommended.';

    return {
      totalScore,
      maxScore: 36,
      percentage,
      grade,
      factors: [
        varnaFactor,
        vashyaFactor,
        taraFactor,
        yoniFactor,
        grahaMaitriFactor,
        ganaFactor,
        bhakootFactor,
        nadiFactor,
      ],
      kootas: {
        varna: varnaFactor,
        vashya: vashyaFactor,
        tara: taraFactor,
        yoni: yoniFactor,
        grahaMaitri: grahaMaitriFactor,
        gana: ganaFactor,
        bhakoot: bhakootFactor,
        nadi: nadiFactor,
      },
      mangalDosha: {
        profile1Manglik: isP1Manglik,
        profile2Manglik: isP2Manglik,
        isCancelled,
        summary: manglikSummary,
      },
      recommendation,
    };
  }
}
