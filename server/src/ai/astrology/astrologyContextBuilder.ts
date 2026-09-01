import { IBirthProfile } from '../../models/BirthProfile';
import {
  AstrologyChartOutput,
  AdvancedAstrologyAnalysis,
  DivisionalChartName,
  DivisionalChart,
  PlanetName,
} from '../../astrology/types/astrology';
import { PointContext } from '../types/ai';
import {
  AstrologyIntent,
  SelectiveAstrologyContext,
  GroundTruthFacts,
} from './astrologyContext.types';
import { IntentClassifier } from './intentClassifier';

export const ADVANCED_CONTEXT_VERSION = '2.0';

export class AdvancedAstrologyContextBuilder {
  /**
   * Selectively builds the rich astrology context tailored to the specific user intent and token budget.
   */
  public static buildSelectiveContext(params: {
    profile: IBirthProfile;
    analysis: AdvancedAstrologyAnalysis;
    userMessage: string;
    pointContext?: PointContext;
    userMemories?: any[];
    conversationSummary?: string;
    personalization?: any;
  }): SelectiveAstrologyContext {
    const { profile, analysis, userMessage, pointContext, userMemories, conversationSummary, personalization } = params;
    const chart = analysis.chart;

    // 1. Classify Intent
    const { intent, confidence } = IntentClassifier.classify(userMessage);

    // 2. Select Relevant Divisional Charts based on intent
    const selectedDivisions: Partial<Record<DivisionalChartName, DivisionalChart>> = {
      D1: analysis.divisionalCharts.D1,
    };

    switch (intent) {
      case 'CAREER':
        selectedDivisions.D10 = analysis.divisionalCharts.D10;
        break;
      case 'MARRIAGE':
      case 'RELATIONSHIP':
      case 'COMPATIBILITY':
        selectedDivisions.D9 = analysis.divisionalCharts.D9;
        break;
      case 'EDUCATION':
        selectedDivisions.D24 = analysis.divisionalCharts.D24;
        break;
      case 'FINANCE':
        selectedDivisions.D2 = analysis.divisionalCharts.D2;
        selectedDivisions.D10 = analysis.divisionalCharts.D10;
        break;
      case 'CHILDREN':
        selectedDivisions.D7 = analysis.divisionalCharts.D7;
        break;
      case 'SPIRITUALITY':
        selectedDivisions.D9 = analysis.divisionalCharts.D9;
        selectedDivisions.D20 = analysis.divisionalCharts.D20;
        break;
      case 'HEALTH':
        selectedDivisions.D30 = analysis.divisionalCharts.D30;
        break;
      case 'TRAVEL':
        selectedDivisions.D12 = analysis.divisionalCharts.D12;
        break;
      case 'DIVISIONAL_CHART':
        // Include common major charts
        selectedDivisions.D9 = analysis.divisionalCharts.D9;
        selectedDivisions.D10 = analysis.divisionalCharts.D10;
        selectedDivisions.D60 = analysis.divisionalCharts.D60;
        break;
      default:
        selectedDivisions.D9 = analysis.divisionalCharts.D9;
        selectedDivisions.D10 = analysis.divisionalCharts.D10;
        break;
    }

    // 3. Assemble Ground Truth Facts for strict fact-checking
    const moon = chart.planets.find((p) => p.name === 'Moon')!;
    const sun = chart.planets.find((p) => p.name === 'Sun')!;
    const lagnaLord = chart.houses[0].lord;

    const planetSigns: Record<PlanetName, any> = {} as any;
    const planetHouses: Record<PlanetName, number> = {} as any;
    const planetDignities: Record<PlanetName, any> = {} as any;

    chart.planets.forEach((p) => {
      planetSigns[p.name] = p.sign;
      planetHouses[p.name] = p.house;
      planetDignities[p.name] = p.dignity;
    });

    const groundTruth: GroundTruthFacts = {
      ascendantSign: chart.ascendant.sign,
      ascendantDegree: parseFloat(chart.ascendant.signDegree.toFixed(2)),
      ascendantLord: lagnaLord,
      moonSign: moon.sign,
      moonNakshatra: moon.nakshatra,
      sunSign: sun.sign,
      activeMahadasha: analysis.dashas.activeDasha.mahadasha,
      activeAntardasha: analysis.dashas.activeDasha.antardasha,
      activePratyantardasha: analysis.dashas.activeDasha.pratyantardasha,
      planetSigns,
      planetHouses,
      planetDignities,
      detectedYogaNames: analysis.yogas.map((y) => y.name),
      sadeSatiActive: analysis.transits.sadeSati.isActive,
      sadeSatiPhase: analysis.transits.sadeSati.phase,
      strongestPlanet: analysis.shadbala.strongestPlanet,
      weakestPlanet: analysis.shadbala.weakestPlanet,
      totalSavBindus: analysis.ashtakavarga.totalSavBindus,
    };

    // 4. Filter Relevant Yogas based on intent
    const relevantYogas = analysis.yogas.filter((y) => {
      if (intent === 'CAREER' || intent === 'FINANCE') {
        return ['Raja Yoga', 'Dhana Yoga', 'Pancha Mahapurusha'].includes(y.category);
      }
      if (intent === 'SPIRITUALITY') {
        return ['Raja Yoga', 'Neecha Bhanga', 'Special Combinations'].includes(y.category);
      }
      return y.strength === 'High' || y.strength === 'Medium';
    });

    return {
      contextVersion: ADVANCED_CONTEXT_VERSION,
      intent,
      intentConfidence: confidence,
      profile: {
        name: profile.name,
        relationship: profile.relationship,
        dateOfBirth: profile.dateOfBirth,
        timeOfBirth: profile.timeOfBirth,
        placeName: profile.placeName,
        latitude: profile.latitude,
        longitude: profile.longitude,
        timezone: profile.timezone,
      },
      ayanamsa: {
        system: chart.ayanamsa.system,
        formatted: chart.ayanamsa.formatted,
      },
      ascendant: {
        sign: chart.ascendant.sign,
        degree: parseFloat(chart.ascendant.signDegree.toFixed(2)),
        nakshatra: chart.ascendant.nakshatra,
        pada: chart.ascendant.pada,
        lord: lagnaLord,
      },
      relevantPlanets: chart.planets.map((p) => ({
        name: p.name,
        sign: p.sign,
        degree: parseFloat(p.signDegree.toFixed(2)),
        house: p.house,
        nakshatra: p.nakshatra,
        pada: p.pada,
        retrograde: p.retrograde,
        combust: p.combust,
        dignity: p.dignity,
      })),
      relevantHouses: chart.houses.map((h) => ({
        houseNumber: h.houseNumber,
        sign: h.sign,
        lord: h.lord,
        occupants: h.occupants,
      })),
      divisionalCharts: selectedDivisions,
      activeDasha: analysis.dashas.activeDasha,
      relevantYogas,
      shadbalaSummary: {
        strongestPlanet: analysis.shadbala.strongestPlanet,
        weakestPlanet: analysis.shadbala.weakestPlanet,
        scores: Object.entries(analysis.shadbala.scores).reduce((acc, [p, s]) => {
          acc[p] = {
            totalRupas: s.totalRupas,
            rank: s.rank,
            relativeStrengthRatio: s.relativeStrengthRatio,
          };
          return acc;
        }, {} as Record<string, any>),
      },
      ashtakavargaSummary: {
        houseBindus: analysis.ashtakavarga.houseBindus,
        totalSavBindus: analysis.ashtakavarga.totalSavBindus,
      },
      transitSummary: {
        sadeSati: analysis.transits.sadeSati,
        isKantakaShani: analysis.transits.isKantakaShani,
        isAshtamaShani: analysis.transits.isAshtamaShani,
        isJupiterAuspicious: analysis.transits.isJupiterAuspicious,
        activeEvents: analysis.transits.activeEvents.slice(0, 3),
      },
      highlightedPoint: pointContext
        ? {
            type: pointContext.type,
            id: pointContext.id,
            details: pointContext.label || pointContext.id,
          }
        : undefined,
      userMemories,
      personalization,
      conversationSummary,
      groundTruth,
    };
  }
}
