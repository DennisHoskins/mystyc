'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { Content, ContentStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import Button from '@/components/ui/Button';
import AdminListLayout from '@/components/mystyc/admin/ui/AdminListLayout';
import ContentIcon from '@/components/mystyc/admin/ui/icons/ContentIcon';
import ContentDashboard from './ContentDashboard';
import ContentsTabPanel from './ContentsTabPanel';

export default function ContentPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<StatsResponseWithQuery<ContentStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Content' },
  ];

  const loadContent = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getContentStats(statsQuery);
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
    loadContent(0);
  }, [loadContent]);

  const createContent = async () => {
    try {
      setBusy(true);
      setLoading(true);

      const newContent = await apiClientAdmin.createContent("This is my prompt");
      console.log(newContent);

    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to create content:', err);
        setError('Failed to create content. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }

  if (loading) {
    return;
  }

  return (
   <AdminListLayout
      error={error}
      onRetry={() => null}
      breadcrumbs={breadcrumbs}
      icon={ContentIcon}
      button={
        <Button onClick={createContent}>
          Create Content
        </Button>
      }
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