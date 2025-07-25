import { useState, useCallback } from 'react';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

export function useAdminSubscriptions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const state = { loading, error };

  const getStats = useCallback(async (query?: any) => {
    setLoading(true);
    setError(null);
    try {
      return await apiClientAdmin.payments.getStats(query);
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
      return await apiClientAdmin.payments.getSummary();
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
        apiClientAdmin.payments.getStats(query),
        apiClientAdmin.payments.getSummary()
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

  const getSubscriptions = useCallback(async (type: 'payments' | 'subscribers', query?: any) => {
    setLoading(true);
    setError(null);
    try {
      switch (type) {
        case 'payments':
          return await apiClientAdmin.payments.getPayments(query);
        case 'subscribers':
          return await apiClientAdmin.users.getPlusUsers(query);
        default:
          return await apiClientAdmin.payments.getPayments(query);
      }
    } catch (err) {
      logger.error('getSubscriptions failed:', err);
      setError('Failed to load subscriptions');
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
    getSubscriptions,
  };
}