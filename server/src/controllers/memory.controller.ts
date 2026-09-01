import { Request, Response, NextFunction } from 'express';
import { AIMemoryService } from '../ai/memory/memory.service';
import { sendSuccess } from '../utils/response';
import { ValidationError } from '../middleware/errorHandler';

export const getMemories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const memories = await AIMemoryService.getUserMemories(userId);

    return sendSuccess(res, { memories }, 'User AI memories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

export const saveMemory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { category, key, value, profileId, confidence } = req.body;

    if (!category || !key || !value) {
      throw new ValidationError('Category, key, and value are required');
    }

    const memory = await AIMemoryService.saveMemory({
      userId,
      profileId,
      category,
      key,
      value,
      confidence,
      source: 'user_explicit',
    });

    return sendSuccess(res, { memory }, 'AI memory saved successfully', 201);
  } catch (error) {
    next(error);
  }
};

export const updateMemory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { value, confidence, category } = req.body;

    const memory = await AIMemoryService.updateMemory(id, userId, {
      value,
      confidence,
      category,
    });

    return sendSuccess(res, { memory }, 'AI memory updated successfully');
  } catch (error) {
    next(error);
  }
};

export const deleteMemory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await AIMemoryService.deleteMemory(id, userId);

    return sendSuccess(res, { deleted: true }, 'AI memory deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const clearAllMemories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const deletedCount = await AIMemoryService.clearAllMemories(userId);

    return sendSuccess(res, { deletedCount }, 'All AI memories cleared successfully');
  } catch (error) {
    next(error);
  }
};
