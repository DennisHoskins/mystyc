import { useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/util/logger';

interface UseAdminListPageOptions<T> {
  entityName: string;
  fetcher: (query?: Record<string, any>) => Promise<T[]>;
  query?: Record<string, any>;
}

interface UseAdminListPageReturn<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useAdminListPage<T>({
  entityName,
  fetcher,
  query,
}: UseAdminListPageOptions<T>): UseAdminListPageReturn<T> {
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!idToken) return;

    logger.log(`[useAdminListPage] Fetching ${entityName} list`);
    setBusy(true);
    setLoading(true);
    setError(null);

    try {
      const result = await fetcher(query);
      setData(result);
      logger.log(`[useAdminListPage] ${entityName} list loaded successfully`);
    } catch (err: any) {
      logger.error(`[useAdminListPage] Failed to load ${entityName} list:`, err);
      handleError(err);
      setError(err.message || `Failed to load ${entityName}`);
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [
    idToken,
    entityName,
    fetcher,
    query,
    setBusy,
    setLoading,
    setError,
    handleError,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = async () => {
    await fetchData();
  };

  return {
    data,
    loading,
    error,
    refresh,
  };
}
