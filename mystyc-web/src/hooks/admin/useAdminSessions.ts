import { useState, useCallback } from 'react';
import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminSessions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.sessions.getStats(query);
    } catch (err) {
      logger.error('getStats failed:', err);
      setError('Failed to load stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessions = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.sessions.getSessions(query);
    } catch (err) {
      logger.error('getSessions failed:', err);
      setError('Failed to load sessions');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getSessionsDevices = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.sessions.getSessionsDevices(query);
    } catch (err) {
      logger.error('getSessionsDevices failed:', err);
      setError('Failed to load session devices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getStats,
    getSessions,
    getSessionsDevices,
  };
}