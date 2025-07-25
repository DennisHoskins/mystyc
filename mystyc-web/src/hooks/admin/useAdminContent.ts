import { useState, useCallback } from 'react';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminContent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.content.getStats(query);
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
      return await apiClientAdmin.content.getSummary();
    } catch (err) {
      logger.error('getSummary failed:', err);
      setError('Failed to load summary');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getContents = useCallback(async (type: 'all' | 'notifications' | 'website' | 'users' | 'users-plus', query?: any) => {
    setLoading(true);
    setError(null);
    try {
      switch (type) {
        case 'notifications':
          return await apiClientAdmin.content.getNotificationsContents(query);
        case 'website':
          return await apiClientAdmin.content.getWebsiteContents(query);
        case 'users':
          return await apiClientAdmin.content.getUserContents(query);
        case 'users-plus':
          return await apiClientAdmin.content.getUserPlusContents(query);
        case 'all':
          return await apiClientAdmin.content.getContents(query);
        default:
          return await apiClientAdmin.content.getContents(query);
      }
    } catch (err) {
      logger.error('getContents failed:', err);
      setError('Failed to load content');
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
        apiClientAdmin.content.getStats(query),
        apiClientAdmin.content.getSummary()
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
    getSummaryStats,
    getContents,
  };
}