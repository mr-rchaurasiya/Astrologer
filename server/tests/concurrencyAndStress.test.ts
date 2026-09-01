import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 9: Concurrency, Load & Stress Resiliency Suite', () => {
  it('should handle 10 concurrent registrations with unique emails without race conditions', async () => {
    const registerPromises = Array.from({ length: 10 }).map((_, i) =>
      request(app)
        .post('/api/v1/auth/register')
        .send({
          name: `Concurrent User ${i}`,
          email: `concurrent_${i}_${Date.now()}@example.com`,
          password: 'Password@12345',
        })
    );

    const results = await Promise.all(registerPromises);

    for (const res of results) {
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
    }
  }, 15000);

  it('should handle simultaneous profile creation requests for a single user', async () => {
    const user = await User.create({
      name: 'Stress Test User',
      email: `stress_${Date.now()}@example.com`,
      passwordHash: 'hash',
      role: 'user',
      isActive: true,
    });
    const token = generateAccessToken(user);

    const profilePromises = Array.from({ length: 5 }).map((_, i) =>
      request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: `Profile ${i}`,
          dateOfBirth: '1995-03-20',
          timeOfBirth: '10:15',
          placeName: 'Delhi, India',
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 'Asia/Kolkata',
          timezoneOffset: 5.5,
          gender: 'male',
        })
    );

    const results = await Promise.all(profilePromises);

    for (const res of results) {
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    }
  }, 15000);

  it('should process concurrent recommendation queries stably', async () => {
    const user = await User.create({
      name: 'Rec Stress User',
      email: `rec_stress_${Date.now()}@example.com`,
      passwordHash: 'hash',
      role: 'user',
      isActive: true,
    });
    const token = generateAccessToken(user);

    const recPromises = Array.from({ length: 8 }).map(() =>
      request(app)
        .get('/api/v1/recommendations')
        .set('Authorization', `Bearer ${token}`)
    );

    const results = await Promise.all(recPromises);

    for (const res of results) {
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    }
  }, 15000);
});
