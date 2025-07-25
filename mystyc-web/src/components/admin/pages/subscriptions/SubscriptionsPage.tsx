'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { SubscriptionStats } from 'mystyc-common/admin/interfaces/stats';
import { SubscriptionsSummary } from 'mystyc-common/admin/interfaces/summary';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import SubscriptionsBreadcrumbs from './SubscriptionsBreadcrumbs';
import SubscriptionsDashboard from './SubscriptionsDashboard';
import SubscriptionsDashboardGrid from './SubscriptionsDashboardGrid';
import SubscriptionsSummaryPanel from './SubscriptionsSummaryPanel';
import PaymentsTable from './PaymentsTable';
import UsersTable from '../users/UsersTable';

export type SubscriptionView = 'summary' | 'payments' | 'subscribers';

export default function SubscriptionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin }  = useAdmin();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<SubscriptionStats> | null>(null);
  const [summary, setSummary] = useState<SubscriptionsSummary | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [subscribers, setSubscribers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Determine current view from URL
  const getCurrentView = (): SubscriptionView => {
    if (searchParams.has('payments')) return 'payments';
    if (searchParams.has('subscribers')) return 'subscribers';
    return 'summary';
  };

  const currentView = getCurrentView();
  const breadcrumbs = SubscriptionsBreadcrumbs({ currentView, onClick: () => { router.push("subscriptions"); }});
  const showSubscriptionTable = currentView !== 'summary';

  // Change URL without page reload
  const handleClick = (view: SubscriptionView) => {
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    
    // For query params without values, manually construct
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const summaryStats = await admin.subscriptions.getSummaryStats(statsQuery);

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load subscription data:', err);
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.subscriptions]);

  const loadPayments = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'paidAt',
        sortOrder: 'desc',
      } as const;

      const response = await admin.subscriptions.getSubscriptions("payments", query) as AdminListResponse<PaymentHistory>;
      
      setPayments(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.subscriptions]);

  const loadSubscribers = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      } as const;

      const response = await admin.subscriptions.getSubscriptions("subscribers", query) as AdminListResponse<UserProfile>;
      
      setSubscribers(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load subscribers:', err);
      setError('Failed to load subscribers. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.subscriptions]);

  // Reload data when view changes
  useEffect(() => {
    if (currentView === 'payments') {
      loadPayments(0);
    } else if (currentView === 'subscribers') {
      loadSubscribers(0);
    } else {
      loadData();
    }
  }, [loadData, loadPayments, loadSubscribers, currentView]);

  // Load stats and summary on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderTable = () => {
    if (currentView === 'payments') {
      return (
        <PaymentsTable
          loading={admin.subscriptions.state.loading}
          data={payments}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadPayments}
          onRefresh={() => loadPayments(0)}
        />
      );
    } else if (currentView === 'subscribers') {
      return (
        <UsersTable
          loading={admin.subscriptions.state.loading}
          data={subscribers}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadSubscribers}
          onRefresh={() => loadSubscribers(0)}
          hideSubscriptionColumn={false}
        />
      );
    }
    return null;
  };

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={SubscriptionsIcon}
      description="Manage user subscriptions and payment history, monitor revenue metrics and subscription analytics"
      headerContent={
        <SubscriptionsSummaryPanel 
          summary={summary}
          stats={stats}
          handleClick={handleClick}
          currentView={currentView}
        />
      }
      sideContent={
        <SubscriptionsDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={showSubscriptionTable == false && <SubscriptionsDashboardGrid stats={stats} />}
      tableContent={
        <>
          {showSubscriptionTable ? renderTable() : (
            <div className='flex-1 flex'>
              <SubscriptionsDashboard 
                key={'revenue'}
                stats={stats} 
                charts={['revenue']}
              />
            </div>
          )}
        </>
      }
    />
  );
}