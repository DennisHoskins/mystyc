'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

//import { apiClientAdmin, StatsResponseWithQuery } from '@/api/apiClientAdmin';
import { apiClientAdmin } from '@/api/apiClientAdmin';
//import { getDefaultDashboardStatsQuery } from '../../AdminHome';
import { PaymentHistory } from '@/interfaces';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';


import TabPanel, { Tab } from '@/components/ui/TabPanel';
import PaymentsTable from './PaymentsTable';
import UsersTable from '../users/UsersTable';

interface SubscriptionSummary {
  totalPayments: number;
  totalSubscriptions: number;
}

export default function SubscriptionsTabPanel() {
  const [activeTab, setActiveTab] = useState('payments');
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load summary data (all counts)
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setBusy(true);

        const summaryData = await apiClientAdmin.getSubscriptionsSummary();

        setSummary(summaryData);
      } catch (err) {
        const wasSessionError = await handleSessionError(err, 'SubscriptionsPage');
        if (!wasSessionError) {
          logger.error('Failed to load subscriptions:', err);
          setError('Failed to load subscriptions. Please try again.');
        }
      } finally {
        setLoading(false);
        setBusy(false);
      }
    };

    loadSummary();
  }, []);

  // const loadPayments = useCallback(async (page: number) => {
  //   try {
  //     setError(null);
  //     setBusy(1000);
  //     setLoading(true);

  //     const response = await apiClientAdmin.getPayments({
  //       limit: LIMIT,
  //       offset: page * LIMIT,
  //       sortBy: 'date',
  //       sortOrder: 'desc',
  //     });

  //     setPayments(response.data);
  //     setHasMore(response.pagination.hasMore);
  //     setCurrentPage(page);
  //     setTotalPages(response.pagination.totalPages);

  //     // const statsQuery = getDefaultDashboardStatsQuery();
  //     // const stats = await apiClientAdmin.getSubscriptionStats(statsQuery);
  //     // setStats(stats);
  //   } catch (err) {
  //     const wasSessionError = await handleSessionError(err, 'SubscriptionsPage');
  //     if (!wasSessionError) {
  //       logger.error('Failed to load subscriptions:', err);
  //       setError('Failed to load subscriptions. Please try again.');
  //     }
  //   } finally {
  //     setBusy(false);
  //     setLoading(false);
  //   }
  // }, [setBusy, handleSessionError]);

  // useEffect(() => {
  //   loadPayments
  //   (0);
  // }, [loadPayments]);

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'payments',
        label: 'Payments',
        count: summary?.totalPayments,
        content: (
          <></>
        )
      },
      {
        id: 'users',
        label: 'Users',
        count: summary?.totalSubscriptions,
        content: (
          <></>
        )
      }
    ];
  }, [activeTab, summary]);

  if (loading) {
    return null;
  }

  return (
    <TabPanel 
      tabs={tabs} 
      defaultActiveTab={activeTab}
      onTabChange={setActiveTab}
    />
  );
}