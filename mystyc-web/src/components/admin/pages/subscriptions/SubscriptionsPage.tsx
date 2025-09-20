'use client'

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { SubscriptionStats, SubscriptionsSummary } from 'mystyc-common/admin';
import { getPlusUsers } from '@/server/actions/admin/users';
import { getSubscriptionsSummaryStats, getPayments } from '@/server/actions/admin/payments';
import { getDefaultStatsQuery } from '@/util/admin/getQuery';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import SubscriptionsIcon from '@/components/admin/ui/icons/SubscriptionsIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import TabHeader, { Tab } from '@/components/ui/tabs/TabHeader';
import TabPanel, { TabContent } from '@/components/ui/tabs/TabPanel';
import SubscriptionsBreadcrumbs from './SubscriptionsBreadcrumbs';
import SubscriptionsDashboard from './SubscriptionsDashboard';
import SubscriptionsDashboardGrid from './SubscriptionsDashboardGrid';
import PaymentsTable from './PaymentsTable';
import UsersTable from '../users/UsersTable';

export type SubscriptionView = 'summary' | 'payments' | 'subscribers';

export default function SubscriptionsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<SubscriptionStats | null>(null);
  const [summary, setSummary] = useState<SubscriptionsSummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentView = useCallback((): SubscriptionView => {
    if (searchParams.has('payments')) return 'payments';
    if (searchParams.has('subscribers')) return 'subscribers';
    return 'summary';
  }, [searchParams]);

  const [activeTab, setActiveTab] = useState<string>(getCurrentView());

  const breadcrumbs = SubscriptionsBreadcrumbs({ currentView: activeTab as SubscriptionView, onClick: () => { router.push("subscriptions"); }});

  const handleTabChange = (tabId: string) => {
    const view = tabId as SubscriptionView;
    setActiveTab(tabId);
    
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

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setActiveTab(getCurrentView());
  }, [searchParams, getCurrentView]);

  // Server action wrapper functions
  const getAllPayments = useCallback((params: any) => {
    return getPayments(params);
  }, []);

  const getAllSubscribers = useCallback((params: any) => {
    return getPlusUsers(params);
  }, []);

  const tabs: Tab[] = [
    {
      id: 'summary',
      label: 'Summary',
    },
    {
      id: 'payments',
      label: 'Payments',
      count: summary?.totalPayments,
      hasCount: true
    },
    {
      id: 'subscribers',
      label: 'Subscribers',
      count: summary?.totalSubscriptions,
      hasCount: true
    }
  ];

  const tabContents: TabContent[] = [
    {
      id: 'summary',
      content: (
        <div className='flex-1 flex flex-col overflow-hidden'>
          <SubscriptionsDashboardGrid stats={stats} />
          <div className='flex-1 flex'>
            <SubscriptionsDashboard 
              key={'revenue'}
              stats={stats} 
              charts={['revenue']}
            />
          </div>
        </div>
      )
    },
    {
      id: 'payments',
      content: (
        <PaymentsTable
          serverAction={getAllPayments}
          onRefresh={loadData}
        />
      )
    },
    {
      id: 'subscribers',
      content: (
        <UsersTable
          serverAction={getAllSubscribers}
          onRefresh={loadData}
          hideSubscriptionColumn={true}
        />
      )
    }
  ];

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={SubscriptionsIcon}
      description="Manage user subscriptions and payment history, monitor revenue metrics and subscription analytics"
      headerContent={
        <TabHeader 
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />
      }
      sideContent={
        <SubscriptionsDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      mainContent={
        <TabPanel 
          tabs={tabContents}
          activeTab={activeTab}
        />
      }
    />
  );
}