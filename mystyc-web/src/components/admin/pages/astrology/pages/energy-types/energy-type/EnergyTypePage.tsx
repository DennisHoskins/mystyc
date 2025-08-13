'use client'

import { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';

import { EnergyType } from 'mystyc-common/schemas';
import { getEnergyType } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import EnergyTypeDetailsPanel from './EnergyTypeDetailsPanel';
import { formatStringForDisplay } from '@/util/util';

export default function EnergyTypePage({ energyType } : { energyType: string }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [energyTypeData, setEnergyType] = useState<EnergyType | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Energy Types', href: '/admin/astrology/energy-types' },
    { label: formatStringForDisplay(energyType) },
  ];

  const loadEnergyType = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const energyTypeData = await getEnergyType({deviceInfo: getDeviceInfo(), energyType});
      setEnergyType(energyTypeData);
    } catch (err) {
      logger.error('Failed to load energy type:', err);
      setError('Failed to load energy type. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, energyType]);

  useEffect(() => {
    loadEnergyType();
  }, [loadEnergyType]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadEnergyType}
      breadcrumbs={breadcrumbs}
      icon={<Zap className='w-3 h-3' />}
      title={energyTypeData?.energyType || "Energy Type"}
      headerContent={<EnergyTypeDetailsPanel energyType={energyTypeData} />}
    />
  );
}