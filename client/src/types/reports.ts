export type ReportLanguage = 'en' | 'hi';
export type ReportStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ReportRecord {
  id: string;
  userId: string;
  profileId: string;
  type: string;
  title: string;
  language: ReportLanguage;
  status: ReportStatus;
  fileName: string;
  storageKey: string;
  fileSize?: number;
  sections?: string[];
  generatedAt?: string;
  createdAt: string;
}

export interface GenerateReportRequest {
  profileId: string;
  language?: ReportLanguage;
  sections?: string[];
}
