'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { ModalityInteraction } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getModalityInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ModalityInteractionsTable from './ModalityInteractionsTable';

export default function ModalitiesPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<ModalityInteraction> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Modality Interactions' },
  ];

  const loadModalityInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "modality1";
      const interactions = await getModalityInteractions({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(interactions);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load modality interactions:', err);
      setError('Failed to load modality interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadModalityInteractions(0);
  }, [loadModalityInteractions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadModalityInteractions(0)}
      breadcrumbs={breadcrumbs}
      icon={<Expand className='w-3 h-3' />}
      title={"Modalities"}
      mainContent={
        <ModalityInteractionsTable 
          modalityInteractions={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadModalityInteractions={loadModalityInteractions}
        />
      }
    />
  );
}