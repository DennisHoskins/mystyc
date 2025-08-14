'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PlanetaryPosition } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getPlanetaryPositions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import PlanetaryPositionsTable from './PlanetaryPositionsTable';

export default function PlanetaryPositionsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<PlanetaryPosition> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Planetary Positions' },
  ];

  const loadPlanetaryPositions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "planet";
      const positions = await getPlanetaryPositions({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(positions);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load planetary positions:', err);
      setError('Failed to load planetary positions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPlanetaryPositions(0);
  }, [loadPlanetaryPositions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadPlanetaryPositions(0)}
      breadcrumbs={breadcrumbs}
      icon={<Eclipse className='w-3 h-3' />}
      title={"Planets"}
      mainContent={
        <PlanetaryPositionsTable 
          planetaryPositions={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadPlanetaryPositions={loadPlanetaryPositions}
        />
      }
    />
  );
}