'use client';

import { useEffect, useCallback, useState } from 'react';

import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { Pagination } from 'mystyc-common/admin';
import { getUserPayments } from '@/server/actions/admin/users';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import PaymentsTable from '@/components/admin/pages/subscriptions/PaymentsTable';

interface UserPaymentsTableProps {
  firebaseUid?: string | null;
  isActive?: boolean;
}

export default function UserPayments({ firebaseUid, isActive = false }: UserPaymentsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPayments = useCallback(async (page: number) => {
    try {
      if (!firebaseUid) {
        return;
      }

      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getUserPayments({deviceInfo: getDeviceInfo(), firebaseUid, ...listQuery});

      setPayments(response.data);
      setCurrentPage(page);
      setPagination(response.pagination);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load user payments:', err);
      setError('Failed to load user payments. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [firebaseUid, setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadPayments(0);
    }
  }, [isActive, hasLoaded, loadPayments]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load user payments'
        error={error}
        onRetry={() => loadPayments(0)}
      />
    )
  }

  return (
    <PaymentsTable
      data={payments}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadPayments}
      onRefresh={() => loadPayments(currentPage)}
    />
  );
}