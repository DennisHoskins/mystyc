'use client';

import { useState, useEffect, useCallback } from 'react';

import { OpenAIUsage } from 'mystyc-common/schemas';
import { OpenAIUsageStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import OpenAIUsageTable from './OpenAIUsageTable';
import OpenAIDashboard from './OpenAIUsageDashboard';

export default function OpenAIPage() {
  const { admin } = useAdmin();
  const { setBusy } = useBusy();
  const [usage, setUsage] = useState<OpenAIUsage[]>([]);
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<OpenAIUsageStats> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI Usage' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.openai.getStats(statsQuery);
      setStats(stats);
    } catch (err) {
      logger.error('Failed to load OpenAI stats:', err);
      setError('Failed to load OpenAI stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.openai]);

  const loadUsage = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const response = await admin.openai.getUsages({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setUsage(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load OpenAI usage:', err);
      setError('Failed to load OpenAI usage. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.openai]);

  // Load stats and initial usage data
  useEffect(() => {
    loadData();
    loadUsage(0);
  }, [loadData, loadUsage, admin.openai]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadUsage(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      description="View OpenAI usage statistics and monitor API consumption across all content types"
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
          loading={admin.openai.state.loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadUsage}
          onRefresh={() => loadUsage(0)}
        />
      }
    />   
  );
}