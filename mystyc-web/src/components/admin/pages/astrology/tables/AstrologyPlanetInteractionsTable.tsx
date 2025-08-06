'use client'

import { useEffect, useCallback, useState } from 'react';

import { PlanetInteraction } from 'mystyc-common/schemas';
import { Pagination } from 'mystyc-common/admin';
import { getPlanetInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminErrorPage from '@/components/admin/ui/AdminError';
import { PlanetInteractionsTable } from '../AstrologyTables';

interface AstrologyPlanetInteractionsTableProps {
  isActive?: boolean;
}

export default function AstrologyPlanetInteractionsTable({ isActive = false }: AstrologyPlanetInteractionsTableProps) {
  const { setBusy, isBusy } = useBusy();
  const [planetInteractions, setPlanetInteractions] = useState<PlanetInteraction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadPlanetInteractions = useCallback(async (page: number) => {
    try {
      setBusy(1000);
      setError(null);

      const listQuery = getDefaultListQuery(page);
      const response = await getPlanetInteractions({deviceInfo: getDeviceInfo(), ...listQuery});

      setPlanetInteractions(response.data);
      setPagination(response.pagination);
      setCurrentPage(page);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load planet interactions:', err);
      setError('Failed to load planet interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadPlanetInteractions(0);
    }
  }, [isActive, hasLoaded, loadPlanetInteractions]);

  if (error) {
    return (
      <AdminErrorPage
        title='Unable to load planet interactions'
        error={error}
        onRetry={() => loadPlanetInteractions(0)}
      />
    )
  }

  return (
    <PlanetInteractionsTable
      data={planetInteractions}
      pagination={pagination}
      loading={isBusy || !hasLoaded}
      currentPage={currentPage}
      onPageChange={loadPlanetInteractions}
      onRefresh={() => loadPlanetInteractions(currentPage)}
    />
  );
}