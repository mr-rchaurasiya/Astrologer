import { AstrologyChartOutput, VimshottariDashaTree, PanchangInfo } from '../astrology/types/astrology';
import { TransitCalculationResult } from '../astrology/transit/transits';
import { IBirthProfile } from '../models/BirthProfile';

export type ReportLanguage = 'en' | 'hi';

export interface GenerateKundliReportOptions {
  userId: string;
  profileId: string;
  language?: ReportLanguage;
  sections?: string[];
}

export interface KundliReportData {
  profile: IBirthProfile;
  chart: AstrologyChartOutput;
  dasha: VimshottariDashaTree;
  panchang: PanchangInfo;
  transits: TransitCalculationResult;
  language: ReportLanguage;
  generatedDate: string;
}
