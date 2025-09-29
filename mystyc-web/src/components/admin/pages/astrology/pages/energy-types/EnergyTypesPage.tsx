'use client'

import { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';

import { EnergyType } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin';
import { getEnergyTypes } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { getDefaultListQuery } from '@/util/admin/getQuery';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import EnergyTypesTable from './EnergyTypesTable';

export default function EnergyTypesPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<AdminListResponse<EnergyType> | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'EnergyTypes' },
  ];

  const loadEnergyTypes = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      const listQuery = getDefaultListQuery(page);
      listQuery.sortBy = "energyType";      
      const energyTypes = await getEnergyTypes({deviceInfo: getDeviceInfo(), ...listQuery});
      setData(energyTypes);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load energy types:', err);
      setError('Failed to load energy types. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadEnergyTypes(0);
  }, [loadEnergyTypes]);

  return (
    <AdminListLayout
      error={error}
      onRetry={() => loadEnergyTypes(0)}
      breadcrumbs={breadcrumbs}
      icon={<Zap className='w-3 h-3' />}
      title={"Energy Types"}
      mainContent={
        <EnergyTypesTable 
          energyTypes={data?.data}
          currentPage={currentPage}
          pagination={data?.pagination}
          loadEnergyTypes={loadEnergyTypes}
        />
      }
    />
  );
}