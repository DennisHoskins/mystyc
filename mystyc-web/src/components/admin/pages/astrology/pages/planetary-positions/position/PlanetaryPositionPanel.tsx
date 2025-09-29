'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { PlanetaryPosition, Planet, Sign, PlanetType, ZodiacSignType } from 'mystyc-common/schemas';
import { getPlanet, getSign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import PlanetPanel from '../../planets/planet/PlanetPanel';
import SignPanel from '../../signs/sign/SignPanel';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';

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

  if (error) {
    return (
      <>
        <AdminPanelHeader
          icon={<Atom className='w-3 h-3' />}
          href='/admin/astrology/planetary-positions'
          heading='Position'
        />
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPanelHeader
        icon={<Atom className='w-3 h-3' />}
        href='/admin/astrology/planetary-positions'
        heading='Position'
      />
      <div className='flex flex-col space-y-4'>
        <Panel padding={4}>
          <PlanetPanel planet={planet} />
        </Panel>
        <Panel padding={4}>
          <SignPanel sign={sign} />
        </Panel>
      </div>
    </>
  );
}