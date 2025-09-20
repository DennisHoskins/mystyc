'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { Modality } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getModalities } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ModalitiesTable from './ModalitiesTable';

export default function ModalitiesPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<Modality> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Modalities' },
  ];

  const loadModalities = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "modality";      
      const modalities = await getModalities({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(modalities);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load modalities:', err);
      setError('Failed to load modalities. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadModalities(0);
  }, [loadModalities]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadModalities(0)}
      breadcrumbs={breadcrumbs}
      icon={<Expand className='w-3 h-3' />}
      title={"Modalities"}
      mainContent={
        <ModalitiesTable 
          modalities={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadModalities={loadModalities}
        />
      }
    />
  );
}