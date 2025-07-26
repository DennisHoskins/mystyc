import { useState, useCallback } from 'react';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminOpenAI() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.openai.getStats(query);
    } catch (err) {
      logger.error('getStats failed:', err);
      setError('Failed to load stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsages = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.openai.getOpenAIUsages(query);
    } catch (err) {
      logger.error('getUsages failed:', err);
      setError('Failed to load usage data');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.openai.getOpenAIUsage();
    } catch (err) {
      logger.error('getUsage failed:', err);
      setError('Failed to load current usage');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getStats,
    getUsages,
    getUsage,
  };
}