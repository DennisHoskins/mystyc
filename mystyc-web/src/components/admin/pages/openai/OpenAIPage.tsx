'use client';

import { useState, useEffect, useCallback } from 'react';

import { OpenAIUsage } from 'mystyc-common/schemas';
import { OpenAIUsageStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import OpenAIUsageTable from './OpenAIUsageTable';
import OpenAIDashboard from './OpenAIUsageDashboard';

export default function OpenAIPage() {
  const { setBusy } = useBusy();
  const [usage, setUsage] = useState<OpenAIUsage[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<OpenAIUsageStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI Usage' },
  ];

  const loadUsage = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.openai.getOpenAIUsages({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setUsage(response.data);
      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.openai.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load open ai usage:', err);
      setError('Failed to load open ai usage. Please try again.');
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadUsage(0);
  }, [loadUsage])

  return (
   <AdminListLayout
      error={error}
      onRetry={() => loadUsage(0)}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      description="View open ai usage statistics"
      sideContent={
        <OpenAIDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[
        <OpenAIDashboard 
          key={'budget'}
          stats={stats} 
          charts={['budget']}
        />,
        <OpenAIDashboard 
          key={'types'}
          stats={stats} 
          charts={['content-types']}
        />,
        <OpenAIDashboard 
          key={'trends'}
          stats={stats} 
          charts={['trends']}
        />
      ]}
      tableContent={
        <OpenAIUsageTable 
          data={usage}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadUsage}
          onRefresh={() => loadUsage(currentPage)}
        />
      }
    />   
  );
}
