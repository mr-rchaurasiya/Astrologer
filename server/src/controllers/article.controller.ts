import { Request, Response, NextFunction } from 'express';
import { ArticleService } from '../services/article.service';

export const getPublicArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, tag, search, page, limit } = req.query;
    const result = await ArticleService.getArticles({
      category: category as string,
      tag: tag as string,
      search: search as string,
      status: 'published',
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPublicArticleBySlug = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { slug } = req.params;
    const article = await ArticleService.getArticleBySlug(slug, false);

    res.json({
      success: true,
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await ArticleService.getCategoriesAndTags();
    res.json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminArticles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category, tag, search, status, page, limit } = req.query;
    const result = await ArticleService.getArticles({
      category: category as string,
      tag: tag as string,
      search: search as string,
      status: status as any,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createAdminArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const article = await ArticleService.createArticle(req.body);
    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const article = await ArticleService.updateArticle(id, req.body);
    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article },
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminArticle = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await ArticleService.deleteArticle(id);
    res.json({
      success: true,
      message: 'Article deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
