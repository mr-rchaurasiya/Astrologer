import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app';
import { mockDb } from './setup';
import { NotificationService } from '../src/notifications/notification.service';

describe('Phase 7: In-App Notifications & Preference Management', () => {
  const app = createApp();
  let userToken: string;
  let userId: string;

  beforeEach(async () => {
    mockDb.reset();
    const reg = await request(app).post('/api/v1/auth/register').send({
      name: 'Notification User',
      email: 'notif@vedic.com',
      password: 'StrongPassword123!',
    });
    userToken = reg.body.data.accessToken;
    userId = reg.body.data.user.id;

    // Seed test notification
    await NotificationService.createNotification({
      userId,
      type: 'daily_insight',
      title: 'Daily Cosmic Alignment',
      message: 'Jupiter transits your 9th house today favoring spiritual pursuits.',
    });
  });

  it('GET /api/v1/notifications should list notifications and unread count', async () => {
    const res = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.notifications.length).toBe(1);
    expect(res.body.data.unreadCount).toBe(1);
  });

  it('POST /api/v1/notifications/:id/read should mark a notification as read', async () => {
    const listRes = await request(app)
      .get('/api/v1/notifications')
      .set('Authorization', `Bearer ${userToken}`);

    const notifId = listRes.body.data.notifications[0].id;

    const readRes = await request(app)
      .post(`/api/v1/notifications/${notifId}/read`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(readRes.status).toBe(200);
    expect(readRes.body.success).toBe(true);
    expect(readRes.body.data.notification.isRead).toBe(true);
  });

  it('POST /api/v1/notifications/read-all should mark all as read', async () => {
    const res = await request(app)
      .post('/api/v1/notifications/read-all')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.modifiedCount).toBeGreaterThan(0);
  });

  it('GET / PUT /api/v1/notifications/preferences should read and update preferences', async () => {
    const getRes = await request(app)
      .get('/api/v1/notifications/preferences')
      .set('Authorization', `Bearer ${userToken}`);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.preferences.dailyInsight).toBe(true);

    const putRes = await request(app)
      .put('/api/v1/notifications/preferences')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ dailyInsight: false });

    expect(putRes.status).toBe(200);
    expect(putRes.body.data.preferences.dailyInsight).toBe(false);
  });
});
