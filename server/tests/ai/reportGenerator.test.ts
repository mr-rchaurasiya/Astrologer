import { describe, it, expect, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import '../setup';
import { AIReportGeneratorService } from '../../src/ai/reports/reportGenerator.service';
import { BirthProfile } from '../../src/models/BirthProfile';
import { AIReport } from '../../src/models/AIReport';

describe('Phase 13: Structured AI Report Generator Suite', () => {
  const userId = new mongoose.Types.ObjectId().toString();
  let profileId: string;

  beforeEach(async () => {
    await AIReport.deleteMany({ userId });
    await BirthProfile.deleteMany({ userId });

    const prof = await BirthProfile.create({
      userId: new mongoose.Types.ObjectId(userId),
      name: 'Rohan Verma',
      gender: 'male',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '12:00:00',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata',
      timezoneOffset: 5.5,
      placeName: 'New Delhi',
      isPrimary: true,
    });
    profileId = prof._id.toString();
  });

  it('generates a multi-section structured Career Report grounded in Phase 12 calculations', async () => {
    const report = await AIReportGeneratorService.generateReport({
      userId,
      profileId,
      reportType: 'CAREER_REPORT',
    });

    expect(report.id).toBeDefined();
    expect(report.reportType).toBe('CAREER_REPORT');
    expect(report.title).toContain('Career Horizon Report');
    expect(report.sections.length).toBeGreaterThanOrEqual(4);
    expect(report.calculationVersion).toBe('2.0.0');

    // Section 1 checks
    expect(report.sections[0].title).toContain('Professional');
    expect(report.sections[0].astrologicalFactors.length).toBeGreaterThan(0);
  });

  it('generates Marriage Report with 7th house and Navamsha factors', async () => {
    const report = await AIReportGeneratorService.generateReport({
      userId,
      profileId,
      reportType: 'MARRIAGE_REPORT',
    });

    expect(report.reportType).toBe('MARRIAGE_REPORT');
    expect(report.sections.some((s) => s.title.includes('Navamsha'))).toBe(true);
    expect(report.disclaimers.length).toBeGreaterThan(0);
  });

  it('retrieves saved report with user isolation check', async () => {
    const report = await AIReportGeneratorService.generateReport({
      userId,
      profileId,
      reportType: 'FULL_KUNDLI_REPORT',
    });

    const retrieved = await AIReportGeneratorService.getReportById(userId, report.id);
    expect(retrieved).not.toBeNull();
    expect(retrieved!.id).toBe(report.id);

    // Another user cannot access
    const anotherUser = new mongoose.Types.ObjectId().toString();
    const unauthorized = await AIReportGeneratorService.getReportById(anotherUser, report.id);
    expect(unauthorized).toBeNull();
  });
});
