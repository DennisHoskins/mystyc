'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { PolarityInteraction } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getPolarityInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import PolarityInteractionsTable from './PolarityInteractionsTable';

export default function ModalitiesPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<PolarityInteraction> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Polarity Interactions' },
  ];

  const loadPolarityInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "polarity1";
      const interactions = await getPolarityInteractions({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(interactions);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load polarity interactions:', err);
      setError('Failed to load polarity interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPolarityInteractions(0);
  }, [loadPolarityInteractions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadPolarityInteractions(0)}
      breadcrumbs={breadcrumbs}
      icon={<Expand className='w-3 h-3' />}
      title={"Modalities"}
      mainContent={
        <PolarityInteractionsTable 
          polarityInteractions={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadPolarityInteractions={loadPolarityInteractions}
        />
      }
    />
  );
}