import { useState, useCallback } from 'react';
import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminStats() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getDashboard = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.stats.getDashboard(query);
    } catch (err) {
      logger.error('getDashboard failed:', err);
      setError('Failed to load dashboard');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTrafficStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.stats.getTrafficStats(query);
    } catch (err) {
      logger.error('getTrafficStats failed:', err);
      setError('Failed to load traffic stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getDashboard,
    getTrafficStats,
  };
}