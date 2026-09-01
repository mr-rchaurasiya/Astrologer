import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import './setup';

const app = createApp();

describe('Birth Profile Management & Ownership Security API', () => {
  let userAToken: string;
  let userBToken: string;

  const profileData1 = {
    name: 'Varahamihira',
    relationship: 'self',
    dateOfBirth: '1990-05-15',
    timeOfBirth: '06:30:00',
    placeName: 'Ujjain, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'male',
  };

  const profileData2 = {
    name: 'Parashara Partner',
    relationship: 'partner',
    dateOfBirth: '1992-08-20',
    timeOfBirth: '14:15',
    placeName: 'Varanasi, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'female',
  };

  const setupUsers = async () => {
    const userARes = await request(app).post('/api/v1/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123',
    });
    userAToken = userARes.body.data.accessToken;

    const userBRes = await request(app).post('/api/v1/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123',
    });
    userBToken = userBRes.body.data.accessToken;
  };

  describe('POST /api/v1/profiles', () => {
    it('should create a profile and set isPrimary: true for user\'s first profile', async () => {
      await setupUsers();

      const res = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(profileData1);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.name).toBe(profileData1.name);
      expect(res.body.data.profile.isPrimary).toBe(true);
      expect(res.body.data.profile.latitude).toBe(23.1765);
    });

    it('should create a second profile with isPrimary: false by default', async () => {
      await setupUsers();
      await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);

      const res = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(profileData2);

      expect(res.status).toBe(201);
      expect(res.body.data.profile.name).toBe(profileData2.name);
      expect(res.body.data.profile.isPrimary).toBe(false);
    });

    it('should reject profile with invalid latitude (> 90)', async () => {
      await setupUsers();

      const res = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ...profileData1, latitude: 120.5 });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject profile with invalid date format', async () => {
      await setupUsers();

      const res = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ ...profileData1, dateOfBirth: '15-05-1990' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/v1/profiles and GET /api/v1/profiles/:id', () => {
    it('should list all profiles owned by user', async () => {
      await setupUsers();
      await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);
      await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData2);

      const res = await request(app)
        .get('/api/v1/profiles')
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.profiles.length).toBe(2);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.profiles[0].isPrimary).toBe(true);
    });

    it('should fetch single profile by valid ID', async () => {
      await setupUsers();
      const createRes = await request(app)
        .post('/api/v1/profiles')
        .set('Authorization', `Bearer ${userAToken}`)
        .send(profileData1);

      const profileId = createRes.body.data.profile.id;

      const res = await request(app)
        .get(`/api/v1/profiles/${profileId}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.profile.name).toBe(profileData1.name);
    });
  });

  describe('PUT and DELETE /api/v1/profiles/:id', () => {
    it('should switch primary status and unset old primary', async () => {
      await setupUsers();
      const p1 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);
      const p2 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData2);

      const p2Id = p2.body.data.profile.id;

      const updateRes = await request(app)
        .put(`/api/v1/profiles/${p2Id}`)
        .set('Authorization', `Bearer ${userAToken}`)
        .send({ isPrimary: true });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.profile.isPrimary).toBe(true);

      // Verify p1 is now isPrimary: false
      const p1Check = await request(app).get(`/api/v1/profiles/${p1.body.data.profile.id}`).set('Authorization', `Bearer ${userAToken}`);
      expect(p1Check.body.data.profile.isPrimary).toBe(false);
    });

    it('should delete profile and auto-promote remaining profile if primary was deleted', async () => {
      await setupUsers();
      const p1 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);
      const p2 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData2);

      const p1Id = p1.body.data.profile.id;
      const p2Id = p2.body.data.profile.id;

      // Delete primary profile (p1)
      const delRes = await request(app)
        .delete(`/api/v1/profiles/${p1Id}`)
        .set('Authorization', `Bearer ${userAToken}`);

      expect(delRes.status).toBe(200);

      // p2 should now be promoted to isPrimary: true
      const p2Check = await request(app).get(`/api/v1/profiles/${p2Id}`).set('Authorization', `Bearer ${userAToken}`);
      expect(p2Check.body.data.profile.isPrimary).toBe(true);
    });
  });

  describe('SECURITY & USER DATA ISOLATION (Critical)', () => {
    it('User B must NOT be able to view User A\'s birth profile', async () => {
      await setupUsers();
      const p1 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);
      const profileAId = p1.body.data.profile.id;

      const res = await request(app)
        .get(`/api/v1/profiles/${profileAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('PROFILE_NOT_FOUND');
    });

    it('User B must NOT be able to modify User A\'s birth profile', async () => {
      await setupUsers();
      const p1 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);
      const profileAId = p1.body.data.profile.id;

      const res = await request(app)
        .put(`/api/v1/profiles/${profileAId}`)
        .set('Authorization', `Bearer ${userBToken}`)
        .send({ name: 'Hacked Profile Name' });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify original profile was not modified
      const original = await request(app).get(`/api/v1/profiles/${profileAId}`).set('Authorization', `Bearer ${userAToken}`);
      expect(original.body.data.profile.name).toBe(profileData1.name);
    });

    it('User B must NOT be able to delete User A\'s birth profile', async () => {
      await setupUsers();
      const p1 = await request(app).post('/api/v1/profiles').set('Authorization', `Bearer ${userAToken}`).send(profileData1);
      const profileAId = p1.body.data.profile.id;

      const res = await request(app)
        .delete(`/api/v1/profiles/${profileAId}`)
        .set('Authorization', `Bearer ${userBToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);

      // Verify profile still exists for User A
      const check = await request(app).get(`/api/v1/profiles/${profileAId}`).set('Authorization', `Bearer ${userAToken}`);
      expect(check.status).toBe(200);
    });
  });
});
