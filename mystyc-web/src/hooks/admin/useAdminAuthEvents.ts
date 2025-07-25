import { useState, useCallback } from 'react';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminAuthEvents() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.auth.getStats(query);
    } catch (err) {
      logger.error('getStats failed:', err);
      setError('Failed to load stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummary = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.auth.getSummary();
    } catch (err) {
      logger.error('getSummary failed:', err);
      setError('Failed to load summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSummaryStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      const [stats, summary] = await Promise.all([
        apiClientAdmin.auth.getStats(query),
        apiClientAdmin.auth.getSummary()
      ]);
      return { stats, summary };
    } catch (err) {
      logger.error('getSummaryStats failed:', err);
      setError('Failed to load summary stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getAuthEvents = useCallback(async (type: 'all' | 'create' | 'login' | 'logout' | 'server-logout', query?: any) => {
    setLoading(true);
    setError(null);
    try {
      if (type == 'all') return await apiClientAdmin.auth.getAuthEvents(query);
      else return await apiClientAdmin.auth.getAuthEventsByType(type, query);
    } catch (err) {
      logger.error('getDevices failed:', err);
      setError('Failed to load devices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getStats,
    getSummary,
    getSummaryStats,
    getAuthEvents,
  };
}