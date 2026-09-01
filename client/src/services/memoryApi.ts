import { AIMemoryItem, MemoryCategory } from '../types/memory';

const getHeaders = () => {
  const token = localStorage.getItem('astrologer_access_token');
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const memoryApi = {
  async getMemories(): Promise<AIMemoryItem[]> {
    const res = await fetch('/api/v1/ai/memory', { headers: getHeaders() });
    const json = await res.json();
    return json.data?.memories || [];
  },

  async saveMemory(data: {
    category: MemoryCategory;
    key: string;
    value: string;
    profileId?: string;
    confidence?: number;
  }): Promise<AIMemoryItem> {
    const res = await fetch('/api/v1/ai/memory', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data?.memory;
  },

  async updateMemory(
    id: string,
    data: { value?: string; confidence?: number; category?: MemoryCategory }
  ): Promise<AIMemoryItem> {
    const res = await fetch(`/api/v1/ai/memory/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    return json.data?.memory;
  },

  async deleteMemory(id: string): Promise<boolean> {
    const res = await fetch(`/api/v1/ai/memory/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const json = await res.json();
    return json.data?.deleted || false;
  },

  async clearAllMemories(): Promise<number> {
    const res = await fetch('/api/v1/ai/memory', {
      method: 'DELETE',
      headers: getHeaders(),
    });
    const json = await res.json();
    return json.data?.deletedCount || 0;
  },
};
