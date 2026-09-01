import { Request, Response, NextFunction } from 'express';
import { AffiliateService } from '../services/affiliate.service';

export const registerAffiliate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const { partnerName, email, customCode } = req.body;

    const affiliate = await AffiliateService.registerAffiliate({
      userId,
      partnerName: partnerName || (req as any).user?.name || 'Partner',
      email: email || (req as any).user?.email,
      customCode,
    });

    res.status(201).json({
      success: true,
      message: 'Affiliate partner registered successfully',
      data: { affiliate },
    });
  } catch (error) {
    next(error);
  }
};

export const getAffiliateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user?.id;
    const affiliate = await AffiliateService.getAffiliateByUserId(userId);

    res.json({
      success: true,
      data: { affiliate },
    });
  } catch (error) {
    next(error);
  }
};

export const trackAffiliateClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { code } = req.params;
    const tracked = await AffiliateService.recordClick(code);

    res.json({
      success: true,
      data: { tracked },
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAffiliates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page, limit } = req.query;
    const result = await AffiliateService.getAllAffiliates(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
