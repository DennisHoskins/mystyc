'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { Element } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getElements } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import ElementsTable from './ElementsTable';

export default function ElementsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<Element> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Elements' },
  ];

  const loadElements = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "element";      
      const elements = await getElements({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(elements);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load elements:', err);
      setError('Failed to load elements. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadElements(0);
  }, [loadElements]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadElements(0)}
      breadcrumbs={breadcrumbs}
      icon={<Atom className='w-3 h-3' />}
      title={"Energy Types"}
      mainContent={
        <ElementsTable 
          elements={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadElements={loadElements}
        />
      }
    />
  );
}