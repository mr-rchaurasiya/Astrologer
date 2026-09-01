import { Router } from 'express';
import {
  getMemories,
  saveMemory,
  updateMemory,
  deleteMemory,
  clearAllMemories,
} from '../controllers/memory.controller';
import { requireAuth } from '../middleware/auth';

export const memoryRouter = Router();

memoryRouter.use(requireAuth);

memoryRouter.get('/', getMemories);
memoryRouter.post('/', saveMemory);
memoryRouter.put('/:id', updateMemory);
memoryRouter.delete('/:id', deleteMemory);
memoryRouter.delete('/', clearAllMemories);
