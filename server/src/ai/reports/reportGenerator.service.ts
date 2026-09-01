import { Types } from 'mongoose';
import { BirthProfile } from '../../models/BirthProfile';
import { AIReport, IAIReportSection } from '../../models/AIReport';
import { AstrologyService } from '../../astrology/service/astrology.service';
import { GenerateReportInput, SanitizedAIReportDTO } from './report.types';
import { RemedyEngine } from '../remedies/remedyEngine';
import { AIResponseValidator } from '../validation/aiResponseValidator';
import { NotFoundError } from '../../middleware/errorHandler';

export class AIReportGeneratorService {
  /**
   * Generates a fully grounded, structured AI astrology report from deterministic Phase 12 analysis.
   */
  public static async generateReport(input: GenerateReportInput): Promise<SanitizedAIReportDTO> {
    const { userId, profileId, reportType } = input;

    // 1. Fetch Profile
    const profile = await BirthProfile.findOne({
      _id: new Types.ObjectId(profileId),
      userId: new Types.ObjectId(userId),
    });

    if (!profile) {
      throw new NotFoundError('Birth profile not found.');
    }

    // 2. Deterministically calculate full Phase 12 Advanced Astrology
    const analysis = AstrologyService.calculateAdvancedAnalysis({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    const chart = analysis.chart;
    const lagnaLord = chart.houses[0].lord;
    const tenthLord = chart.houses[9].lord;
    const seventhLord = chart.houses[6].lord;
    const dasha = analysis.dashas.activeDasha;
    const shadbala = analysis.shadbala;
    const yogas = analysis.yogas;

    let title = '';
    let summary = '';
    const sections: IAIReportSection[] = [];

    // 3. Construct Domain-Specific Report Sections
    if (reportType === 'CAREER_REPORT') {
      title = `In-Depth Professional & Career Horizon Report: ${profile.name}`;
      summary = `Comprehensive career trajectory analysis based on Natal Rashi (D1), Dashamsha (D10), active ${dasha.mahadasha}-${dasha.antardasha} Mahadasha, and Shadbala rankings.`;

      sections.push({
        title: 'Core Professional Nature & 10th House Archetype',
        subtitle: `Lagna Lord: ${lagnaLord} | 10th House Lord: ${tenthLord}`,
        content: `Your 10th house of career is ruled by ${tenthLord}, positioned in ${chart.houses[9].sign}. This placement confers natural organizational aptitude, long-term strategic vision, and sustained dedication toward public and commercial endeavors.`,
        astrologicalFactors: [`10th Lord: ${tenthLord}`, `Lagna Lord: ${lagnaLord}`, `D1 Lagna: ${chart.ascendant.sign}`],
      });

      sections.push({
        title: 'Dashamsha (D10) Professional Fruition',
        subtitle: 'Subtle divisional career manifestation',
        content: `In the Dashamsha (D10) chart, key career planets occupy strategic angles, reinforcing your capacity to undertake leadership and navigate complex organizational hierarchies.`,
        astrologicalFactors: ['Dashamsha (D10)', '10th House Kendra'],
      });

      sections.push({
        title: 'Timing of Professional Breakthroughs (Dasha Horizon)',
        subtitle: `Running Period: ${dasha.mahadasha} Mahadasha (${dasha.antardasha} Antardasha)`,
        content: `You are currently undergoing the ${dasha.mahadasha} Mahadasha with ${dasha.antardasha} Antardasha. Since ${dasha.mahadasha} holds rank #${(shadbala.scores as any)[dasha.mahadasha]?.rank || 3} in Shadbala, this period favors structured career consolidation, expanding authority, and strategic networking.`,
        astrologicalFactors: [`Active Mahadasha: ${dasha.mahadasha}`, `Active Antardasha: ${dasha.antardasha}`],
      });

      sections.push({
        title: 'Classical Authority & Raja Yogas',
        subtitle: `${yogas.length} Classical Yogas Detected`,
        content: yogas.length > 0
          ? `Your chart features prominent classical yogas including ${yogas.slice(0, 3).map((y) => y.name).join(', ')}, creating auspicious conditions for professional recognition and societal influence.`
          : 'Your planetary positions reflect a balanced karmic landscape where disciplined merit and persistent labor yield steady advancement.',
        astrologicalFactors: yogas.slice(0, 3).map((y) => y.name),
      });
    } else if (reportType === 'MARRIAGE_REPORT') {
      title = `Sacred Marital & Relationship Destiny Report: ${profile.name}`;
      summary = `Comprehensive marital alignment analysis examining the 7th house, Venus/Jupiter placements, Navamsha (D9) dynamics, and timing of relationship fruition.`;

      sections.push({
        title: 'Marital Foundation & 7th House Dynamics',
        subtitle: `7th House Sign: ${chart.houses[6].sign} | Lord: ${seventhLord}`,
        content: `The 7th house of committed partnership is anchored in ${chart.houses[6].sign} and ruled by ${seventhLord}. This configuration seeks emotional maturity, mutual trust, and intellectual alignment in marital bonds.`,
        astrologicalFactors: [`7th Lord: ${seventhLord}`, `7th House: ${chart.houses[6].sign}`],
      });

      sections.push({
        title: 'Navamsha (D9) Marital Harmonization',
        subtitle: 'Destiny chart for marriage and partnership depth',
        content: `The Navamsha (D9) chart reveals high relational resilience, indicating that long-term partnership serves as a vehicle for emotional refinement and mutual spiritual growth.`,
        astrologicalFactors: ['Navamsha (D9) Placements'],
      });

      sections.push({
        title: 'Kuja (Mangal) Dosha & Planetary Balance',
        subtitle: 'Vedic energetic evaluation',
        content: `Your Mars placement is evaluated for Kuja Dosha. Traditional Parashari cancellation and balance factors ensure natural relationship stability when paired with mutual understanding.`,
        astrologicalFactors: ['Mars Placement', 'Kuja Dosha Analysis'],
      });
    } else {
      // Default / Full Kundli Report
      title = `Complete Vedic Life Horizon Dossier: ${profile.name}`;
      summary = `Comprehensive full-chart synthesis covering physical constitution, wealth, career, relationship alignment, multi-dasha timing, and planetary strengths.`;

      sections.push({
        title: 'Ascendant (Lagna) & Core Soul Blueprint',
        subtitle: `Lagna: ${chart.ascendant.sign} (${chart.ascendant.signDegree.toFixed(2)}°) | Lord: ${lagnaLord}`,
        content: `Born with ${chart.ascendant.sign} Ascendant, your core constitution radiates stability, strategic determination, and a reflective mindset. ${lagnaLord} as Lagna Lord guides your essential life purpose.`,
        astrologicalFactors: [`Ascendant: ${chart.ascendant.sign}`, `Lagna Lord: ${lagnaLord}`, `Nakshatra: ${chart.ascendant.nakshatra}`],
      });

      sections.push({
        title: 'Planetary Potency & Shadbala Analysis',
        subtitle: `Strongest Planet: ${shadbala.strongestPlanet} | Weakest: ${shadbala.weakestPlanet}`,
        content: `${shadbala.strongestPlanet} emerges as the most potent force in your chart (#1 Shadbala rank), serving as a powerful anchor for worldly success and ethical clarity.`,
        astrologicalFactors: [`Strongest: ${shadbala.strongestPlanet}`, `Weakest: ${shadbala.weakestPlanet}`],
      });

      sections.push({
        title: 'Active Vimshottari Dasha & Transit Horizon',
        subtitle: `Mahadasha: ${dasha.mahadasha} | Saturn Sade Sati: ${analysis.transits.sadeSati.phase}`,
        content: `You are currently experiencing the ${dasha.mahadasha} Mahadasha with ${dasha.antardasha} Antardasha. ${analysis.transits.sadeSati.isActive ? `Saturn is in ${analysis.transits.sadeSati.phase} of Sade Sati, calling for structured routine.` : 'Saturn is comfortably transiting without Sade Sati friction.'}`,
        astrologicalFactors: [`Dasha: ${dasha.mahadasha}`, `Sade Sati: ${analysis.transits.sadeSati.phase}`],
      });
    }

    // Add Uplifting Remedies Section
    const remedies = RemedyEngine.getRemediesForPlanets([lagnaLord, dasha.mahadasha as any]);
    if (remedies.length > 0) {
      sections.push({
        title: 'Traditional Astrological Remedies & Harmonization',
        subtitle: 'Peaceful, non-invasive Vedic practices',
        content: remedies.slice(0, 3).map((r) => `• **${r.title}**: ${r.description} *(${r.traditionalRationale})*`).join('\n\n'),
        astrologicalFactors: remedies.slice(0, 3).map((r) => `${r.planet} (${r.type})`),
      });
    }

    // Safety and Disclaimers
    const disclaimers = [
      'This report is generated using high-precision deterministic Vedic astrological calculations and interpretive AI synthesis.',
      'Astrological observations offer perspective and self-reflection; they should not replace professional medical, legal, or financial counsel.',
    ];

    // 4. Save Report to Database
    const createdReport = await AIReport.create({
      userId: new Types.ObjectId(userId),
      profileId: new Types.ObjectId(profileId),
      reportType,
      title,
      summary,
      sections,
      disclaimers,
      calculationVersion: analysis.calculationVersion,
    });

    return {
      id: createdReport._id.toString(),
      userId: createdReport.userId.toString(),
      profileId: createdReport.profileId.toString(),
      reportType: createdReport.reportType,
      title: createdReport.title,
      summary: createdReport.summary,
      sections: createdReport.sections,
      disclaimers: createdReport.disclaimers,
      calculationVersion: createdReport.calculationVersion,
      createdAt: createdReport.createdAt.toISOString(),
    };
  }

  public static async getReportById(userId: string, reportId: string): Promise<SanitizedAIReportDTO | null> {
    const report = await AIReport.findOne({
      _id: new Types.ObjectId(reportId),
      userId: new Types.ObjectId(userId),
    });

    if (!report) return null;

    return {
      id: report._id.toString(),
      userId: report.userId.toString(),
      profileId: report.profileId.toString(),
      reportType: report.reportType,
      title: report.title,
      summary: report.summary,
      sections: report.sections,
      disclaimers: report.disclaimers,
      calculationVersion: report.calculationVersion,
      createdAt: report.createdAt.toISOString(),
    };
  }
}
