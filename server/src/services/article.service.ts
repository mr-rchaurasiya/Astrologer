import { Article, IArticle } from '../models/Article';
import { AppError } from '../middleware/errorHandler';
import { Logger } from '../observability/logger';

export interface CreateArticleInput {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  author?: string;
  category: 'kundli' | 'vedic-astrology' | 'dashas' | 'yogas' | 'transits' | 'compatibility' | 'ai-astrology';
  tags?: string[];
  featuredImage?: string;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  status?: 'draft' | 'published';
  publishedAt?: Date;
  readTimeMinutes?: number;
}

export interface QueryArticleOptions {
  category?: string;
  tag?: string;
  search?: string;
  status?: 'draft' | 'published';
  page?: number;
  limit?: number;
}

export class ArticleService {
  /**
   * Generates a URL-friendly slug from title
   */
  public static generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Retrieves paginated articles with optional filtering
   */
  public static async getArticles(options: QueryArticleOptions = {}) {
    const page = Math.max(1, Number(options.page) || 1);
    const limit = Math.min(50, Math.max(1, Number(options.limit) || 10));
    const skip = (page - 1) * limit;

    const filter: Record<string, any> = {};

    if (options.status) {
      filter.status = options.status;
    } else {
      filter.status = 'published'; // Default to published for public queries
    }

    if (options.category) {
      filter.category = options.category;
    }

    if (options.tag) {
      filter.tags = options.tag;
    }

    if (options.search) {
      const searchRegex = new RegExp(options.search, 'i');
      filter.$or = [{ title: searchRegex }, { excerpt: searchRegex }, { tags: searchRegex }];
    }

    const [articles, total] = await Promise.all([
      Article.find(filter)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Article.countDocuments(filter),
    ]);

    return {
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Retrieves single article by slug
   */
  public static async getArticleBySlug(slug: string, allowDraft = false): Promise<IArticle> {
    const filter: Record<string, any> = { slug: slug.toLowerCase().trim() };
    if (!allowDraft) {
      filter.status = 'published';
    }

    const article = await Article.findOne(filter);
    if (!article) {
      throw new AppError(`Article with slug "${slug}" not found`, 404, 'ARTICLE_NOT_FOUND');
    }

    // Increment view count asynchronously
    article.viewCount = (article.viewCount || 0) + 1;
    await article.save();

    return article;
  }

  /**
   * Creates a new article (Admin)
   */
  public static async createArticle(input: CreateArticleInput): Promise<IArticle> {
    const slug = input.slug ? this.generateSlug(input.slug) : this.generateSlug(input.title);

    // Check slug uniqueness
    const existing = await Article.findOne({ slug });
    if (existing) {
      throw new AppError(`An article with slug "${slug}" already exists`, 400, 'SLUG_ALREADY_EXISTS');
    }

    // Estimate read time (avg 200 words per min)
    const wordCount = input.content ? input.content.split(/\s+/).length : 100;
    const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

    const article = await Article.create({
      ...input,
      slug,
      readTimeMinutes: input.readTimeMinutes || readTimeMinutes,
      status: input.status || 'draft',
      publishedAt: input.status === 'published' ? input.publishedAt || new Date() : undefined,
    });

    Logger.info(`Article created: "${article.title}" [${article.slug}]`);
    return article;
  }

  /**
   * Updates an existing article (Admin)
   */
  public static async updateArticle(id: string, input: Partial<CreateArticleInput>): Promise<IArticle> {
    const article = await Article.findById(id);
    if (!article) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }

    if (input.slug && input.slug !== article.slug) {
      const slug = this.generateSlug(input.slug);
      const existing = await Article.findOne({ slug, _id: { $ne: id } });
      if (existing) {
        throw new AppError(`Slug "${slug}" is already in use by another article`, 400, 'SLUG_ALREADY_EXISTS');
      }
      article.slug = slug;
    }

    if (input.title) article.title = input.title;
    if (input.excerpt) article.excerpt = input.excerpt;
    if (input.content) {
      article.content = input.content;
      const wordCount = input.content.split(/\s+/).length;
      article.readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));
    }
    if (input.category) article.category = input.category;
    if (input.tags) article.tags = input.tags;
    if (input.author) article.author = input.author;
    if (input.featuredImage !== undefined) article.featuredImage = input.featuredImage;
    if (input.seoTitle !== undefined) article.seoTitle = input.seoTitle;
    if (input.seoDescription !== undefined) article.seoDescription = input.seoDescription;
    if (input.canonicalUrl !== undefined) article.canonicalUrl = input.canonicalUrl;

    if (input.status) {
      if (input.status === 'published' && article.status !== 'published') {
        article.publishedAt = input.publishedAt || new Date();
      }
      article.status = input.status;
    }

    await article.save();
    Logger.info(`Article updated: "${article.title}" [${article.slug}]`);
    return article;
  }

  /**
   * Deletes an article (Admin)
   */
  public static async deleteArticle(id: string): Promise<boolean> {
    const result = await Article.findByIdAndDelete(id);
    if (!result) {
      throw new AppError('Article not found', 404, 'ARTICLE_NOT_FOUND');
    }
    Logger.info(`Article deleted: ${id}`);
    return true;
  }

  /**
   * Fetches distinct categories and popular tags
   */
  public static async getCategoriesAndTags() {
    const categories = [
      { id: 'kundli', name: 'Kundli & Birth Charts', description: 'Core principles of Vedic birth chart construction' },
      { id: 'vedic-astrology', name: 'Vedic Astrology Fundamentals', description: 'Grahas, Rashis, Bhavas and Nakshatras' },
      { id: 'dashas', name: 'Vimshottari Dashas', description: 'Planetary periods and multi-decade predictive timing' },
      { id: 'yogas', name: 'Auspicious & Inauspicious Yogas', description: 'Raja Yogas, Dhana Yogas and planetary combinations' },
      { id: 'transits', name: 'Planetary Transits (Gochar)', description: 'Real-time planetary movements and daily influences' },
      { id: 'compatibility', name: 'Kundli Matching & Synastry', description: 'Ashtakoota compatibility and relational harmony' },
      { id: 'ai-astrology', name: 'Responsible AI Astrology', description: 'Contextual AI consultation and Vedic reasoning' },
    ];

    const tags = await Article.distinct('tags', { status: 'published' });
    return { categories, tags };
  }
}
