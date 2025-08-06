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
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

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
      listQuery.sortBy = "planet";
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

  const columns: Column<PlanetaryPosition>[] = [
    { key: 'planet', header: 'Planet' },
    { key: 'sign', header: 'Sign' },
    { key: 'element', header: 'Element' },
    { key: 'modality', header: 'Modality' },
    { key: 'energyType', header: 'Energy Type' },
    { key: 'keywords', header: 'Keywords', render: (p) => p.keywords.slice(0, 3).join(', ') + (p.keywords.length > 3 ? '...' : '') },
  ];

  return (
    <AdminTable<PlanetaryPosition>
      data={planetaryPositions}
      columns={columns}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      totalPages={pagination?.totalPages}
      hasMore={pagination?.hasMore}
      onPageChange={loadPlanetaryPositions}
      onRefresh={() => loadPlanetaryPositions(currentPage)}
      emptyMessage="No Planetary Positions found."
    />
  );
}