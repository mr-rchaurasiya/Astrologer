import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BirthProfile } from '../models/BirthProfile';
import { AstrologyService, BirthCalculationInput } from '../astrology/service/astrology.service';
import { calculatePanchang } from '../astrology/panchang/panchang';
import { calculateTransits } from '../astrology/transit/transits';
import { LifeCurveService } from '../astrology/lifeCurve/lifeCurve.service';
import { calculateTransitTimeline } from '../astrology/transit/transitEvents';
import {
  calculateChartSchema,
  panchangQuerySchema,
  transitQuerySchema,
  compatibilitySchema,
} from '../validators/astrology.validator';
import { AppError } from '../middleware/errorHandler';
import { getCacheProvider } from '../cache';

/**
 * Helper to fetch and verify birth profile ownership
 */
const fetchOwnedProfile = async (userId: string, profileId: string) => {
  if (!mongoose.Types.ObjectId.isValid(profileId)) {
    throw new AppError('Invalid profile ID format.', 400, 'INVALID_ID');
  }

  const profile = await BirthProfile.findOne({
    _id: new mongoose.Types.ObjectId(profileId),
    userId,
  });

  if (!profile) {
    throw new AppError('Birth profile not found.', 404, 'PROFILE_NOT_FOUND');
  }

  return profile;
};

const mapProfileToInput = (profile: any): BirthCalculationInput => ({
  dateOfBirth: profile.dateOfBirth,
  timeOfBirth: profile.timeOfBirth,
  latitude: profile.latitude,
  longitude: profile.longitude,
  timezone: profile.timezone,
  timezoneOffset: profile.timezoneOffset,
});

export const calculateChart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = calculateChartSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { profileId, dateOfBirth, timeOfBirth, latitude, longitude, timezone, timezoneOffset } =
      parseResult.data;

    let calculationInput: BirthCalculationInput;

    if (profileId) {
      if (!req.user) {
        return next(new AppError('Authentication required to calculate for a saved profile.', 401, 'UNAUTHORIZED'));
      }

      const profile = await fetchOwnedProfile(req.user.id, profileId);
      calculationInput = mapProfileToInput(profile);
    } else {
      calculationInput = {
        dateOfBirth: dateOfBirth!,
        timeOfBirth: timeOfBirth!,
        latitude: latitude!,
        longitude: longitude!,
        timezone: timezone || 'Asia/Kolkata',
        timezoneOffset: timezoneOffset !== undefined ? timezoneOffset : 5.5,
      };
    }

    const chart = AstrologyService.calculateBirthChart(calculationInput);

    res.status(200).json({
      success: true,
      message: 'Vedic astrology chart calculated successfully',
      data: {
        chart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getChartByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const chart = AstrologyService.calculateBirthChart(mapProfileToInput(profile));

    res.status(200).json({
      success: true,
      message: 'Birth chart retrieved successfully',
      data: {
        profile,
        chart,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDashaByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile));

    res.status(200).json({
      success: true,
      message: 'Dasha periods retrieved successfully',
      data: {
        profileId: profile._id,
        dashas: {
          ...analysis.dashas.vimshottari,
          vimshottari: analysis.dashas.vimshottari,
          yogini: analysis.dashas.yogini,
          ashtottari: analysis.dashas.ashtottari,
          activeDasha: analysis.dashas.activeDasha,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyPanchang = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = panchangQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { date, latitude, longitude, timezoneOffset } = parseResult.data;
    const targetDate = date ? new Date(`${date}T12:00:00.000Z`) : new Date();

    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: targetDate.toISOString().split('T')[0],
      timeOfBirth: '12:00:00',
      latitude,
      longitude,
      timezone: 'UTC',
      timezoneOffset,
    });

    const sun = chart.planets.find((p) => p.name === 'Sun')!;
    const moon = chart.planets.find((p) => p.name === 'Moon')!;

    const panchang = calculatePanchang(targetDate, sun.longitude, moon.longitude, latitude, longitude);

    res.status(200).json({
      success: true,
      message: 'Daily Panchang calculated successfully',
      data: {
        panchang,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentTransits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = transitQuerySchema.safeParse(req.query);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { date, latitude, longitude } = parseResult.data;
    const targetDate = date ? new Date(date) : new Date();

    const transits = calculateTransits(targetDate, latitude, longitude);

    res.status(200).json({
      success: true,
      message: 'Current planetary transits calculated successfully',
      data: {
        transits,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getLifeCurve = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const { profileId } = req.params;
    const startYear = req.query.startYear ? parseInt(req.query.startYear as string, 10) : undefined;
    const endYear = req.query.endYear ? parseInt(req.query.endYear as string, 10) : undefined;
    const resolution = (req.query.resolution as any) || 'year';

    const result = await LifeCurveService.getLifeCurve(req.user.id, profileId, {
      startYear,
      endYear,
      resolution,
    });

    res.status(200).json({
      success: true,
      message: 'Life curve analytics calculated successfully',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransitTimeline = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profileId = (req.query.profileId as string) || '';
    const profile = await fetchOwnedProfile(req.user.id, profileId);
    const chart = AstrologyService.calculateBirthChart(mapProfileToInput(profile));

    const daysAhead = req.query.daysAhead ? parseInt(req.query.daysAhead as string, 10) : 365;

    const timeline = calculateTransitTimeline(profileId, chart, {
      startDate: new Date(),
      daysAhead: Math.min(daysAhead, 730),
    });

    res.status(200).json({
      success: true,
      message: 'Transit timeline calculated successfully',
      data: timeline,
    });
  } catch (error) {
    next(error);
  }
};

export const getDailyTransits = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profileId = (req.query.profileId as string) || '';
    const profile = await fetchOwnedProfile(req.user.id, profileId);

    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const targetDate = new Date(`${dateStr}T12:00:00.000Z`);

    const transits = calculateTransits(targetDate, profile.latitude, profile.longitude);

    res.status(200).json({
      success: true,
      message: 'Daily transit facts calculated successfully',
      data: {
        profileId,
        date: dateStr,
        transits,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --------------------------------------------------------------------------
// Phase 12 Endpoints: Divisional, Yogas, Ashtakavarga, Strength, Compatibility
// --------------------------------------------------------------------------

/**
 * GET /api/v1/astrology/divisional-charts/:profileId
 */
export const getDivisionalChartsByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile));

    res.status(200).json({
      success: true,
      message: 'All 16 Shodashavarga divisional charts calculated successfully',
      data: {
        profileId: profile._id,
        divisionalCharts: analysis.divisionalCharts,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/astrology/yogas/:profileId
 */
export const getYogasByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile));

    res.status(200).json({
      success: true,
      message: 'Classical Vedic Yogas evaluated successfully',
      data: {
        profileId: profile._id,
        yogas: analysis.yogas,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/astrology/ashtakavarga/:profileId
 */
export const getAshtakavargaByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile));

    res.status(200).json({
      success: true,
      message: 'Ashtakavarga BAV and SAV matrices calculated successfully',
      data: {
        profileId: profile._id,
        ashtakavarga: analysis.ashtakavarga,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/astrology/strength/:profileId
 */
export const getStrengthByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile));

    res.status(200).json({
      success: true,
      message: 'Shadbala planetary strengths calculated successfully',
      data: {
        profileId: profile._id,
        shadbala: analysis.shadbala,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/astrology/transits/advanced/:profileId
 */
export const getAdvancedTransitsByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const dateStr = (req.query.date as string) || new Date().toISOString();
    const targetDate = new Date(dateStr);

    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile), targetDate);

    res.status(200).json({
      success: true,
      message: 'Advanced Gochar transits and Sade Sati status calculated successfully',
      data: {
        profileId: profile._id,
        transits: analysis.transits,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/astrology/compatibility
 */
export const calculateCompatibilityHandler = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = compatibilitySchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const { profile1Id, profile2Id, profile1, profile2 } = parseResult.data;

    let input1: BirthCalculationInput;
    let input2: BirthCalculationInput;

    if (profile1Id && profile2Id) {
      if (!req.user) {
        return next(new AppError('Authentication required to compare saved profiles.', 401, 'UNAUTHORIZED'));
      }

      const p1 = await fetchOwnedProfile(req.user.id, profile1Id);
      const p2 = await fetchOwnedProfile(req.user.id, profile2Id);

      input1 = mapProfileToInput(p1);
      input2 = mapProfileToInput(p2);
    } else {
      input1 = profile1!;
      input2 = profile2!;
    }

    const compatibility = AstrologyService.calculateCompatibility(input1, input2);

    res.status(200).json({
      success: true,
      message: 'Ashtakoota compatibility analysis calculated successfully',
      data: {
        compatibility,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/astrology/advanced-analysis/:profileId
 */
export const getAdvancedAnalysisByProfileId = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profile = await fetchOwnedProfile(req.user.id, req.params.profileId);
    const dateStr = (req.query.date as string) || new Date().toISOString().split('T')[0];
    const targetDate = new Date(`${dateStr}T12:00:00.000Z`);

    const cache = getCacheProvider();
    const cacheKey = `astrology:adv:${profile._id}:${dateStr}`;

    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({
        success: true,
        message: 'Advanced analysis retrieved from cache',
        data: cached,
      });
    }

    const analysis = AstrologyService.calculateAdvancedAnalysis(mapProfileToInput(profile), targetDate);

    // Cache for 24 hours
    await cache.set(cacheKey, analysis, 86400);

    res.status(200).json({
      success: true,
      message: 'Complete advanced astrology analysis calculated successfully',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};
