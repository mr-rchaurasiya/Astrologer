import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app';
import '../setup';

const app = createApp();

describe('AI Consultation API & Security Isolation', () => {
  let userAToken: string;
  let userBToken: string;
  let profileAId: string;
  let profileBId: string;

  const profileData1 = {
    name: 'User A Natal',
    relationship: 'self',
    dateOfBirth: '1995-05-15',
    timeOfBirth: '08:30:00',
    placeName: 'Ujjain, India',
    latitude: 23.1765,
    longitude: 75.7885,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'male',
  };

  const profileData2 = {
    name: 'User B Natal',
    relationship: 'self',
    dateOfBirth: '1990-10-20',
    timeOfBirth: '14:15:00',
    placeName: 'Varanasi, India',
    latitude: 25.3176,
    longitude: 82.9739,
    timezone: 'Asia/Kolkata',
    timezoneOffset: 5.5,
    gender: 'female',
  };

  const setupUsersAndProfiles = async () => {
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

    const p1Res = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${userAToken}`)
      .send(profileData1);
    profileAId = p1Res.body.data.profile.id;

    const p2Res = await request(app)
      .post('/api/v1/profiles')
      .set('Authorization', `Bearer ${userBToken}`)
      .send(profileData2);
    profileBId = p2Res.body.data.profile.id;
  };

  it('POST /api/v1/ai/chat > should send a message and create a session and assistant message', async () => {
    await setupUsersAndProfiles();

    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        profileId: profileAId,
        message: 'What does my Lagna indicate in my birth chart?',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.sessionId).toBeDefined();
    expect(res.body.data.userMessage.content).toBe('What does my Lagna indicate in my birth chart?');
    expect(res.body.data.assistantMessage.role).toBe('assistant');
    expect(res.body.data.assistantMessage.content).toBeDefined();
  });

  it('POST /api/v1/ai/chat > supports Point & Ask target parameter', async () => {
    await setupUsersAndProfiles();

    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        profileId: profileAId,
        message: 'Explain this placement.',
        pointContext: {
          type: 'planet',
          id: 'Mars',
          label: 'Mars in 1st House',
        },
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.assistantMessage.metadata.selectedPoint.id).toBe('Mars');
  });

  it('SECURITY & USER DATA ISOLATION > User B must NOT be able to chat with User A profile', async () => {
    await setupUsersAndProfiles();

    const res = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userBToken}`)
      .send({
        profileId: profileAId, // User B attempting to use User A's profile
        message: 'Tell me about this chart.',
      });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('unauthorized');
  });

  it('SECURITY & USER DATA ISOLATION > User B cannot view User A chat sessions or messages', async () => {
    await setupUsersAndProfiles();

    // User A creates a session and message
    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        profileId: profileAId,
        message: 'User A private astrological question',
      });

    const sessionId = chatRes.body.data.sessionId;

    // User B tries to view User A's session
    const sessionRes = await request(app)
      .get(`/api/v1/ai/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(sessionRes.status).toBe(500);
    expect(sessionRes.body.success).toBe(false);

    // User B tries to view User A's messages
    const msgRes = await request(app)
      .get(`/api/v1/ai/sessions/${sessionId}/messages`)
      .set('Authorization', `Bearer ${userBToken}`);

    expect(msgRes.status).toBe(500);
    expect(msgRes.body.success).toBe(false);
  });

  it('DELETE /api/v1/ai/sessions/:sessionId > deletes session and messages for authenticated owner', async () => {
    await setupUsersAndProfiles();

    const chatRes = await request(app)
      .post('/api/v1/ai/chat')
      .set('Authorization', `Bearer ${userAToken}`)
      .send({
        profileId: profileAId,
        message: 'Question before deletion',
      });

    const sessionId = chatRes.body.data.sessionId;

    const delRes = await request(app)
      .delete(`/api/v1/ai/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.success).toBe(true);

    const getRes = await request(app)
      .get(`/api/v1/ai/sessions/${sessionId}`)
      .set('Authorization', `Bearer ${userAToken}`);

    expect(getRes.status).toBe(500);
  });
});
