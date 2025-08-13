'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PlanetaryPosition, ZodiacSignType } from 'mystyc-common/schemas';
import { getPlanetaryPositionsBySign } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

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

console.log(error);

  return (
    <div className='space-y-2 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Eclipse className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/planetary-positions'>
            <Heading level={3}>Planetary Positions</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6'>
        {data.map((item) => (
          <AdminDetailField 
            key={item.planet}
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
                  icon={<Energy size={3} />} 
                  label={item?.energyType || ''} 
                  href={'/admin/astrology/energy-types/' + item?.energyType} 
                />
              </div>
            }
          />
        ))}        
      </div>
    </div>
  );
}