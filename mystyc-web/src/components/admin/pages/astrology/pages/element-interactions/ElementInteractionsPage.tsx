'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ElementInteraction } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getElementInteractions } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ElementInteractionsTable from './ElementInteractionsTable';

export default function ElementinteractionsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<ElementInteraction> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Element Interactions' },
  ];

  const loadElementInteractions = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "element1";
      const interactions = await getElementInteractions({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(interactions);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load element interactions:', err);
      setError('Failed to load element interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadElementInteractions(0);
  }, [loadElementInteractions]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadElementInteractions(0)}
      breadcrumbs={breadcrumbs}
      icon={<Atom className='w-3 h-3' />}
      title={"Elements"}
      mainContent={
        <ElementInteractionsTable 
          elementInteractions={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadElementInteractions={loadElementInteractions}
        />
      }
    />
  );
}