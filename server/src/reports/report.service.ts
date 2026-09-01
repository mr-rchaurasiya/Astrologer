import crypto from 'crypto';
import { Readable } from 'stream';
import { Report, IReport } from '../models/Report';
import { BirthProfile } from '../models/BirthProfile';
import { AstrologyService } from '../astrology/service/astrology.service';
import { calculateTransits } from '../astrology/transit/transits';
import { KundliPdfGenerator } from './pdfGenerator';
import { getStorageProvider } from '../storage/provider';
import { GenerateKundliReportOptions } from './report.types';
import { AuditLog } from '../models/AuditLog';

export class ReportService {
  public static async generateKundliReport(options: GenerateKundliReportOptions): Promise<IReport> {
    const { userId, profileId, language = 'en', sections } = options;

    // 1. Verify user profile ownership
    const profile = await BirthProfile.findById(profileId);
    if (!profile) {
      throw new Error(`Birth profile not found: ${profileId}`);
    }

    if (profile.userId.toString() !== userId) {
      throw new Error('Unauthorized access to birth profile for report generation.');
    }

    // 2. Compute Authoritative Astrological Calculations
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone,
      timezoneOffset: profile.timezoneOffset,
    });

    const transits = calculateTransits(
      new Date(),
      profile.latitude,
      profile.longitude
    );

    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // 3. Generate Vector PDF Buffer
    const pdfBuffer = await KundliPdfGenerator.generate({
      profile,
      chart,
      dasha: chart.dashas,
      panchang: chart.panchang,
      transits,
      language,
      generatedDate,
    });

    // 4. Save to Storage
    const storageKey = `report_${profileId}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.pdf`;
    const storage = getStorageProvider();

    await storage.upload({
      storageKey,
      contentType: 'application/pdf',
      buffer: pdfBuffer,
    });

    // 5. Persist Report Record
    const report = await Report.create({
      userId,
      profileId,
      type: 'kundli_full',
      title: `${profile.name} - Complete Kundli Dossier`,
      language,
      status: 'completed',
      fileName: `${profile.name.replace(/\s+/g, '_')}_Kundli_Report.pdf`,
      storageKey,
      fileSize: pdfBuffer.length,
      sections: sections || ['cover', 'placements', 'charts', 'dasha', 'panchang', 'transits'],
      generatedAt: new Date(),
    });

    await AuditLog.create({
      userId,
      action: 'REPORT_GENERATED',
      resource: 'Report',
      resourceId: report.id,
      metadata: { profileId, fileName: report.fileName, fileSize: pdfBuffer.length },
    });

    return report;
  }

  public static async listUserReports(userId: string): Promise<IReport[]> {
    return Report.find({ userId }).sort({ createdAt: -1 });
  }

  public static async getReportById(userId: string, reportId: string): Promise<IReport> {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error(`Report not found: ${reportId}`);
    }

    if (report.userId.toString() !== userId) {
      throw new Error('Unauthorized access to report.');
    }

    return report;
  }

  public static async getReportDownloadStream(
    userId: string,
    reportId: string
  ): Promise<{ stream: Readable; report: IReport; sizeBytes: number; contentType: string }> {
    const report = await this.getReportById(userId, reportId);
    const storage = getStorageProvider();

    const file = await storage.download(report.storageKey);

    await AuditLog.create({
      userId,
      action: 'REPORT_DOWNLOADED',
      resource: 'Report',
      resourceId: report.id,
      metadata: { fileName: report.fileName },
    });

    return {
      stream: file.stream,
      report,
      sizeBytes: file.sizeBytes,
      contentType: file.contentType,
    };
  }

  public static async deleteReport(userId: string, reportId: string): Promise<boolean> {
    const report = await this.getReportById(userId, reportId);
    const storage = getStorageProvider();

    await storage.delete(report.storageKey);
    await Report.findByIdAndDelete(reportId);

    return true;
  }
}
