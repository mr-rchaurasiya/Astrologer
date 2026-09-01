import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { BirthProfile } from '../models/BirthProfile';
import { createProfileSchema, updateProfileSchema } from '../validators/profile.validator';
import { AppError } from '../middleware/errorHandler';
import { recordAuditLog } from '../utils/audit';

export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const parseResult = createProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const profileData = parseResult.data;
    const userId = req.user.id;

    // Check existing profile count for this user
    const existingCount = await BirthProfile.countDocuments({ userId });
    
    // If it's the first profile or explicitly marked primary, ensure isPrimary logic
    let shouldBePrimary = profileData.isPrimary || existingCount === 0;

    if (shouldBePrimary) {
      // Unset previous primary profile if any
      await BirthProfile.updateMany({ userId, isPrimary: true }, { isPrimary: false });
    }

    const profile = await BirthProfile.create({
      ...profileData,
      userId: new mongoose.Types.ObjectId(userId),
      isPrimary: shouldBePrimary,
    });

    await recordAuditLog('profile_created', req, userId, { profileId: profile._id.toString() });

    res.status(201).json({
      success: true,
      message: 'Birth profile created successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const profiles = await BirthProfile.find({ userId: req.user.id })
      .sort({ isPrimary: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Birth profiles retrieved successfully',
      data: {
        profiles,
        count: profiles.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid profile ID format.', 400, 'INVALID_ID'));
    }

    // Strictly enforce ownership at query level
    const profile = await BirthProfile.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId: req.user.id,
    });

    if (!profile) {
      return next(new AppError('Birth profile not found.', 404, 'PROFILE_NOT_FOUND'));
    }

    res.status(200).json({
      success: true,
      message: 'Birth profile retrieved successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid profile ID format.', 400, 'INVALID_ID'));
    }

    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      const issue = parseResult.error.issues[0];
      return next(new AppError(issue.message, 400, 'VALIDATION_ERROR'));
    }

    const updateData = parseResult.data;
    const userId = req.user.id;

    // Strictly check ownership
    const profile = await BirthProfile.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId,
    });

    if (!profile) {
      return next(new AppError('Birth profile not found.', 404, 'PROFILE_NOT_FOUND'));
    }

    // Handle primary profile switch if requested
    if (updateData.isPrimary && !profile.isPrimary) {
      await BirthProfile.updateMany(
        { userId, _id: { $ne: profile._id }, isPrimary: true },
        { isPrimary: false }
      );
    }

    Object.assign(profile, updateData);
    await profile.save();

    await recordAuditLog('profile_updated', req, userId, { profileId: id });

    res.status(200).json({
      success: true,
      message: 'Birth profile updated successfully',
      data: {
        profile,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return next(new AppError('Authentication required.', 401, 'UNAUTHORIZED'));
    }

    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(new AppError('Invalid profile ID format.', 400, 'INVALID_ID'));
    }

    const userId = req.user.id;

    // Strictly enforce ownership check during deletion
    const profile = await BirthProfile.findOne({
      _id: new mongoose.Types.ObjectId(id),
      userId,
    });

    if (!profile) {
      return next(new AppError('Birth profile not found.', 404, 'PROFILE_NOT_FOUND'));
    }

    const wasPrimary = profile.isPrimary;
    await BirthProfile.deleteOne({ _id: profile._id });

    // If the deleted profile was primary, promote the most recent remaining profile
    if (wasPrimary) {
      const nextProfile = await BirthProfile.findOne({ userId }).sort({ createdAt: -1 });
      if (nextProfile) {
        nextProfile.isPrimary = true;
        await nextProfile.save();
      }
    }

    await recordAuditLog('profile_deleted', req, userId, { profileId: id });

    res.status(200).json({
      success: true,
      message: 'Birth profile deleted successfully',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
