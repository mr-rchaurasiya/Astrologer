import { Router } from 'express';
import { getSitemapXml, getRobotsTxt } from '../controllers/seo.controller';

export const seoRouter = Router();

seoRouter.get('/sitemap.xml', getSitemapXml);
seoRouter.get('/robots.txt', getRobotsTxt);
