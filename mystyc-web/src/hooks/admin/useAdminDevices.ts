import { useState, useCallback } from 'react';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminDevices() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.devices.getStats(query);
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
      return await apiClientAdmin.devices.getSummary();
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
        apiClientAdmin.devices.getStats(query),
        apiClientAdmin.devices.getSummary()
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

  const getDevices = useCallback(async (type: 'all' | 'online' | 'offline', query?: any) => {
    setLoading(true);
    setError(null);
    try {
      switch (type) {
        case 'all':
          return await apiClientAdmin.devices.getDevices(query);
        case 'online':
          return await apiClientAdmin.devices.getOnlineDevices(query);
        case 'offline':
          return await apiClientAdmin.devices.getOfflineDevices(query);
      }
    } catch (err) {
      logger.error('getDevices failed:', err);
      setError('Failed to load devices');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDeviceSummary = useCallback(async (deviceId: string) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.devices.getDeviceSummary(deviceId);
    } catch (err) {
      logger.error('getDeviceSummary failed:', err);
      setError('Failed to load device summary');
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
    getDevices,
    getDeviceSummary,
  };
}