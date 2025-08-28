'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { House } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getHouses } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import HousesTable from './HousesTable';

export default function HousesPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<House> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Houses' },
  ];

  const loadHouses = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "polarity";      
      const houses = await getHouses({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(houses);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load houses:', err);
      setError('Failed to load houses. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadHouses(0);
  }, [loadHouses]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadHouses(0)}
      breadcrumbs={breadcrumbs}
      icon={<Expand className='w-3 h-3' />}
      title={"Houses"}
      mainContent={
        <HousesTable 
          houses={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadHouses={loadHouses}
        />
      }
    />
  );
}