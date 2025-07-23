'use client';

import { useState, useEffect, useCallback } from 'react';

import { ContentStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin'; 

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ContentIcon from '@/components/admin/ui/icons/ContentIcon';
import ContentDashboard from './ContentDashboard';
import ContentsTabPanel from './ContentsTabPanel';

export default function ContentPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<ContentStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Content' },
  ];

  const loadContentStats = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.content.getStats(statsQuery);
      setStats(stats);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to load content:', err);
        setError('Failed to load content. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadContentStats();
  }, [loadContentStats]);

  if (loading) {
    return;
  }

  return (
   <AdminListLayout
      error={error}
      onRetry={() => null}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      description="Manage content entries: view, edit, and monitor generation status, sources, and performance metrics"
      sideContent={
        <ContentDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[
        <ContentDashboard 
          key={'timeline'}
          stats={stats} 
          charts={['timeline']}
        />,
        <ContentDashboard 
          key={'performance'}
          stats={stats} 
          charts={['performance']}
        />,
        <ContentDashboard 
          key={'coverage'}
          stats={stats} 
          charts={['coverage']}
        />
      ]}
      tableContent={<ContentsTabPanel />}
    />   
  );
}