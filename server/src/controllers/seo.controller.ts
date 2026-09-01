import { Request, Response, NextFunction } from 'express';
import { SeoService } from '../services/seo.service';

export const getSitemapXml = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const host = req.get('host') || 'astrologer.app';
    const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${host}`;

    const xml = await SeoService.generateSitemapXml(baseUrl);
    res.header('Content-Type', 'application/xml');
    res.status(200).send(xml);
  } catch (error) {
    next(error);
  }
};

export const getRobotsTxt = (req: Request, res: Response) => {
  const host = req.get('host') || 'astrologer.app';
  const protocol = req.protocol === 'https' || req.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const robots = SeoService.getRobotsTxt(baseUrl);
  res.header('Content-Type', 'text/plain');
  res.status(200).send(robots);
};
