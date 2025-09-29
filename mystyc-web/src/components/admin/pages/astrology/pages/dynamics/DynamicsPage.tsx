'use client'

import { useState, useEffect, useCallback } from 'react';
import { Icon } from 'lucide-react';
import { yinYang } from '@lucide/lab';

import { Dynamic } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getDynamics } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import DynamicsTable from './DynamicsTable';

export default function DynamicsPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<Dynamic> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Dynamics' },
  ];

  const loadDynamics = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "dynamic";
      const dynamics = await getDynamics({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(dynamics);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load dynamics:', err);
      setError('Failed to load dynamics. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadDynamics(0);
  }, [loadDynamics]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadDynamics(0)}
      breadcrumbs={breadcrumbs}
      icon={<Icon iconNode={yinYang} className='w-3 h-3' />}
      title={"Energy Types"}
      mainContent={
        <DynamicsTable 
          dynamics={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadDynamics={loadDynamics}
        />
      }
    />
  );
}