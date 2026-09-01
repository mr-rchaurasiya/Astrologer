import { RecommendationItem } from '../types/recommendation';

const getHeaders = () => {
  const token = localStorage.getItem('astrologer_access_token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const recommendationApi = {
  async getRecommendations(): Promise<RecommendationItem[]> {
    const res = await fetch('/api/v1/recommendations', { headers: getHeaders() });
    const json = await res.json();
    return json.data?.recommendations || [];
  },

  async dismissRecommendation(id: string): Promise<boolean> {
    const res = await fetch(`/api/v1/recommendations/${id}/dismiss`, {
      method: 'POST',
      headers: getHeaders(),
    });
    const json = await res.json();
    return json.data?.dismissed || false;
  },
};
