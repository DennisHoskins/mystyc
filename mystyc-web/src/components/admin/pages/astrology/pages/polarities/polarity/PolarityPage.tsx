'use client'

import { useState, useEffect, useCallback } from 'react';
import { Zap } from 'lucide-react';

import { Polarity, PolarityType } from 'mystyc-common/schemas';
import { getPolarity } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import { formatStringForDisplay } from '@/util/util';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import PolarityDetailsPanel from './PolarityDetailsPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';

export default function PolarityPage({ polarity } : { polarity: PolarityType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [polarityData, setPolarity] = useState<Polarity | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Energy Types', href: '/admin/astrology/polarities' },
    { label: formatStringForDisplay(polarity) },
  ];

  const loadPolarity = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const polarityData = await getPolarity({deviceInfo: getDeviceInfo(), polarity});
      setPolarity(polarityData);
    } catch (err) {
      logger.error('Failed to load polarity:', err);
      setError('Failed to load polarity. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, polarity]);

  useEffect(() => {
    loadPolarity();
  }, [loadPolarity]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadPolarity}
      breadcrumbs={breadcrumbs}
      icon={<Zap className='w-3 h-3' />}
      title={polarityData?.polarity || "Energy Type"}
      headerContent={<PolarityDetailsPanel polarity={polarityData} />}
      sideContent={[<EnergyTypeDetailsCard key='energy-type' energyType={polarityData?.energyType} className='w-full h-full' />]}
    />
  );
}