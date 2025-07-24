import { useState, useCallback } from 'react';
import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminUsers() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.users.getStats(query);
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
      return await apiClientAdmin.users.getSummary();
    } catch (err) {
      logger.error('getSummary failed:', err);
      setError('Failed to load summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsers = useCallback(async (type: 'all' | 'users' | 'plus', query?: any) => {
    setLoading(true);
    setError(null);
    try {
      switch (type) {
        case 'all':
          return await apiClientAdmin.users.getAll(query);
        case 'users':
          return await apiClientAdmin.users.getUsers(query);
        case 'plus':
          return await apiClientAdmin.users.getPlusUsers(query);
      }
    } catch (err) {
      logger.error('getUsers failed:', err);
      setError('Failed to load users');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUserSummary = useCallback(async (firebaseUid: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.users.getUserSummary(firebaseUid);
    } catch (err) {
      logger.error('getUserSummary failed:', err);
      setError('Failed to load user summary');
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
        apiClientAdmin.users.getStats(query),
        apiClientAdmin.users.getSummary()
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

  return {
    state,
    getStats,
    getSummary,
    getUserSummary,
    getSummaryStats,
    getUsers,
  };
}