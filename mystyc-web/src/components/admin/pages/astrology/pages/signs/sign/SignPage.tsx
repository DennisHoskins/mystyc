'use client'

import { useState, useEffect, useCallback } from 'react';

import { Sign, ZodiacSignType } from 'mystyc-common/schemas';
import { getSign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import SignDetailsPanel from './SignDetailsPanel';
import ElementDetailsCard from '../../elements/element/ElementDetailsCard';
import ModalityDetailsCard from '../../modalities/modality/ModalityDetailsCard';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import PlanetarySignPositionsPanel from '../../planetary-positions/PlanetarySignPositionsPanel';

export default function SignPage({ sign } : { sign: ZodiacSignType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [signData, setSign] = useState<Sign | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Signs', href: '/admin/astrology/signs' },
    { label: sign },
  ];

  const loadSign = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      const signData = await getSign({deviceInfo: getDeviceInfo(), sign});
      setSign(signData);
    } catch (err) {
      logger.error('Failed to load sign:', err);
      setError('Failed to load sign. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, sign]);

  useEffect(() => {
    loadSign();
  }, [loadSign]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadSign}
      breadcrumbs={breadcrumbs}
      icon={getZodiacIcon(sign)}
      title={signData?.sign || "Sun Sign"}
      headerContent={<SignDetailsPanel sign={signData} />}
      sideContent={<PlanetarySignPositionsPanel sign={sign} />}
      itemsContent={[
        <div key='sign-content' className='flex flex-col w-full flex-1 space-y-1'>
          <ElementDetailsCard key='element' element={signData?.element || null} />
          <ModalityDetailsCard key='modality' modality={signData?.modality || null} />
          <EnergyTypeDetailsCard key='energy-type' energyType={signData?.energyType || null} className='flex-1 grow' />
        </div>
      ]}
    />
  );
}