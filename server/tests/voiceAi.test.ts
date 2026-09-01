import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { mockDb } from './setup';

describe('Phase 7: Voice AI Speech-to-Text & Text-to-Speech', () => {
  const app = createApp();
  let userToken: string;

  beforeEach(async () => {
    mockDb.reset();
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Voice Seeker',
      email: 'voice@vedic.com',
      password: 'StrongPassword123!',
    });
    userToken = reg.body.data.accessToken;
  });

  it('POST /api/v1/ai/voice/transcribe should transcribe audio payload', async () => {
    const dummyAudioBase64 = Buffer.from('mock_audio_stream_data').toString('base64');

    const res = await request(app)
      .post('/api/v1/ai/voice/transcribe')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        audioBase64: dummyAudioBase64,
        mimeType: 'audio/webm',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.text).toBeDefined();
  });

  it('POST /api/v1/ai/voice/transcribe should reject invalid audio format', async () => {
    const dummyAudioBase64 = Buffer.from('mock_audio_stream_data').toString('base64');

    const res = await request(app)
      .post('/api/v1/ai/voice/transcribe')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        audioBase64: dummyAudioBase64,
        mimeType: 'image/jpeg',
      });

    expect(res.status).toBe(500); // Caught by centralized error handler
  });

  it('POST /api/v1/ai/voice/synthesize should synthesize audio stream from text', async () => {
    const res = await request(app)
      .post('/api/v1/ai/voice/synthesize')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        text: 'Your 10th house is favorably aspected by Jupiter.',
        voice: 'nova',
      });

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('audio');
  });
});
