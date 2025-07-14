'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { OpenAIRequest, OpenAIRequestStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/mystyc/admin/ui/AdminListLayout';
import OpenAIRequestsTable from './OpenAIRequestsTable';
import OpenAIIcon from '@/components/mystyc/admin/ui/icons/OpenAIIcon';
import OpenAIDashboard from './OpenAIDashboard';
import OpenAIUsagePanel from './OpenAIUsagePanel';

export default function OpenAIPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [openAiRequests, setOpenAIRequests] = useState<OpenAIRequest[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<OpenAIRequestStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI' },
  ];

  const loadOpenAIRequests = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getOpenAIRequests({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setOpenAIRequests(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);

     const statsQuery = getDefaultDashboardStatsQuery();
     const stats = await apiClientAdmin.getOpenAIRequestStats(statsQuery);
     setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'OpenAIPage');
      if (!wasSessionError) {
        logger.error('Failed to load OpenAI requests:', err);
        setError('Failed to load OpenAI requests. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadOpenAIRequests(0);
  }, [loadOpenAIRequests]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => loadOpenAIRequests(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={OpenAIIcon}
      description="Manage OpenAI requests: view, and monitor generation status, token costs, and performance metrics"
      sideContent={
         <OpenAIDashboard 
           stats={stats} 
           charts={['stats']}
         />
       }
       itemContent={[<OpenAIUsagePanel />]}
       tableContent={
        <OpenAIRequestsTable
          data={openAiRequests}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          hasMore={hasMore}
          onPageChange={loadOpenAIRequests}
          onRefresh={() => loadOpenAIRequests(currentPage)}
        />
      }
    />   
  );
}