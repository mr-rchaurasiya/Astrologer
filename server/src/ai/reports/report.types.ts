import { AIReportType, IAIReportSection } from '../../models/AIReport';

export interface GenerateReportInput {
  userId: string;
  profileId: string;
  reportType: AIReportType;
  personalization?: {
    language?: string;
    responseStyle?: 'CONCISE' | 'BALANCED' | 'DETAILED' | 'EXPERT' | 'BEGINNER';
  };
}

export interface SanitizedAIReportDTO {
  id: string;
  userId: string;
  profileId: string;
  reportType: AIReportType;
  title: string;
  summary: string;
  sections: IAIReportSection[];
  disclaimers: string[];
  calculationVersion: string;
  createdAt: string;
}
