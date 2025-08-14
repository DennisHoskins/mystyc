'use client'

import { useState, useEffect, useCallback } from 'react';
import { MoonStar } from 'lucide-react';

import { PlanetInteraction } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getPlanetInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import PlanetInteractionsTable from './PlanetInteractionsTable';

export default function PlanetInteractionsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<PlanetInteraction> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Planet Interactions' },
  ];

  const loadPlanetInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "planet1";
      const interactions = await getPlanetInteractions({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(interactions);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load planet interactions:', err);
      setError('Failed to load planet interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPlanetInteractions(0);
  }, [loadPlanetInteractions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadPlanetInteractions(0)}
      breadcrumbs={breadcrumbs}
      icon={<MoonStar className='w-3 h-3' />}
      title={"Planets"}
      mainContent={
        <PlanetInteractionsTable 
          planetInteractions={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadPlanetInteractions={loadPlanetInteractions}
        />
      }
    />
  );
}