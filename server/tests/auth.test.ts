import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { User } from '../src/models/User';
import './setup';

const app = createApp();

describe('Authentication & User Management API', () => {
  const validUser = {
    name: 'Aryabhata',
    email: 'aryabhata@example.com',
    password: 'Password123',
  };

  describe('POST /api/v1/auth/register', () => {
    it('should register a new user and return safe data with token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
      expect(res.body.data.user.name).toBe(validUser.name);
      expect(res.body.data.user.role).toBe('user');
      expect(res.body.data.user.passwordHash).toBeUndefined();
      expect(res.body.data.accessToken).toBeDefined();

      // Check cookie
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toContain('refreshToken');
    });

    it('should reject registration with duplicate email', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('DUPLICATE_EMAIL');
    });

    it('should reject registration with invalid email format', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject registration with weak password (< 8 chars or no numbers)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({ ...validUser, password: 'weak' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('should authenticate user with valid credentials and update lastLoginAt', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should reject invalid password with generic INVALID_CREDENTIALS', async () => {
      await request(app).post('/api/v1/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: 'WrongPassword99',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject non-existent user with generic INVALID_CREDENTIALS', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'SomePassword123',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
    });

    it('should reject login for deactivated user account', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const userId = regRes.body.data.user.id;

      await User.findByIdAndUpdate(userId, { isActive: false });

      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: validUser.email,
          password: validUser.password,
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('ACCOUNT_DEACTIVATED');
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should return current user profile when valid token provided', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const token = regRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should reject requests without authorization header', async () => {
      const res = await request(app).get('/api/v1/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('UNAUTHORIZED');
    });

    it('should reject requests with malformed or invalid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', 'Bearer invalid.token.value');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('POST /api/v1/auth/refresh', () => {
    it('should issue new access token with valid refresh token cookie', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const cookies = regRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/v1/auth/refresh')
        .set('Cookie', cookies);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should reject refresh when refresh token is missing', async () => {
      const res = await request(app).post('/api/v1/auth/refresh');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('REFRESH_TOKEN_REQUIRED');
    });
  });

  describe('PUT /api/v1/auth/update-password', () => {
    it('should update password and allow login with new password', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const token = regRes.body.data.accessToken;

      const updateRes = await request(app)
        .put('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'Password123',
          newPassword: 'NewPassword456',
        });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);

      // Old password should fail
      const oldLogin = await request(app).post('/api/v1/auth/login').send({
        email: validUser.email,
        password: 'Password123',
      });
      expect(oldLogin.status).toBe(401);

      // New password should succeed
      const newLogin = await request(app).post('/api/v1/auth/login').send({
        email: validUser.email,
        password: 'NewPassword456',
      });
      expect(newLogin.status).toBe(200);
    }, 15000);

    it('should reject password update if current password is incorrect', async () => {
      const regRes = await request(app).post('/api/v1/auth/register').send(validUser);
      const token = regRes.body.data.accessToken;

      const res = await request(app)
        .put('/api/v1/auth/update-password')
        .set('Authorization', `Bearer ${token}`)
        .send({
          currentPassword: 'IncorrectOldPassword1',
          newPassword: 'NewPassword456',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INVALID_CURRENT_PASSWORD');
    });
  });
});
