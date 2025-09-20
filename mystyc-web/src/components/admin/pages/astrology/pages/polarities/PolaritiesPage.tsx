'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { Polarity } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getPolarities } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import PolaritiesTable from './PolaritiesTable';

export default function PolaritiesPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<Polarity> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Polarities' },
  ];

  const loadPolarities = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "polarity";      
      const polarities = await getPolarities({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(polarities);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load polarities:', err);
      setError('Failed to load polarities. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPolarities(0);
  }, [loadPolarities]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadPolarities(0)}
      breadcrumbs={breadcrumbs}
      icon={<Expand className='w-3 h-3' />}
      title={"Polarities"}
      mainContent={
        <PolaritiesTable 
          polarities={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadPolarities={loadPolarities}
        />
      }
    />
  );
}