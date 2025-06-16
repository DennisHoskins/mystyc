import { useEffect, useState, useCallback } from 'react';

import { useBusy } from '@/components/context/BusyContext';
import { AdminQuery } from '@/interfaces';
//import { useErrorHandler } from '@/hooks/useErrorHandler';
import { logger } from '@/util/logger';

interface UseAdminListPageOptions<T> {
  entityName: string;
  fetcher: (
    query?: AdminQuery
  ) => Promise<T[]>;
  query?: AdminQuery;
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
  const { setBusy } = useBusy();
//  const { handleError } = useErrorHandler();
  
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
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
//      handleError(err);
      setError(err.message || `Failed to load ${entityName}`);
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [
    entityName,
    fetcher,
    query,
    setBusy,
    setLoading,
    setError,
//    handleError,
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
