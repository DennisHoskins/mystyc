'use client'

import { useState, useEffect, useCallback } from 'react';

import { OpenAIUsage } from 'mystyc-common/schemas';
import { OpenAIUsageStats, AdminListResponse } from 'mystyc-common/admin/interfaces';
import { getOpenAIStats, getOpenAIUsages } from '@/server/actions/admin/openai';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Card from '@/components/ui/Card';
import Text from '@/components/ui/Text';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import OpenAIUsageTable from './OpenAIUsageTable';
import OpenAIDashboard from './OpenAIUsageDashboard';

export default function OpenAIPage() {
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<OpenAIUsageStats | null>(null);
  const [data, setData] = useState<AdminListResponse<OpenAIUsage> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'OpenAI Usage' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const stats = await getOpenAIStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load OpenAI stats:', err);
      setError('Failed to load OpenAI stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadUsage = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getOpenAIUsages({deviceInfo: getDeviceInfo(), ...listQuery});

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load OpenAI usage:', err);
      setError('Failed to load OpenAI usage. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
    loadUsage(0);
  }, [loadData, loadUsage]);

  return (
   <AdminItemLayout
      title="OpenAI"
      headerContent={
        <Text >View OpenAI usage statistics and monitor API consumption across all content types</Text>
      }
      error={error}
      onRetry={() => {
        loadData();
        loadUsage(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={<ContentIcon size={3} />}
      sideContent={
        <div className='flex-1 flex flex-col space-y-4'>
          <OpenAIDashboard 
            stats={stats} 
            charts={['stats']}
          />
          <OpenAIDashboard 
            key={'trends'}
            stats={stats} 
            charts={['budget']}
          />
        </div>
      }
      itemsContent={[
        <Card key='stats' className='grow grid grid-cols-3 gap-4 !space-y-0'>
          <OpenAIDashboard 
            className='col-span-2'
            key={'budget'}
            stats={stats} 
            charts={['trends']}
          />
          <OpenAIDashboard 
            key={'types'}
            stats={stats} 
            charts={['content-types']}
          />
        </Card>
      ]}
      mainContent={
        <Card className='grow flex flex-col'>
          <OpenAIUsageTable 
            data={data?.data}
            pagination={data?.pagination}
            loading={isBusy}
            currentPage={currentPage}
            onPageChange={loadUsage}
            onRefresh={() => loadUsage(0)}
          />
        </Card>          
      }
    />   
  );
}