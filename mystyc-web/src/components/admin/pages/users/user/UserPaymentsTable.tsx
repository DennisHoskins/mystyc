'use client';

import { useEffect, useCallback, useState } from 'react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { PaymentHistory } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminErrorPage from '@/components/admin/ui/AdminError';
import PaymentsTable from '@/components/admin/pages/subscriptions/PaymentsTable';

interface UserPaymentsTableProps {
  firebaseUid: string;
  isActive?: boolean;
}

export default function UserPayments({ firebaseUid, isActive = false }: UserPaymentsTableProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadPayments = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getUserPayments(firebaseUid, {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      setPayments(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load user payments:', err);
      setError('Failed to load user payments. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [firebaseUid]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadPayments(0);
    }
  }, [isActive, hasLoaded, loadPayments]);

  // Show loading state if tab is active but hasn't loaded yet
  if (isActive && !hasLoaded && !loading) {
    return null;
  }

  // Don't render anything if tab isn't active and hasn't loaded
  if (!isActive && !hasLoaded) {
    return null;
  }

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
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={loadPayments}
      onRefresh={() => loadPayments(currentPage)}
    />
  );
}