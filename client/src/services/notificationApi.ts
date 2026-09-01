import { ApiSuccessResponse } from '../types';
import { InAppNotification, NotificationPreferences } from '../types/notifications';

export class NotificationApi {
  public static async listNotifications(
    limit = 30,
    unreadOnly = false
  ): Promise<ApiSuccessResponse<{ notifications: InAppNotification[]; unreadCount: number; count: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const query = new URLSearchParams({ limit: limit.toString(), unreadOnly: unreadOnly ? 'true' : 'false' });
    const res = await fetch(`/api/v1/notifications?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async markRead(id: string): Promise<ApiSuccessResponse<{ notification: InAppNotification }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch(`/api/v1/notifications/${id}/read`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async markAllRead(): Promise<ApiSuccessResponse<{ modifiedCount: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/notifications/read-all', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async getPreferences(): Promise<ApiSuccessResponse<{ preferences: NotificationPreferences }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/notifications/preferences', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async updatePreferences(
    payload: Partial<NotificationPreferences>
  ): Promise<ApiSuccessResponse<{ preferences: NotificationPreferences }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/notifications/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return res.json();
  }
}
