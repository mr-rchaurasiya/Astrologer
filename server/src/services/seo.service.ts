import { Article } from '../models/Article';

export class SeoService {
  /**
   * Generates a fully-compliant XML sitemap of all public indexable URLs.
   */
  public static async generateSitemapXml(baseUrl = 'https://astrologer.app'): Promise<string> {
    const staticUrls = [
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'daily' },
      { loc: `${baseUrl}/kundli-online`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/vedic-astrology`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/ai-astrologer`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/astrology-reports`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/blog`, priority: '0.8', changefreq: 'daily' },
      { loc: `${baseUrl}/login`, priority: '0.5', changefreq: 'monthly' },
      { loc: `${baseUrl}/register`, priority: '0.6', changefreq: 'monthly' },
    ];

    // Fetch published blog articles
    const articles = await Article.find({ status: 'published' })
      .select('slug updatedAt publishedAt')
      .sort({ publishedAt: -1 });

    const articleUrls = articles.map((art) => ({
      loc: `${baseUrl}/blog/${art.slug}`,
      lastmod: (art.updatedAt || art.publishedAt || new Date()).toISOString().split('T')[0],
      priority: '0.7',
      changefreq: 'weekly',
    }));

    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    for (const url of staticUrls) {
      xml += `  <url>\n`;
      xml += `    <loc>${url.loc}</loc>\n`;
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    for (const url of articleUrls) {
      xml += `  <url>\n`;
      xml += `    <loc>${url.loc}</loc>\n`;
      if (url.lastmod) {
        xml += `    <lastmod>${url.lastmod}</lastmod>\n`;
      }
      xml += `    <changefreq>${url.changefreq}</changefreq>\n`;
      xml += `    <priority>${url.priority}</priority>\n`;
      xml += `  </url>\n`;
    }

    xml += `</urlset>`;
    return xml;
  }

  /**
   * Generates robots.txt content
   */
  public static getRobotsTxt(baseUrl = 'https://astrologer.app'): string {
    return [
      '# Astrologer Robots Exclusion Protocol',
      'User-agent: *',
      'Allow: /',
      'Allow: /kundli-online',
      'Allow: /vedic-astrology',
      'Allow: /ai-astrologer',
      'Allow: /astrology-reports',
      'Allow: /blog',
      'Allow: /blog/*',
      'Allow: /shared/kundli/*',
      '',
      '# Disallow private authenticated application routes',
      'Disallow: /dashboard',
      'Disallow: /dashboard/*',
      'Disallow: /kundli',
      'Disallow: /kundli/*',
      'Disallow: /chat',
      'Disallow: /chat/*',
      'Disallow: /analytics',
      'Disallow: /analytics/*',
      'Disallow: /reports',
      'Disallow: /reports/*',
      'Disallow: /settings',
      'Disallow: /settings/*',
      'Disallow: /profile',
      'Disallow: /profile/*',
      'Disallow: /admin',
      'Disallow: /admin/*',
      'Disallow: /api/',
      'Disallow: /api/*',
      '',
      `Sitemap: ${baseUrl}/sitemap.xml`,
    ].join('\n');
  }
}
