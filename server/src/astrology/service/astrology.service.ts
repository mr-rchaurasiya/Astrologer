import {
  AstrologyChartOutput,
  AdvancedAstrologyAnalysis,
  CompatibilityResult,
} from '../types/astrology';
import { parseBirthTimeToUtc } from '../coordinates/time';
import { calculateLahiriAyanamsa, formatDegreesDMS } from '../ephemeris/ayanamsa';
import { calculateAscendant } from '../houses/ascendant';
import { calculatePlanetaryPositions } from '../ephemeris/planetaryPositions';
import { calculateVedicHouses } from '../houses/houses';
import {
  calculateAllDivisionalCharts,
  calculateD1Chart,
  calculateD9Chart,
  calculateD10Chart,
} from '../divisional/divisionalCharts';
import { calculateVedicAspects } from '../aspects/vedicAspects';
import {
  calculateVimshottariDasha,
  findActiveVimshottariPeriod,
  calculateYoginiDasha,
  calculateAshtottariDasha,
} from '../dashas';
import { YogaDetector } from '../yogas';
import { AshtakavargaCalculator } from '../ashtakavarga';
import { ShadbalaCalculator } from '../strength';
import { AdvancedTransitCalculator } from '../transits';
import { CompatibilityService } from '../compatibility';
import { calculatePanchang } from '../panchang/panchang';
import { calculateMuhurtas } from '../muhurta/muhurta';

export interface BirthCalculationInput {
  dateOfBirth: string; // YYYY-MM-DD
  timeOfBirth: string; // HH:mm:ss
  latitude: number;
  longitude: number;
  timezone: string;
  timezoneOffset: number;
}

export class AstrologyService {
  public static readonly ENGINE_VERSION = '2.0.0';
  public static readonly EPHEMERIS_VERSION = 'VSOP87/JPL (AstronomyEngine 2.1.19)';

  /**
   * Deterministically calculates the standard Vedic Astrology Chart from birth parameters
   */
  public static calculateBirthChart(input: BirthCalculationInput): AstrologyChartOutput {
    // 1. Convert Local Time to UTC & Julian Day
    const { utcDate, julianDay } = parseBirthTimeToUtc(
      input.dateOfBirth,
      input.timeOfBirth,
      input.timezoneOffset
    );

    // 2. Calculate Lahiri (Chitra Paksha) Ayanamsa
    const ayanamsaValue = calculateLahiriAyanamsa(julianDay);
    const ayanamsaFormatted = formatDegreesDMS(ayanamsaValue);

    // 3. Calculate Ascendant (Lagna)
    const ascendant = calculateAscendant(utcDate, input.latitude, input.longitude, ayanamsaValue);

    // 4. Calculate Planetary Positions & Nodes
    const planets = calculatePlanetaryPositions(
      utcDate,
      julianDay,
      ayanamsaValue,
      ascendant.signNumber
    );

    // Find Moon and Sun
    const moon = planets.find((p) => p.name === 'Moon') || planets[1];
    const sun = planets.find((p) => p.name === 'Sun') || planets[0];

    // 5. Calculate Vedic Whole Sign Houses (Bhavas)
    const houses = calculateVedicHouses(ascendant.signNumber, planets);

    // 6. Calculate Divisional Charts (All 16 Vargas)
    const allDivisionalCharts = calculateAllDivisionalCharts(ascendant, planets);

    // 7. Calculate Vedic Planetary Aspects (Drishti)
    const aspectInputs = planets.map((p) => ({
      name: p.name,
      house: p.house,
      sign: p.sign,
      signNumber: p.signNumber,
    }));
    const aspects = calculateVedicAspects(aspectInputs);

    // 8. Calculate Vimshottari Dasha Tree
    const dashas = calculateVimshottariDasha(moon.longitude, utcDate);

    // 9. Calculate Daily Panchang
    const panchang = calculatePanchang(
      utcDate,
      sun.longitude,
      moon.longitude,
      input.latitude,
      input.longitude
    );

    // 10. Calculate Muhurta Windows
    const muhurta = calculateMuhurtas(
      input.dateOfBirth,
      utcDate,
      panchang.sunTimes.sunrise,
      panchang.sunTimes.sunset
    );

    return {
      birthInput: {
        dateOfBirth: input.dateOfBirth,
        timeOfBirth: input.timeOfBirth,
        latitude: input.latitude,
        longitude: input.longitude,
        timezone: input.timezone,
        timezoneOffset: input.timezoneOffset,
        utcDateTime: utcDate.toISOString(),
        julianDay,
      },
      ayanamsa: {
        system: 'Lahiri',
        value: ayanamsaValue,
        formatted: ayanamsaFormatted,
      },
      ascendant,
      planets,
      houses,
      divisionalCharts: {
        d1: allDivisionalCharts.D1,
        d9: allDivisionalCharts.D9,
        d10: allDivisionalCharts.D10,
        ...allDivisionalCharts,
      },
      aspects,
      dashas,
      panchang,
      muhurta,
      calculatedAt: new Date().toISOString(),
      calculationVersion: this.ENGINE_VERSION,
      ephemerisVersion: this.EPHEMERIS_VERSION,
    };
  }

  /**
   * Phase 12: Calculates the Complete Deep Astrology Analysis
   */
  public static calculateAdvancedAnalysis(
    input: BirthCalculationInput,
    targetDate: Date = new Date()
  ): AdvancedAstrologyAnalysis {
    const chart = this.calculateBirthChart(input);
    const { utcDate } = parseBirthTimeToUtc(input.dateOfBirth, input.timeOfBirth, input.timezoneOffset);
    const moon = chart.planets.find((p) => p.name === 'Moon')!;

    // 1. All 16 Divisional Charts
    const divisionalCharts = calculateAllDivisionalCharts(chart.ascendant, chart.planets);

    // 2. Dashas (Vimshottari, Yogini, Ashtottari, and Active Period)
    const vimshottari = calculateVimshottariDasha(moon.longitude, utcDate);
    const yogini = calculateYoginiDasha(moon.longitude, utcDate);
    const ashtottari = calculateAshtottariDasha(moon.longitude, utcDate);
    const activeDasha = findActiveVimshottariPeriod(vimshottari, targetDate);

    // 3. Classical Yogas
    const yogas = YogaDetector.detectAllYogas(chart.ascendant, chart.planets, chart.houses);

    // 4. Ashtakavarga (BAV & SAV)
    const ashtakavarga = AshtakavargaCalculator.calculate(chart.ascendant, chart.planets);

    // 5. Shadbala Strength
    const shadbala = ShadbalaCalculator.calculate(chart.ascendant, chart.planets, chart.houses);

    // 6. Advanced Transits & Sade Sati
    const transits = AdvancedTransitCalculator.calculateTransits(
      chart.ascendant,
      chart.planets,
      targetDate
    );

    // 7. Multi-Chart Correlated Insights
    const insights: Array<{
      id: string;
      title: string;
      category: string;
      observation: string;
      confidence: 'high' | 'medium';
      supportingDivisionalCharts?: string[];
    }> = [];

    // Synthesize D1 + D9 Dharma Alignment
    const sunD1 = chart.planets.find((p) => p.name === 'Sun')!;
    const sunD9 = divisionalCharts.D9.placements.find((p) => p.planet === 'Sun')!;
    if (sunD1.sign === sunD9.sign) {
      insights.push({
        id: 'vargottama_sun',
        title: 'Vargottama Sun (D1 & D9 Synchronization)',
        category: 'Soul Purpose & Authority',
        observation: `Sun is placed in ${sunD1.sign} in both Rashi (D1) and Navamsha (D9), granting extraordinary moral firmness, inner strength, and steadfast character.`,
        confidence: 'high',
        supportingDivisionalCharts: ['D1', 'D9'],
      });
    }

    // Synthesize D1 + D10 Career Alignment
    const lagnaLord = chart.houses[0].lord;
    const lagnaLordD10 = divisionalCharts.D10.placements.find((p) => p.planet === lagnaLord);
    if (lagnaLordD10 && [1, 4, 7, 10, 5, 9].includes(lagnaLordD10.house)) {
      insights.push({
        id: 'strong_d10_lagna_lord',
        title: 'Favorable Career Manifestation (D10 Dashamsha)',
        category: 'Career & Legacy',
        observation: `Lagna Lord (${lagnaLord}) is well-placed in the ${lagnaLordD10.house}th house in Dashamsha (D10), indicating high career agency and public achievement.`,
        confidence: 'high',
        supportingDivisionalCharts: ['D1', 'D10'],
      });
    }

    // Synthesize Active Dasha + Strongest Planet
    if (activeDasha.mahadasha === shadbala.strongestPlanet) {
      insights.push({
        id: 'active_mahadasha_prime_strength',
        title: `Empowered Mahadasha (${activeDasha.mahadasha})`,
        category: 'Timing of Fruition',
        observation: `The currently running Mahadasha Lord (${activeDasha.mahadasha}) holds the #1 Shadbala strength rank in your chart, empowering this period to deliver significant structural outcomes.`,
        confidence: 'high',
      });
    }

    // Sade Sati Status Insight
    if (transits.sadeSati.isActive) {
      insights.push({
        id: 'active_sade_sati',
        title: `Saturn Sade Sati: ${transits.sadeSati.phase}`,
        category: 'Transit Transformation',
        observation: transits.sadeSati.description,
        confidence: 'high',
      });
    }

    return {
      calculationVersion: this.ENGINE_VERSION,
      chart,
      divisionalCharts,
      dashas: {
        vimshottari,
        yogini,
        ashtottari,
        activeDasha,
      },
      yogas,
      ashtakavarga,
      shadbala,
      transits,
      insights,
      calculatedAt: new Date().toISOString(),
    };
  }

  /**
   * Phase 12: Classical Compatibility (Ashtakoota Milan)
   */
  public static calculateCompatibility(
    input1: BirthCalculationInput,
    input2: BirthCalculationInput
  ): CompatibilityResult {
    const chart1 = this.calculateBirthChart(input1);
    const chart2 = this.calculateBirthChart(input2);

    return CompatibilityService.calculateCompatibility(chart1, chart2);
  }
}
