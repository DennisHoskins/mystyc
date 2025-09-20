'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PlanetaryPosition, PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { getPlanetaryPosition } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import PlanetaryPositionDetailsPanel from './PlanetaryPositionDetailsPanel';
import PlanetaryPositionPanel from './PlanetaryPositionPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';

export default function PlanetaryPositionPage({ position } : { position: string }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetaryPosition | null>(null);

  const [planet, setPlanet] = useState<PlanetType | null>(null);
  const [sign, setSign] = useState<ZodiacSignType | null>(null);

  useEffect(() => {
    if (!position) return;
    const [positionPosition, positionSign] = position.split("-") as [PlanetType, ZodiacSignType];
    setPlanet(positionPosition);
    setSign(positionSign);
  }, [position]);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Planetary Positions', href: '/admin/astrology/planetary-positions' },
    { label: planet +'-' + sign },
  ];

  const loadPlanetaryPosition = useCallback(async (planet: PlanetType, sign: ZodiacSignType) => {
    if (!planet || !sign) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);
      const position = await getPlanetaryPosition({deviceInfo: getDeviceInfo(), planet, sign});
      setData(position);
    } catch (err) {
      logger.error('Failed to load planetary position:', err);
      setError('Failed to load planetary position. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!planet || !sign) {
      return;
    }
    loadPlanetaryPosition(planet, sign);
  }, [loadPlanetaryPosition, planet, sign]);

  return (
    <AdminItemLayout
      error={error}
      breadcrumbs={breadcrumbs}
      icon={<Eclipse className='w-3 h-3' />}
      title={"Planetary Position"}
      headerContent={<PlanetaryPositionDetailsPanel position={data} />}
      sideContent={<PlanetaryPositionPanel position={data} />}
      itemsContent={[
        <div key='energy-dynamic' className='flex flex-col w-full space-y-1 grow flex-1'>
          <EnergyTypeDetailsCard energyType={data?.energyType} className='grow flex-1' />
        </div>
      ]}
    />
  );
}