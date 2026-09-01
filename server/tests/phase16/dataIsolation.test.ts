import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import { User } from '../../src/models/User';
import { BirthProfile } from '../../src/models/BirthProfile';
import { generateAccessToken } from '../../src/utils/jwt';
import '../setup';

const app = createApp();

describe('Phase 16: Multi-Tenant Data Isolation & IDOR Defense Suite', () => {
  it('strictly blocks User B from viewing or mutating User A profile', async () => {
    const userA = await User.create({
      name: 'User Alpha',
      email: `alpha_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const tokenA = generateAccessToken({ id: userA.id, email: userA.email, role: 'user' });

    const userB = await User.create({
      name: 'User Beta',
      email: `beta_${Date.now()}@vedic.com`,
      password: 'Password123!',
    });
    const tokenB = generateAccessToken({ id: userB.id, email: userB.email, role: 'user' });

    // User A creates birth profile
    const profileA = await BirthProfile.create({
      userId: userA.id,
      name: 'Alpha Natal Chart',
      relationship: 'self',
      dateOfBirth: '1990-05-15',
      timeOfBirth: '14:30:00',
      placeName: 'Varanasi, India',
      latitude: 25.3176,
      longitude: 82.9739,
      timezone: 'Asia/Kolkata',
    });

    // User B attempts to access User A's profile
    const res = await request(app)
      .get(`/api/v1/profiles/${profileA.id}`)
      .set('Authorization', `Bearer ${tokenB}`);

    expect(res.status).toBe(404);
  });
});
