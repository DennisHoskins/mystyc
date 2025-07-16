'use client';

import { useState, useEffect, useCallback } from 'react';

import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { Subscription, SubscriptionStats } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/mystyc/admin/ui/AdminListLayout';
import SubscriptionsIcon from '@/components/mystyc/admin/ui/icons/SubscriptionsIcon';
import SubscriptionsTable from './SubscriptionsTable';
import SubscriptionsDashboard from './SubscriptionsDashboard';

export default function SubscriptionsPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [schedules, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState<StatsResponseWithQuery<SubscriptionStats> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Subscriptions' },
  ];

  const loadSubscriptions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getSubscriptions({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setSubscriptions(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await apiClientAdmin.getSubscriptionStats(statsQuery);
      setStats(stats);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SubscriptionsPage');
      if (!wasSessionError) {
        logger.error('Failed to load subscriptions:', err);
        setError('Failed to load subscriptions. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    loadSubscriptions(0);
  }, [loadSubscriptions]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => loadSubscriptions(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={SubscriptionsIcon}
      description="Manage user subscriptions"
      sideContent={
        <SubscriptionsDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={[]}
      tableContent={[
        <SubscriptionsTable
          key='subscriptions'
          label="Subscriptions"
          data={schedules}
          loading={loading}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadSubscriptions}
          onRefresh={() => loadSubscriptions(currentPage)}
        />
      ]}
    />   
  );
}