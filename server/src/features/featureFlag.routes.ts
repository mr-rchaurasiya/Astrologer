import { Router } from 'express';
import { getFeatureFlags } from './featureFlag.controller';
import { optionalAuth } from '../middleware/auth';

export const featureFlagRouter = Router();

// Optional authentication: allows both anonymous and authenticated flag resolution
featureFlagRouter.get('/', optionalAuth, getFeatureFlags);
