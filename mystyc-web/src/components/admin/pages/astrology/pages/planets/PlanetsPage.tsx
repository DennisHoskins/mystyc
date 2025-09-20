'use client'

import { useState, useEffect, useCallback } from 'react';
import { MoonStar } from 'lucide-react';

import { Planet } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getPlanets } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import PlanetsTable from './PlanetsTable';

export default function PlanetsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<Planet> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Planets' },
  ];

  const loadPlanets = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "planet";      
      const planets = await getPlanets({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(planets);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load planets:', err);
      setError('Failed to load planets. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPlanets(0);
  }, [loadPlanets]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadPlanets(0)}
      breadcrumbs={breadcrumbs}
      icon={<MoonStar className='w-3 h-3' />}
      title={"Planets"}
      mainContent={
        <PlanetsTable 
          planets={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadPlanets={loadPlanets}
        />
      }
    />
  );
}