import { useState, useEffect } from 'react';
import { ApiClient } from '../services/api';
import { HealthData, ServerStatus } from '../types';

export const useHealth = () => {
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [status, setStatus] = useState<ServerStatus>('checking');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await ApiClient.getHealth();
      if (res.success && res.data) {
        setHealthData(res.data);
        setStatus(res.data.status === 'ok' ? 'healthy' : 'degraded');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to connect to API');
      setStatus('offline');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  return { healthData, status, loading, error, refetch: checkHealth };
};
