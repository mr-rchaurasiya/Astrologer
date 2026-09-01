import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { SeoService } from '../src/services/seo.service';
import './setup';

const app = createApp();

describe('Phase 15: Technical SEO, Sitemap & Robots.txt Suite', () => {
  it('GET /api/v1/seo/sitemap.xml returns valid XML sitemap with public URLs', async () => {
    const res = await request(app).get('/api/v1/seo/sitemap.xml');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('xml');
    expect(res.text).toContain('<urlset');
    expect(res.text).toContain('/kundli-online');
    expect(res.text).toContain('/vedic-astrology');
    expect(res.text).toContain('/ai-astrologer');
  });

  it('GET /api/v1/seo/robots.txt allows public routes and disallows private app routes', async () => {
    const res = await request(app).get('/api/v1/seo/robots.txt');
    expect(res.status).toBe(200);
    expect(res.header['content-type']).toContain('text/plain');
    expect(res.text).toContain('Allow: /kundli-online');
    expect(res.text).toContain('Disallow: /dashboard');
    expect(res.text).toContain('Disallow: /admin');
    expect(res.text).toContain('Sitemap:');
  });
});
