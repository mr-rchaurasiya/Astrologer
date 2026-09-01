import { ApiClient } from './api';

export interface CreateShareParams {
  profileId: string;
  title?: string;
  expiresInDays?: number;
  allowedSections?: string[];
}

export interface SharedLinkItem {
  id: string;
  token: string;
  title: string;
  expiresAt: string;
  viewCount: number;
  createdAt: string;
}

export class ShareApi {
  public static async createShareLink(params: CreateShareParams): Promise<{ success: boolean; data?: { token: string; shareUrl: string; expiresAt: string; title: string; allowedSections: string[] } }> {
    const res = await ApiClient.fetchWithAuth<{ token: string; shareUrl: string; expiresAt: string; title: string; allowedSections: string[] }>('/astrology/share/create', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    return res;
  }

  public static async getPublicSharedChart(token: string) {
    const res = await fetch(`/api/v1/astrology/share/public/${token}`);
    return res.json();
  }

  public static async getMySharedLinks(): Promise<{ success: boolean; data?: { links: SharedLinkItem[] } }> {
    const res = await ApiClient.fetchWithAuth<{ links: SharedLinkItem[] }>('/astrology/share/my-links');
    return res;
  }

  public static async revokeShareLink(id: string): Promise<{ success: boolean; data?: { revoked: boolean } }> {
    const res = await ApiClient.fetchWithAuth<{ revoked: boolean }>(`/astrology/share/${id}`, {
      method: 'DELETE',
    });
    return res;
  }
}
