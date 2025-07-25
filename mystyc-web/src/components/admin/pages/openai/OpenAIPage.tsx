'use client';

import { useState, useEffect, useCallback } from 'react';

import { OpenAIUsage } from 'mystyc-common/schemas';
import { OpenAIUsageStats, AdminListResponse, AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import OpenAIUsageTable from './OpenAIUsageTable';
import OpenAIDashboard from './OpenAIUsageDashboard';

export default function OpenAIPage() {
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<OpenAIUsageStats> | null>(null);
  const [data, setData] = useState<AdminListResponse<OpenAIUsage> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI Usage' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setLoading(true);
      setBusy(1000);

      const statsQuery = apiClientAdmin.getDefaultStatsQuery();
      const stats = await apiClientAdmin.openai.getStats(statsQuery);

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load OpenAI stats:', err);
      setError('Failed to load OpenAI stats. Please try again.');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [setBusy]);

  const loadUsage = useCallback(async (page: number) => {
    try {
      setError(null);
      setLoading(true);
      setBusy(1000);

      const listQuery = apiClientAdmin.getDefaultListQuery(page);
      const response = await apiClientAdmin.openai.getOpenAIUsages(listQuery);

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load OpenAI usage:', err);
      setError('Failed to load OpenAI usage. Please try again.');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
    loadUsage(0);
  }, [loadData, loadUsage]);

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
          data={data?.data}
          pagination={data?.pagination}
          loading={loading}
          currentPage={currentPage}
          onPageChange={loadUsage}
          onRefresh={() => loadUsage(0)}
        />
      }
    />   
  );
}