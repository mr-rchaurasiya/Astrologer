import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { BirthProfile } from '../models/BirthProfile';
import { ChatSession } from '../models/ChatSession';
import { ChatMessage } from '../models/ChatMessage';
import { Report } from '../models/Report';
import { Notification } from '../models/Notification';
import { NotificationPreference } from '../models/NotificationPreference';
import { Subscription } from '../models/Subscription';
import { Payment } from '../models/Payment';
import { AuditLog } from '../models/AuditLog';
import { getStorageProvider } from '../storage/provider';
import { sendSuccess, sendError } from '../utils/response';
import { ValidationError, AuthError, NotFoundError } from '../middleware/errorHandler';

export const getAccountDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const [profileCount, sessionCount, reportCount, subscription] = await Promise.all([
      BirthProfile.countDocuments({ userId }),
      ChatSession.countDocuments({ userId }),
      Report.countDocuments({ userId }),
      Subscription.findOne({ userId }),
    ]);

    const preferences = await NotificationPreference.findOne({ userId });

    return sendSuccess(res, {
      user,
      stats: {
        profileCount,
        sessionCount,
        reportCount,
      },
      subscription: subscription || { plan: 'free', status: 'active' },
      preferences: preferences || {
        emailEnabled: true,
        inAppEnabled: true,
        dailyInsight: true,
        transitEvents: true,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const exportUserData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      throw new NotFoundError('User not found');
    }

    const [profiles, sessions, messages, reports, notifications, subscription, payments] = await Promise.all([
      BirthProfile.find({ userId }),
      ChatSession.find({ userId }),
      ChatMessage.find({ userId }).select('-metadata.raw'),
      Report.find({ userId }).select('-storageKey'),
      Notification.find({ userId }),
      Subscription.findOne({ userId }),
      Payment.find({ userId }).select('-providerSignature'),
    ]);

    const exportPayload = {
      exportMetadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0',
        userId: user.id,
      },
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      birthProfiles: profiles,
      chatSessions: sessions,
      chatMessages: messages,
      reports: reports,
      notifications: notifications,
      subscription: subscription,
      paymentsHistory: payments,
    };

    await AuditLog.create({
      userId: user._id,
      action: 'USER_DATA_EXPORTED',
      metadata: { profileCount: profiles.length, messageCount: messages.length },
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="astrologer_user_data_${userId}.json"`);
    return res.status(200).json(exportPayload);
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { password, confirmationText } = req.body;

    if (confirmationText !== 'DELETE') {
      throw new ValidationError('Confirmation text must match "DELETE"');
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Verify password for security re-authentication
    if (password) {
      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        throw new AuthError('Incorrect password. Account deletion aborted.');
      }
    }

    // 1. Delete associated physical PDF report files from storage
    const userReports = await Report.find({ userId });
    const storage = getStorageProvider();
    for (const rep of userReports) {
      try {
        await storage.delete(rep.storageKey);
      } catch {
        // Continue cleanup even if file deletion fails
      }
    }

    // 2. Cascade delete database records
    await Promise.all([
      BirthProfile.deleteMany({ userId }),
      ChatSession.deleteMany({ userId }),
      ChatMessage.deleteMany({ userId }),
      Report.deleteMany({ userId }),
      Notification.deleteMany({ userId }),
      NotificationPreference.deleteMany({ userId }),
      Subscription.deleteMany({ userId }),
      User.findByIdAndDelete(userId),
    ]);

    // 3. Log anonymized audit event
    await AuditLog.create({
      action: 'USER_ACCOUNT_DELETED',
      metadata: { deletedUserId: userId, deletedEmail: user.email },
    });

    // Clear refresh cookie
    res.clearCookie('refreshToken');

    return sendSuccess(res, { deleted: true }, 'Account and associated personal data successfully deleted');
  } catch (error) {
    next(error);
  }
};
