import { ApiSuccessResponse } from '../types';
import { AdminOverviewData, AdminUser, AdminSubscription, AdminAuditLog } from '../types/admin';

export class AdminApi {
  public static async getOverview(): Promise<ApiSuccessResponse<AdminOverviewData>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/admin/analytics/overview', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async getSubscriptionsAnalytics(): Promise<ApiSuccessResponse<{ breakdown: any[] }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/admin/analytics/subscriptions', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async getUsageAnalytics(): Promise<ApiSuccessResponse<{ usageByFeature: any[] }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch('/api/v1/admin/analytics/usage', {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async getUsers(
    page = 1,
    limit = 20,
    search = ''
  ): Promise<ApiSuccessResponse<{ users: AdminUser[]; total: number; page: number; totalPages: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), search });
    const res = await fetch(`/api/v1/admin/users?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async updateUserStatus(
    id: string,
    isActive: boolean
  ): Promise<ApiSuccessResponse<{ user: AdminUser }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const res = await fetch(`/api/v1/admin/users/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ isActive }),
    });
    return res.json();
  }

  public static async getSubscriptions(
    page = 1,
    limit = 20
  ): Promise<ApiSuccessResponse<{ subscriptions: AdminSubscription[]; total: number; page: number; totalPages: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString() });
    const res = await fetch(`/api/v1/admin/subscriptions?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }

  public static async getAuditLogs(
    page = 1,
    limit = 30,
    action = ''
  ): Promise<ApiSuccessResponse<{ auditLogs: AdminAuditLog[]; total: number; page: number; totalPages: number }>> {
    const token = localStorage.getItem('astrologer_access_token');
    const query = new URLSearchParams({ page: page.toString(), limit: limit.toString(), action });
    const res = await fetch(`/api/v1/admin/audit-logs?${query.toString()}`, {
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    return res.json();
  }
}
