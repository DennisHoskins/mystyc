'use client'

import { useState, useEffect, useCallback } from 'react';

import { Sign } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getSigns } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import SignsTable from './SignsTable';

export default function SignsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<Sign> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Signs' },
  ];

  const loadSigns = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "sign";      
      const signs = await getSigns({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(signs);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load signs:', err);
      setError('Failed to load signs. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadSigns(0);
  }, [loadSigns]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadSigns(0)}
      breadcrumbs={breadcrumbs}
      icon={<AstrologyIcon />}
      title={"Signs"}
      mainContent={
        <SignsTable 
          signs={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadSigns={loadSigns}
        />
      }
    />
  );
}