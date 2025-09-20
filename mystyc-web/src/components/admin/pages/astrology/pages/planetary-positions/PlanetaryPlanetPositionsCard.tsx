'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PlanetaryPosition, PlanetType } from 'mystyc-common/schemas';
import { getPlanetaryPositionsByPlanet } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import Text from '@/components/ui/Text';

export default function PlanetarySignPositionsPanel({ planet } : { planet: PlanetType }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetaryPosition[]>([]);

  const loadPlanetaryPositions = useCallback(async (planet: PlanetType) => {
    try {
      setError(null);
      const positions = await getPlanetaryPositionsByPlanet({deviceInfo: getDeviceInfo(), planet});
      setData(positions);
    } catch (err) {
      logger.error('Failed to load planetary positions:', err);
      setError('Failed to load planetary positions. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadPlanetaryPositions(planet);
  }, [loadPlanetaryPositions, planet]);

  if (error) {
    return (
      <AdminCard
        icon={<Eclipse className='w-3 h-3' />}
        className='grow overflow-hidden'
        title='Planetary Positions'
      >
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard
      icon={<Eclipse className='w-3 h-3' />}
      className='grow overflow-hidden'
      title='Planetary Positions'
    >
      <div className='flex flex-col space-y-4 pt-1'>
        {data.map((item) => (
          <AdminDetailField 
            hasBackground={true}
            key={item.sign}
            heading={item.sign}
            headingicon={getZodiacIcon(item.sign, "w-3 h-3")}
            value={
              <div className='flex flex-col space-y-2'>
                <Link href={'/admin/astrology/signs/' + item.sign} className='!text-gray-500 !no-underline h-auto text-wrap'>
                  {item.description}
                  <br />
                  <span className='text-xs pt-1 block'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                </Link>
                <Capsule
                  icon={<Energy size={2} />} 
                  label={item?.energyType || ''} 
                  href={'/admin/astrology/energy-types/' + item?.energyType} 
                />
              </div>
            }
          />
        ))}
      </div>          
    </AdminCard>
  );
}