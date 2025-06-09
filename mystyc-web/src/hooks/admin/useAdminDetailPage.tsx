import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';

import { useAuth } from '@/hooks/useAuth';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useCustomRouter } from '@/hooks/useCustomRouter';
import { logger } from '@/util/logger';

interface EntityFetcher<T> {
  main: (id: string) => Promise<T>;
  related?: Array<{
    key: string;
    fetcher: (
      authToken: string, 
      id: string, 
      ...args: any[]
    ) => Promise<any>;
    optional?: boolean;
    args?: any[];
  }>;
}

interface UseAdminDetailPageOptions<T> {
  entityName: string;
  paramKey: string;
  fetcher: EntityFetcher<T>;
  breadcrumbBase ?: { label: string; href: string };
}

interface UseAdminDetailPageReturn<T> {
  entity: T | null;
  relatedData: Record<string, any>;
  loading: boolean;
  error: string | null;
  router: ReturnType<typeof useCustomRouter>;
  refetch: () => Promise<void>;
}

export function useAdminDetailPage<T>({
  entityName,
  paramKey,
  fetcher,
}: UseAdminDetailPageOptions<T>): UseAdminDetailPageReturn<T> {
  const params = useParams();
  const entityId = params[paramKey] as string;
  const { authToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const router = useCustomRouter();

  const [entity, setEntity] = useState<T | null>(null);
  const [relatedData, setRelatedData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!authToken || !entityId) return;

    logger.log(`[useAdminDetailPage] Fetching ${entityName} details for:`, entityId);
    setBusy(true);
    setLoading(true);
    setError(null);

    try {
      // Fetch main entity
      const mainEntity = await fetcher.main(entityId);

      if (!mainEntity) {
        throw new Error(`${entityName} not found`);
      }

      setEntity(mainEntity);
      logger.log(`[useAdminDetailPage] ${entityName} details loaded successfully`);

      // Fetch related data if specified
      if (fetcher.related && fetcher.related.length > 0) {
        const relatedResults: Record<string, any> = {};

        for (const relatedFetcher of fetcher.related) {
          try {
            const args = relatedFetcher.args || [];

            const result = await relatedFetcher.fetcher(authToken, entityId, ...args);

            relatedResults[relatedFetcher.key] = result;
            logger.log(`[useAdminDetailPage] ${relatedFetcher.key} loaded successfully`);
          } catch (relatedErr) {
            if (relatedFetcher.optional) {
              logger.warn(`[useAdminDetailPage] Failed to load optional ${relatedFetcher.key}:`, relatedErr);
              relatedResults[relatedFetcher.key] = null;
            } else {
              throw relatedErr;
            }
          }
        }

        setRelatedData(relatedResults);
      }
    } catch (err: any) {
      logger.error(`[useAdminDetailPage] Failed to load ${entityName} details:`, err);
      handleError(err);
      setError(err.message || `Failed to load ${entityName} details`);
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [
    authToken,
    entityId,
    entityName,
    fetcher,
    setBusy,
    setLoading,
    setError,
    handleError,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = async () => {
    await fetchData();
  };

  return {
    entity,
    relatedData,
    loading,
    error,
    router,
    refetch,
  };
}
