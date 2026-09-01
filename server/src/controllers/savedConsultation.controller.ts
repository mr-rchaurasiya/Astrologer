import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { SavedConsultation } from '../models/SavedConsultation';
import { ChatSession } from '../models/ChatSession';
import { sendSuccess, sendError } from '../utils/response';

export const createSavedConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { sessionId, title, tags, notes, isFavorite } = req.body;

    if (!sessionId) {
      return sendError(res, 'VALIDATION_ERROR', 'sessionId is required', 400);
    }

    const session = await ChatSession.findOne({ _id: sessionId, userId });
    if (!session) {
      return sendError(res, 'NOT_FOUND', 'Consultation session not found', 404);
    }

    const saved = await SavedConsultation.create({
      userId,
      sessionId,
      profileId: session.profileId,
      title: title || session.title || 'Saved Astrological Reading',
      tags: Array.isArray(tags) ? tags : [],
      notes: notes || '',
      isFavorite: Boolean(isFavorite),
    });

    return sendSuccess(res, { saved }, 'Consultation saved successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const getSavedConsultations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { tag, favorite, archived, search } = req.query;

    const filter: any = { userId };

    if (favorite === 'true') filter.isFavorite = true;
    if (archived === 'true') {
      filter.isArchived = true;
    } else {
      filter.isArchived = { $ne: true };
    }

    if (tag && typeof tag === 'string') {
      filter.tags = tag;
    }

    if (search && typeof search === 'string') {
      filter.title = { $regex: search, $options: 'i' };
    }

    const list = await SavedConsultation.find(filter).sort({ createdAt: -1 });

    return sendSuccess(
      res,
      {
        consultations: list.map((c) => ({
          id: c.id,
          sessionId: c.sessionId,
          profileId: c.profileId,
          title: c.title,
          tags: c.tags,
          isFavorite: c.isFavorite,
          isArchived: c.isArchived,
          notes: c.notes,
          createdAt: c.createdAt,
        })),
      },
      'Saved consultations retrieved'
    );
  } catch (error) {
    next(error);
  }
};

export const updateSavedConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { title, tags, isFavorite, isArchived, notes } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'NOT_FOUND', 'Saved consultation not found', 404);
    }

    const saved = await SavedConsultation.findOne({ _id: id, userId });
    if (!saved) {
      return sendError(res, 'NOT_FOUND', 'Saved consultation not found', 404);
    }

    if (title !== undefined) saved.title = title;
    if (Array.isArray(tags)) saved.tags = tags;
    if (isFavorite !== undefined) saved.isFavorite = isFavorite;
    if (isArchived !== undefined) saved.isArchived = isArchived;
    if (notes !== undefined) saved.notes = notes;

    await saved.save();

    return sendSuccess(res, { saved }, 'Saved consultation updated');
  } catch (error) {
    next(error);
  }
};

export const deleteSavedConsultation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return sendError(res, 'NOT_FOUND', 'Saved consultation not found', 404);
    }

    const result = await SavedConsultation.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return sendError(res, 'NOT_FOUND', 'Saved consultation not found', 404);
    }

    return sendSuccess(res, { deleted: true }, 'Saved consultation removed');
  } catch (error) {
    next(error);
  }
};
