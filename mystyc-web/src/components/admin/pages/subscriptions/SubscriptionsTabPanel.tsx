'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';
import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import TabPanel, { Tab } from '@/components/ui/TabPanel';
import PaymentsTable from './PaymentsTable';
import UsersTable from '../users/UsersTable';
import FormError from '@/components/ui/form/FormError';

interface SubscriptionSummary {
  totalPayments: number;
  totalSubscriptions: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  loaded: boolean;
}

export default function SubscriptionsTabPanel() {
  const [activeTab, setActiveTab] = useState('payments');
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [summary, setSummary] = useState<SubscriptionSummary | null>(null);
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Separate pagination for each tab
  const [paymentsPagination, setPaymentsPagination] = useState<PaginationState>({
    currentPage: 0,
    totalPages: 0,
    hasMore: true,
    loaded: false
  });
  
  const [usersPagination, setUsersPagination] = useState<PaginationState>({
    currentPage: 0,
    totalPages: 0,
    hasMore: true,
    loaded: false
  });

  const LIMIT = 20;

  // Load summary data
  useEffect(() => {
    const loadSummary = async () => {
      try {
        setLoading(true);
        setBusy(true);

        const summaryData = await apiClientAdmin.payments.getSummary();
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
  }, [setBusy, handleSessionError]);

  const loadPayments = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.payments.getPayments({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'paidAt',
        sortOrder: 'desc',
      });

      setPayments(response.data);
      setPaymentsPagination({
        currentPage: page,
        totalPages: response.pagination.totalPages,
        hasMore: response.pagination.hasMore == true,
        loaded: true
      });
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SubscriptionsPage');
      if (!wasSessionError) {
        logger.error('Failed to load subscriptions payments:', err);
        setError('Failed to load subscriptions payments. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  const loadUsers = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.users.getPlusUsers({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setUsers(response.data);
      setUsersPagination({
        currentPage: page,
        totalPages: response.pagination.totalPages,
        hasMore: response.pagination.hasMore == true,
        loaded: true
      });
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SubscriptionsPage');
      if (!wasSessionError) {
        logger.error('Failed to load subscription users:', err);
        setError('Failed to load subscription users. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  // Load default data for active tab on mount
  useEffect(() => {
    if (activeTab === 'payments' && !paymentsPagination.loaded) {
      loadPayments(0);
    } else if (activeTab === 'users' && !usersPagination.loaded) {
      loadUsers(0);
    }
  }, [activeTab, paymentsPagination.loaded, usersPagination.loaded, loadPayments, loadUsers]);

  // Handle tab change and load data if needed
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    
    if (tabId === 'payments' && !paymentsPagination.loaded) {
      loadPayments(0);
    } else if (tabId === 'users' && !usersPagination.loaded) {
      loadUsers(0);
    }
  };

  const tabs: Tab[] = useMemo(() => {
    return [
      {
        id: 'payments',
        label: 'Payments',
        count: summary?.totalPayments,
        content: (
          <PaymentsTable
            data={payments}
            loading={loading}
            currentPage={paymentsPagination.currentPage}
            totalPages={paymentsPagination.totalPages}
            hasMore={paymentsPagination.hasMore}
            onPageChange={loadPayments}
            onRefresh={() => loadPayments(paymentsPagination.currentPage)}
          />
        )
      },
      {
        id: 'users',
        label: 'Users',
        count: summary?.totalSubscriptions,
        content: (
          <UsersTable
            data={users}
            loading={loading}
            currentPage={usersPagination.currentPage}
            totalPages={usersPagination.totalPages}
            hasMore={usersPagination.hasMore}
            onPageChange={loadUsers}
            onRefresh={() => loadUsers(usersPagination.currentPage)}
          />
        )
      }
    ];
  }, [summary, payments, users, loading, paymentsPagination, usersPagination, loadPayments, loadUsers]);

  if (error) {
    return <FormError message={error} />;
  }

  return (
    <TabPanel 
      tabs={tabs} 
      defaultActiveTab={activeTab}
      onTabChange={handleTabChange}
    />
  );
}