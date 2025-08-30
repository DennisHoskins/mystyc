'use client'

import { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';

import { House } from 'mystyc-common/schemas';
import { getHouse } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import HouseDetailsPanel from './HouseDetailsPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';

export default function HousePage({ house } : { house: number }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [houseData, setHouse] = useState<House | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Energy Types', href: '/admin/astrology/houses' },
    { label: houseData?.name || "" },
  ];

  const loadHouse = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const houseData = await getHouse({deviceInfo: getDeviceInfo(), house});
      setHouse(houseData);
    } catch (err) {
      logger.error('Failed to load house:', err);
      setError('Failed to load house. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, house]);

  useEffect(() => {
    loadHouse();
  }, [loadHouse]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadHouse}
      breadcrumbs={breadcrumbs}
      icon={<Zap className='w-3 h-3' />}
      title={houseData?.name || "House"}
      headerContent={<HouseDetailsPanel house={houseData} />}
      sideContent={[<EnergyTypeDetailsCard key='energy-type' energyType={houseData?.energyType} className='w-full h-full' />]}
    />
  );
}