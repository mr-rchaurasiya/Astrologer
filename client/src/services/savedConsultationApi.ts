import { ApiClient } from './api';

export interface SavedConsultationItem {
  id: string;
  sessionId: string;
  profileId?: string;
  title: string;
  tags: string[];
  isFavorite: boolean;
  isArchived: boolean;
  notes: string;
  createdAt: string;
}

export class SavedConsultationApi {
  public static async listSaved(params?: { tag?: string; favorite?: boolean; archived?: boolean; search?: string }): Promise<{ success: boolean; data?: { consultations: SavedConsultationItem[] } }> {
    const query = new URLSearchParams();
    if (params?.tag) query.set('tag', params.tag);
    if (params?.favorite) query.set('favorite', 'true');
    if (params?.archived) query.set('archived', 'true');
    if (params?.search) query.set('search', params.search);

    const qs = query.toString();
    const endpoint = qs ? `/ai/saved?${qs}` : '/ai/saved';
    const res = await ApiClient.fetchWithAuth<{ consultations: SavedConsultationItem[] }>(endpoint);
    return res;
  }

  public static async saveConsultation(data: {
    sessionId: string;
    title?: string;
    tags?: string[];
    notes?: string;
    isFavorite?: boolean;
  }): Promise<{ success: boolean; data?: { saved: SavedConsultationItem } }> {
    const res = await ApiClient.fetchWithAuth<{ saved: SavedConsultationItem }>('/ai/saved', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res;
  }

  public static async updateSaved(
    id: string,
    data: { title?: string; tags?: string[]; isFavorite?: boolean; isArchived?: boolean; notes?: string }
  ): Promise<{ success: boolean; data?: { saved: SavedConsultationItem } }> {
    const res = await ApiClient.fetchWithAuth<{ saved: SavedConsultationItem }>(`/ai/saved/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return res;
  }

  public static async deleteSaved(id: string): Promise<{ success: boolean; data?: { deleted: boolean } }> {
    const res = await ApiClient.fetchWithAuth<{ deleted: boolean }>(`/ai/saved/${id}`, {
      method: 'DELETE',
    });
    return res;
  }
}
