import { useState, useCallback } from 'react';
import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminNotifications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.notifications.getStats(query);
    } catch (err) {
      logger.error('getStats failed:', err);
      setError('Failed to load stats');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getNotifications = useCallback(async (type: 'all' | 'scheduled' | 'user' | 'broadcast', query?: any) => {
    setLoading(true);
    setError(null);
    try {
      // NOTE: The API currently only has getNotifications() - we may need to add filtering
      // For now, return all notifications and filter client-side, or add new API endpoints
      switch (type) {
        case 'all':
          return await apiClientAdmin.notifications.getNotifications(query);
        case 'scheduled':
          // Would need: getScheduledNotifications() or filter by executionId
          return await apiClientAdmin.notifications.getNotifications({ ...query, filter: 'scheduled' });
        case 'user':
          // Would need: getUserNotifications() or filter by firebaseUid + not broadcast
          return await apiClientAdmin.notifications.getNotifications({ ...query, filter: 'user' });
        case 'broadcast':
          // Would need: getBroadcastNotifications() or filter by type=broadcast
          return await apiClientAdmin.notifications.getNotifications({ ...query, filter: 'broadcast' });
        default:
          return await apiClientAdmin.notifications.getNotifications(query);
      }
    } catch (err) {
      logger.error('getNotifications failed:', err);
      setError('Failed to load notifications');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    state,
    getStats,
    getNotifications,
  };
}