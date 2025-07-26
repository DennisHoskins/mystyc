import { useState, useCallback } from 'react';
import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminSchedules() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.schedule.getStats(query);
    } catch (err) {
      logger.error('getStats failed:', err);
      setError('Failed to load stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSchedules = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.schedule.getSchedules(query);
    } catch (err) {
      logger.error('getSchedules failed:', err);
      setError('Failed to load schedules');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getTimezones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.schedule.getTimezones();
    } catch (err) {
      logger.error('getTimezones failed:', err);
      setError('Failed to load timezones');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getStats,
    getSchedules,
    getTimezones,
  };
}