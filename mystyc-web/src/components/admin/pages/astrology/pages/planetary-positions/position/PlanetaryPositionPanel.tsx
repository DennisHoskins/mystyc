'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { PlanetaryPosition, Planet, Sign, PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { getPlanet, getSign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import PlanetPanel from '../../planets/planet/PlanetPanel';
import SignPanel from '../../signs/sign/SignPanel';

export default function PlanetaryPositionPanel({ position } : { position?: PlanetaryPosition | null }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [planet, setPlanet] = useState<Planet | null>(null);
  const [sign, setSign] = useState<Sign | null>(null);

  const loadElements = useCallback(async (planet: PlanetType, sign: ZodiacSignType) => {
    try {
      setError(null);
      setBusy(1000);
      const resultPlanet = await getPlanet({deviceInfo: getDeviceInfo(), planet});
      setPlanet(resultPlanet);
      const resultSign = await getSign({deviceInfo: getDeviceInfo(), sign});
      setSign(resultSign);
    } catch (err) {
      logger.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!position || !position.planet || !position.sign) {
      return;
    }
    loadElements(position.planet, position.sign);
  }, [loadElements, position]);

  console.log(error);

  return (
    <div className='space-y-2 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Atom className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/planetary-positions'>
            <Heading level={3}>Position</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6'>
        <PlanetPanel planet={planet} />
        <SignPanel sign={sign} />
      </div>
    </div>
  );
}