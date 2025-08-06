'use client'

import { useEffect, useCallback, useState } from 'react';

import { PlanetaryPosition } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getPlanetaryPositions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import { PlanetaryPositionsTable } from '../AstrologyTables';

interface AstrologyPlanetaryPositionsTableProps {
  isActive?: boolean;
}

export default function AstrologyPlanetaryPositionsTable({ isActive = false }: AstrologyPlanetaryPositionsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [planetaryPositions, setPlanetaryPositions] = useState<PlanetaryPosition[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPlanetaryPositions = useCallback(async (page: number) => {
    try {
      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getPlanetaryPositions({deviceInfo: getDeviceInfo(), ...listQuery});

      setPlanetaryPositions(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load planetary positions:', err);
      setError('Failed to load planetary positions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadPlanetaryPositions(0);
    }
  }, [isActive, hasLoaded, loadPlanetaryPositions]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load planetary positions'
        error={error}
        onRetry={() => loadPlanetaryPositions(0)}
      />
    )
  }

  return (
    <PlanetaryPositionsTable
      data={planetaryPositions}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadPlanetaryPositions}
      onRefresh={() => loadPlanetaryPositions(currentPage)}
    />
  );
}