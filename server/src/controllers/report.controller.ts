import { Request, Response, NextFunction } from 'express';
import { ReportService } from '../reports/report.service';

export const generateKundliReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { profileId, language = 'en', sections } = req.body;

    if (!profileId) {
      return res.status(400).json({
        success: false,
        message: 'profileId is required to generate a horoscope report',
      });
    }

    const report = await ReportService.generateKundliReport({
      userId,
      profileId,
      language,
      sections,
    });

    res.status(201).json({
      success: true,
      message: 'Kundli PDF report generated successfully',
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const listReports = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const reports = await ReportService.listUserReports(userId);

    res.status(200).json({
      success: true,
      data: {
        reports,
        count: reports.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const report = await ReportService.getReportById(userId, id);

    res.status(200).json({
      success: true,
      data: {
        report,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const { stream, report, sizeBytes, contentType } = await ReportService.getReportDownloadStream(userId, id);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', sizeBytes);
    res.setHeader('Content-Disposition', `attachment; filename="${report.fileName}"`);

    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

export const deleteReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await ReportService.deleteReport(userId, id);

    res.status(200).json({
      success: true,
      message: 'Report deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
