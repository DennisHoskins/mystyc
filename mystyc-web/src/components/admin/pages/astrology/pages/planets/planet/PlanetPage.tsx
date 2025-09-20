'use client'

import { useState, useEffect, useCallback } from 'react';

import { Planet, PlanetType } from 'mystyc-common/schemas';
import { getPlanet } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import PlanetDetailsPanel from './PlanetDetailsPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import PlanetInteractionsPanel from '../../planet-interactions/PlanetInteractionsPanel';
import PlanetaryPlanetPositionsCard from '../../planetary-positions/PlanetaryPlanetPositionsCard';

export default function PlanetPage({ planet } : { planet: PlanetType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [planetData, setPlanet] = useState<Planet | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Planets', href: '/admin/astrology/planets' },
    { label: planet },
  ];

  const loadPlanet = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      const planetData = await getPlanet({deviceInfo: getDeviceInfo(), planet});
      setPlanet(planetData);
    } catch (err) {
      logger.error('Failed to load planet:', err);
      setError('Failed to load planet. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, planet]);

  useEffect(() => {
    loadPlanet();
  }, [loadPlanet]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadPlanet}
      breadcrumbs={breadcrumbs}
      icon={getPlanetIcon(planet)}
      title={planetData?.planet || "Planet"}
      headerContent={<PlanetDetailsPanel planet={planetData} />}
      sideContent={<PlanetInteractionsPanel key='planet-interactions' planet={planet} />}
      itemsContent={[
        <div key='energy-planet' className='flex flex-col space-y-1 w-full'>
          <EnergyTypeDetailsCard key='energy-type' energyType={planetData?.energyType || null} />
          <PlanetaryPlanetPositionsCard planet={planet} />
        </div>
      ]}
    />
  );
}