'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { PlanetInteraction, Planet, PlanetType } from 'mystyc-common/schemas';
import { getPlanet } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import PlanetPanel from '../../planets/planet/PlanetPanel';

export default function PlanetInteractionPanel({ interaction } : { interaction?: PlanetInteraction | null }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [planet1, setPlanet1] = useState<Planet | null>(null);
  const [planet2, setPlanet2] = useState<Planet | null>(null);

  const loadPlanets = useCallback(async (planet1: PlanetType, planet2: PlanetType) => {
    try {
      setError(null);
      setBusy(1000);
      const resultPlanet1 = await getPlanet({deviceInfo: getDeviceInfo(), planet: planet1});
      setPlanet1(resultPlanet1);
      const resultPlanet2 = await getPlanet({deviceInfo: getDeviceInfo(), planet: planet2});
      setPlanet2(resultPlanet2);
    } catch (err) {
      logger.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!interaction || !interaction.planet1 || !interaction.planet2) {
      return;
    }
    loadPlanets(interaction.planet1, interaction.planet2);
  }, [loadPlanets, interaction]);

  console.log(error);

  return (
    <div className='space-y-2 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Atom className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/planetary-interactions'>
            <Heading level={3}>Position</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6'>
        <PlanetPanel planet={planet1} />
        <PlanetPanel planet={planet2} />
      </div>
    </div>
  );
}