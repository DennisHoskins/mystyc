import { useState, useCallback } from 'react';
import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminScheduleExecutions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getExecutionStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.schedule.getExecutionStats(query);
    } catch (err) {
      logger.error('getExecutionStats failed:', err);
      setError('Failed to load execution stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getExecutions = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.schedule.getExecutions(query);
    } catch (err) {
      logger.error('getExecutions failed:', err);
      setError('Failed to load executions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getExecutionStats,
    getExecutions,
  };
}