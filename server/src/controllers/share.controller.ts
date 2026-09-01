import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { SharedKundli } from '../models/SharedKundli';
import { BirthProfile } from '../models/BirthProfile';
import { AstrologyService } from '../astrology/service/astrology.service';
import { sendSuccess, sendError } from '../utils/response';

export const createSharedKundli = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { profileId, title, expiresInDays = 7, allowedSections } = req.body;

    if (!profileId || !mongoose.Types.ObjectId.isValid(profileId)) {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid birth profile ID format', 400);
    }

    const profile = await BirthProfile.findOne({ _id: profileId, userId });
    if (!profile) {
      return sendError(res, 'NOT_FOUND', 'Birth profile not found or not owned by user', 404);
    }

    const days = Math.min(Math.max(parseInt(expiresInDays, 10) || 7, 1), 90);
    const expiresAt = new Date(Date.now() + days * 24 * 3600 * 1000);
    const token = crypto.randomBytes(24).toString('hex');

    const share = await SharedKundli.create({
      token,
      userId,
      profileId: profile._id,
      title: title || `${profile.name}'s Kundli Horoscope`,
      allowedSections: allowedSections || ['chart', 'planets', 'houses', 'dasha', 'panchang'],
      expiresAt,
    });

    return sendSuccess(
      res,
      {
        token: share.token,
        shareUrl: `/shared/kundli/${share.token}`,
        expiresAt: share.expiresAt,
        title: share.title,
        allowedSections: share.allowedSections,
      },
      'Share link generated successfully',
      201
    );
  } catch (error) {
    next(error);
  }
};

export const getPublicSharedKundli = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token } = req.params;

    if (!token || typeof token !== 'string') {
      return sendError(res, 'VALIDATION_ERROR', 'Invalid share token', 400);
    }

    const share = await SharedKundli.findOne({ token, isRevoked: false });
    if (!share) {
      return sendError(res, 'NOT_FOUND', 'Shared chart not found or has been revoked', 404);
    }

    if (new Date() > share.expiresAt) {
      return sendError(res, 'LINK_EXPIRED', 'This shared chart link has expired', 410);
    }

    // Increment view count safely
    share.viewCount = (share.viewCount || 0) + 1;
    await share.save();

    const profile = await BirthProfile.findById(share.profileId);
    if (!profile) {
      return sendError(res, 'NOT_FOUND', 'Underlying birth profile is no longer available', 404);
    }

    // Calculate deterministic chart
    const chart = AstrologyService.calculateBirthChart({
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      latitude: profile.latitude,
      longitude: profile.longitude,
      timezone: profile.timezone || 'Asia/Kolkata',
      timezoneOffset: profile.timezoneOffset !== undefined ? profile.timezoneOffset : 5.5,
    });

    // Strictly sanitized public payload: ZERO user IDs, ZERO MongoDB IDs, ZERO private memory or chat
    const sanitizedPayload = {
      title: share.title,
      nativeName: profile.name,
      placeName: profile.placeName,
      dateOfBirth: profile.dateOfBirth,
      timeOfBirth: profile.timeOfBirth,
      gender: profile.gender,
      expiresAt: share.expiresAt,
      allowedSections: share.allowedSections,
      chart: {
        ayanamsa: chart.ayanamsa,
        ascendant: chart.ascendant,
        planets: chart.planets,
        houses: chart.houses,
        divisionalCharts: chart.divisionalCharts,
        dashas: chart.dashas,
        panchang: chart.panchang,
      },
    };

    return sendSuccess(res, sanitizedPayload, 'Public shared Kundli retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const getMySharedLinks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const links = await SharedKundli.find({ userId, isRevoked: false }).sort({ createdAt: -1 });

    return sendSuccess(
      res,
      {
        links: links.map((l) => ({
          id: l.id,
          token: l.token,
          title: l.title,
          expiresAt: l.expiresAt,
          viewCount: l.viewCount,
          createdAt: l.createdAt,
        })),
      },
      'User shared links retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const revokeSharedLink = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const share = await SharedKundli.findOne({ _id: id, userId });
    if (!share) {
      return sendError(res, 'NOT_FOUND', 'Shared link not found', 404);
    }

    share.isRevoked = true;
    await share.save();

    return sendSuccess(res, { revoked: true }, 'Shared link revoked');
  } catch (error) {
    next(error);
  }
};
