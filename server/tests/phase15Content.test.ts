import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { ArticleService } from '../src/services/article.service';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 15: Blog & SEO Content Architecture Suite', () => {
  it('allows admin to create, publish, and fetch public articles by slug', async () => {
    const admin = await User.create({
      name: 'Content Lead',
      email: `editor_${Date.now()}@vedic.com`,
      password: 'Password123!',
      role: 'admin',
    });
    const adminToken = generateAccessToken({ id: admin.id, email: admin.email, role: 'admin' });

    // 1. Admin creates article
    const createRes = await request(app)
      .post('/api/v1/articles/admin/create')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Understanding Vimshottari Dasha Mechanics',
        slug: 'understanding-vimshottari-dasha-mechanics',
        excerpt: 'An authoritative guide to calculating and interpreting planetary dasha cycles.',
        content: 'Vimshottari Dasha spans 120 years across the 9 classical Vedic planets...',
        category: 'dashas',
        tags: ['dashas', 'timing', 'mahadasha'],
        status: 'published',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);

    // 2. Public user fetches article by slug
    const publicRes = await request(app).get('/api/v1/articles/understanding-vimshottari-dasha-mechanics');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.success).toBe(true);
    expect(publicRes.body.data.article.title).toContain('Vimshottari Dasha');
  });
});
