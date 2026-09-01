import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { AIMemory } from '../src/models/AIMemory';
import { generateAccessToken } from '../src/utils/jwt';
import { MemorySanitizer } from '../src/ai/memory/memorySanitizer';
import './setup';

const app = createApp();

describe('Phase 9: Personalized AI Memory & Tenant Isolation API', () => {
  let userAToken: string;
  let userBToken: string;
  let userAId: string;
  let userBId: string;

  beforeEach(async () => {
    const userA = await User.create({
      name: 'Memory User A',
      email: 'userA_mem@example.com',
      passwordHash: 'hash',
      role: 'user',
      isActive: true,
    });
    userAId = userA.id;
    userAToken = generateAccessToken(userA);

    const userB = await User.create({
      name: 'Memory User B',
      email: 'userB_mem@example.com',
      passwordHash: 'hash',
      role: 'user',
      isActive: true,
    });
    userBId = userB.id;
    userBToken = generateAccessToken(userB);
  });

  it('POST /api/v1/ai/memory should save a valid user memory', async () => {
    const res = await request(app)
      .post('/api/v1/ai/memory')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'preference',
        key: 'preferred_language',
        value: 'English with Sanskrit terminology',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.memory.key).toBe('preferred_language');
    expect(res.body.data.memory.value).toBe('English with Sanskrit terminology');
  });

  it('POST /api/v1/ai/memory should reject sensitive keywords (passwords, tokens, keys)', async () => {
    const res = await request(app)
      .post('/api/v1/ai/memory')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        category: 'preference',
        key: 'account_password',
        value: 'secret12345',
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('GET /api/v1/ai/memory should list memories with strict user ownership isolation', async () => {
    await AIMemory.create({
      userId: userAId as any,
      category: 'astrology_interest',
      key: 'focus_area',
      value: 'Career and Dharma in D10 chart',
      confidence: 1.0,
      source: 'user_explicit',
    });

    await AIMemory.create({
      userId: userBId as any,
      category: 'astrology_interest',
      key: 'focus_area',
      value: 'Relationship compatibility in D9 chart',
      confidence: 1.0,
      source: 'user_explicit',
    });

    const resA = await request(app)
      .get('/api/v1/ai/memory')
      .set('Authorization', `Bearer ${userAToken}`);

    expect(resA.status).toBe(200);
    expect(resA.body.data.memories.length).toBe(1);
    expect(resA.body.data.memories[0].value).toContain('Dharma');

    // User B should not see User A's memories
    const resB = await request(app)
      .get('/api/v1/ai/memory')
      .set('Authorization', `Bearer ${userBToken}`);

    expect(resB.status).toBe(200);
    expect(resB.body.data.memories.length).toBe(1);
    expect(resB.body.data.memories[0].value).toContain('compatibility');
  });

  it('DELETE /api/v1/ai/memory/:id should delete single memory and prevent User B from deleting User A memory', async () => {
    const memoryA = await AIMemory.create({
      userId: userAId as any,
      category: 'learning_goal',
      key: 'learning_nakshatras',
      value: 'Interested in learning all 27 nakshatras',
      confidence: 1.0,
      source: 'user_explicit',
    });

    // User B attempts to delete User A memory
    const forbiddenRes = await request(app)
      .delete(`/api/v1/ai/memory/${memoryA.id}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(forbiddenRes.status).toBe(404);

    // User A successfully deletes their own memory
    const successRes = await request(app)
      .delete(`/api/v1/ai/memory/${memoryA.id}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(successRes.status).toBe(200);
    expect(successRes.body.data.deleted).toBe(true);
  });

  it('MemorySanitizer should detect credit cards, bearer tokens, and secrets correctly', () => {
    expect(MemorySanitizer.isSafe('topic', '4111 2222 3333 4444')).toBe(false);
    expect(MemorySanitizer.isSafe('api', 'Bearer eyJhbGciOi...')).toBe(false);
    expect(MemorySanitizer.isSafe('style', 'Clear and concise philosophical explanation')).toBe(true);
  });
});
