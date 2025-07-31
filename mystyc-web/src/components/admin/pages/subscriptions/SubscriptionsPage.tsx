'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';

import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { SubscriptionStats, SubscriptionsSummary, AdminListResponse } from 'mystyc-common/admin';
import { getPlusUsers } from '@/server/actions/admin/users';
import { getSubscriptionsSummaryStats, getPayments } from '@/server/actions/admin/payments';
import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
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
  
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [summary, setSummary] = useState<SubscriptionsSummary | null>(null);
  const [payments, setPayments] = useState<AdminListResponse<PaymentHistory> | null>(null);
  const [subscribers, setSubscribers] = useState<AdminListResponse<UserProfile> | null>(null);
  const [currentPagePayments, setCurrentPagePayments] = useState(0);
  const [currentPageSubscribers, setCurrentPageSubscribers] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = (): SubscriptionView => {
    if (searchParams.has('payments')) return 'payments';
    if (searchParams.has('subscribers')) return 'subscribers';
    return 'summary';
  };
  const currentView = getCurrentView();
  const breadcrumbs = SubscriptionsBreadcrumbs({ currentView, onClick: () => { router.push("subscriptions"); }});
  const showSubscriptionTable = currentView !== 'summary';

  const handleClick = (view: SubscriptionView) => {
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultStatsQuery();
      const summaryStats = await getSubscriptionsSummaryStats({deviceInfo: getDeviceInfo(), ...statsQuery});

      setStats(summaryStats.stats);
      setSummary(summaryStats.summary);
    } catch (err) {
      logger.error('Failed to load subscription data:', err);
      setError('Failed to load subscription data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadPayments = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getPayments({deviceInfo: getDeviceInfo(), ...listQuery});
      
      setPayments(response);
      setCurrentPagePayments(page);
    } catch (err) {
      logger.error('Failed to load payments:', err);
      setError('Failed to load payments. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadSubscribers = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      const listQuery = getDefaultListQuery(page);
      const response = await getPlusUsers({deviceInfo: getDeviceInfo(), ...listQuery});
      
      setSubscribers(response);
      setCurrentPageSubscribers(page);
    } catch (err) {
      logger.error('Failed to load subscribers:', err);
      setError('Failed to load subscribers. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (currentView === 'payments') {
      loadPayments(0);
    } else if (currentView === 'subscribers') {
      loadSubscribers(0);
    } else {
      loadData();
    }
  }, [loadData, loadPayments, loadSubscribers, currentView]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const renderTable = () => {
    if (currentView === 'payments') {
      return (
        <PaymentsTable
          loading={isBusy}
          data={payments?.data}
          pagination={payments?.pagination}
          currentPage={currentPagePayments}
          onPageChange={loadPayments}
          onRefresh={() => loadPayments(0)}
        />
      );
    } else if (currentView === 'subscribers') {
      return (
        <UsersTable
          loading={isBusy}
          data={subscribers?.data}
          pagination={subscribers?.pagination}
          currentPage={currentPageSubscribers}
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