'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PlanetInteraction, PlanetType } from 'mystyc-common/schemas';
import { getPlanetInteraction } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import PlanetInteractionDetailsPanel from './PlanetInteractionDetailsPanel';
import PlanetInteractionPanel from './PlanetInteractionPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import DynamicDetailsCard from '../../dynamics/dynamic/DynamicDetailsCard';

export default function PlanetInteractionPage({ interaction } : { interaction: string }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetInteraction | null>(null);

  const [planet1, setPlanet1] = useState<PlanetType | null>(null);
  const [planet2, setPlanet2] = useState<PlanetType | null>(null);

  useEffect(() => {
    if (!interaction) return;
    const [res1, res2] = interaction.split("-") as [PlanetType, PlanetType];
    setPlanet1(res1);
    setPlanet2(res2);
  }, [interaction]);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Planet Interactions', href: '/admin/astrology/planet-interactions' },
    { label: planet1 +'-' + planet2 },
  ];

  const loadPlanetInteraction = useCallback(async (planet1: PlanetType, planet2: PlanetType) => {
    if (!planet1 || !planet2) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);
      const interaction = await getPlanetInteraction({deviceInfo: getDeviceInfo(), planet1, planet2});
      setData(interaction);
    } catch (err) {
      logger.error('Failed to load planet interaction:', err);
      setError('Failed to load planet interaction. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!planet1 || !planet2) {
      return;
    }
    loadPlanetInteraction(planet1, planet2);
  }, [loadPlanetInteraction, planet1, planet2]);

  return (
    <AdminItemLayout
      error={error}
      breadcrumbs={breadcrumbs}
      icon={<Eclipse className='w-3 h-3' />}
      title={"Planet Interaction"}
      headerContent={<PlanetInteractionDetailsPanel interaction={data} />}
      sideContent={<PlanetInteractionPanel interaction={data} />}
      itemsContent={[
        <div key='energy-dynamic' className='flex flex-col w-full space-y-1 grow flex-1'>
          <EnergyTypeDetailsCard energyType={data?.energyType} />
          <DynamicDetailsCard dynamic={data?.dynamic} className='grow flex-1' />
        </div>
      ]}
    />
  );
}