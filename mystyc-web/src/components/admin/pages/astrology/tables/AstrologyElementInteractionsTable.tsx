'use client'

import { useEffect, useCallback, useState } from 'react';

import { ElementInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getElementInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import { ElementInteractionsTable } from '../AstrologyTables';

interface AstrologyElementInteractionsTableProps {
  isActive?: boolean;
}

export default function AstrologyElementInteractionsTable({ isActive = false }: AstrologyElementInteractionsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [elementInteractions, setElementInteractions] = useState<ElementInteraction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadElementInteractions = useCallback(async (page: number) => {
    try {
      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getElementInteractions({deviceInfo: getDeviceInfo(), ...listQuery});

      setElementInteractions(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load element interactions:', err);
      setError('Failed to load element interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadElementInteractions(0);
    }
  }, [isActive, hasLoaded, loadElementInteractions]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load element interactions'
        error={error}
        onRetry={() => loadElementInteractions(0)}
      />
    )
  }

  return (
    <ElementInteractionsTable
      data={elementInteractions}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadElementInteractions}
      onRefresh={() => loadElementInteractions(currentPage)}
    />
  );
}