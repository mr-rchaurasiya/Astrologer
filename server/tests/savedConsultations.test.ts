import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { ChatSession } from '../src/models/ChatSession';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: Saved Consultations API', () => {
  let userId: string;
  let userToken: string;
  let sessionId: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Seeker User',
      email: `seeker_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    userId = user.id;
    userToken = generateAccessToken({ id: userId, email: user.email, role: 'user' });

    const session = await ChatSession.create({
      userId,
      title: 'Career & 10th House Karma Reading',
    });
    sessionId = session.id;
  });

  it('should save a consultation reading with tags and notes', async () => {
    const res = await request(app)
      .post('/api/v1/ai/saved')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        sessionId,
        title: 'Career Path 2027',
        tags: ['career', 'jupiter', 'remedy'],
        notes: 'Follow up after Jupiter ingress',
        isFavorite: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.saved.title).toBe('Career Path 2027');
    expect(res.body.data.saved.isFavorite).toBe(true);
    expect(res.body.data.saved.tags).toContain('career');
  });

  it('should list and filter saved consultations for authenticated user', async () => {
    await request(app)
      .post('/api/v1/ai/saved')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        sessionId,
        title: 'Finance & Venus',
        tags: ['wealth'],
        isFavorite: true,
      });

    const res = await request(app)
      .get('/api/v1/ai/saved?favorite=true')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.consultations.length).toBeGreaterThan(0);
    expect(res.body.data.consultations[0].title).toBe('Finance & Venus');
  });

  it('should prevent other users from accessing saved consultations', async () => {
    const saveRes = await request(app)
      .post('/api/v1/ai/saved')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        sessionId,
        title: 'Private Reading',
      });

    const savedId = saveRes.body.data.saved._id || saveRes.body.data.saved.id;

    const intruder = await User.create({
      name: 'Intruder User',
      email: `intruder_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const otherToken = generateAccessToken({ id: intruder.id, email: intruder.email, role: 'user' });

    const deleteRes = await request(app)
      .delete(`/api/v1/ai/saved/${savedId}`)
      .set('Authorization', `Bearer ${otherToken}`);

    expect(deleteRes.status).toBe(404);
  });
});
