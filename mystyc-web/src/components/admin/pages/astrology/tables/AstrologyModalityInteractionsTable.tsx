'use client'

import { useEffect, useCallback, useState } from 'react';

import { ModalityInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getModalityInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface AstrologyModalityInteractionsTableProps {
  isActive?: boolean;
}

export default function AstrologyModalityInteractionsTable({ isActive = false }: AstrologyModalityInteractionsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [modalityInteractions, setModalityInteractions] = useState<ModalityInteraction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadModalityInteractions = useCallback(async (page: number) => {
    try {
      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "modality1";
      const response = await getModalityInteractions({deviceInfo: getDeviceInfo(), ...listQuery});

      setModalityInteractions(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load modality interactions:', err);
      setError('Failed to load modality interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadModalityInteractions(0);
    }
  }, [isActive, hasLoaded, loadModalityInteractions]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load modality interactions'
        error={error}
        onRetry={() => loadModalityInteractions(0)}
      />
    )
  }

  const columns: Column<ModalityInteraction>[] = [
    { key: 'modality1', header: 'Modality 1' },
    { key: 'modality2', header: 'Modality 2' },
    { key: 'dynamic', header: 'Dynamic' },
    { key: 'energyType', header: 'Energy Type' },
    { key: 'keywords', header: 'Keywords', render: (m) => m.keywords.slice(0, 3).join(', ') + (m.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<ModalityInteraction>
      data={modalityInteractions}
      columns={columns}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadModalityInteractions}
      onRefresh={() => loadModalityInteractions(currentPage)}
      emptyMessage="No Modality Interactions found."
    />
  );
}