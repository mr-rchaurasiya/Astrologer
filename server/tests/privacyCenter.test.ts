import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import { BirthProfile } from '../src/models/BirthProfile';
import { generateAccessToken } from '../src/utils/jwt';
import './setup';

const app = createApp();

describe('Phase 10: User Privacy Center & Governance', () => {
  let userId: string;
  let userToken: string;

  beforeEach(async () => {
    const user = await User.create({
      name: 'Privacy Native',
      email: `privacy_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    userId = user.id;
    userToken = generateAccessToken({ id: userId, email: user.email, role: 'user' });

    // Seed birth profile
    await BirthProfile.create({
      userId,
      name: 'Privacy Native',
      dateOfBirth: '1988-11-20',
      timeOfBirth: '08:15',
      placeName: 'Delhi, India',
      latitude: 28.6139,
      longitude: 77.2090,
      timezone: 'Asia/Kolkata',
      gender: 'female',
      isPrimary: true,
    });
  });

  it('should export all user data in JSON format', async () => {
    const res = await request(app)
      .get('/api/v1/account/export')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toBeDefined();
    expect(res.body.birthProfiles.length).toBeGreaterThan(0);
    expect(res.body.chatSessions).toBeDefined();
  });
});
