'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PlanetaryPosition, ZodiacSignType } from 'mystyc-common/schemas';
import { getPlanetaryPositionsBySign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';

export default function PlanetarySignPositionsPanel({ sign } : { sign: ZodiacSignType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetaryPosition[]>([]);

  const loadPlanetaryPositions = useCallback(async (sign: ZodiacSignType) => {
    try {
      setError(null);
      setBusy(1000);
      const positions = await getPlanetaryPositionsBySign({deviceInfo: getDeviceInfo(), sign});
      setData(positions);
    } catch (err) {
      logger.error('Failed to load planetary positions:', err);
      setError('Failed to load planetary positions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadPlanetaryPositions(sign);
  }, [loadPlanetaryPositions, sign]);

  if (error) {
    return (
      <>
        <AdminPanelHeader
          icon={<Eclipse className='w-3 h-3' />}
          heading='Planetary Positions'
          href='/admin/astrology/planetary-positions'
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
        icon={<Eclipse className='w-3 h-3' />}
        heading='Planetary Positions'
        href='/admin/astrology/planetary-positions'
      />
      <div className='flex flex-col space-y-6'>
        {data.map((item) => (
          <Panel padding={4} key={item.planet}>
            <AdminDetailField 
              heading={item.planet}
              headingicon={getPlanetIcon(item.planet, "w-3 h-3")}
              headinghref={'/admin/astrology/planets/' + item.planet}
              value={
                <div className='flex flex-col space-y-2'>
                  <Link href={'/admin/astrology/planets/' + item.planet} className='!text-gray-500 text-wrap !no-underline'>
                    {item.description}
                    <br />
                    <span className='text-xs'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                  </Link>
                  <Capsule
                    icon={<Energy size={2} />} 
                    label={item?.energyType || ''} 
                    href={'/admin/astrology/energy-types/' + item?.energyType} 
                  />
                </div>
              }
            />
          </Panel>
        ))}        
      </div>
    </>
  );
}