import { Router } from 'express';
import {
  getPublicArticles,
  getPublicArticleBySlug,
  getCategories,
  getAdminArticles,
  createAdminArticle,
  updateAdminArticle,
  deleteAdminArticle,
} from '../controllers/article.controller';
import { requireAuth, requireRole } from '../middleware/auth';

export const articleRouter = Router();

// Public routes
articleRouter.get('/', getPublicArticles);
articleRouter.get('/categories', getCategories);
articleRouter.get('/:slug', getPublicArticleBySlug);

// Admin routes
articleRouter.get('/admin/list', requireAuth, requireRole('admin'), getAdminArticles);
articleRouter.post('/admin/create', requireAuth, requireRole('admin'), createAdminArticle);
articleRouter.put('/admin/:id', requireAuth, requireRole('admin'), updateAdminArticle);
articleRouter.delete('/admin/:id', requireAuth, requireRole('admin'), deleteAdminArticle);
