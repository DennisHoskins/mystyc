'use client'

import { useState, useEffect, useCallback } from 'react';
import { MoonStar } from 'lucide-react';

import { PlanetInteraction, PlanetType } from 'mystyc-common/schemas';
import { getPlanetInteractionsByPlanet } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import Text from '@/components/ui/Text';

export default function PlanetInteractionsPanel({ planet } : { planet: PlanetType }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetInteraction[]>([]);

  const loadPlanetInteractions = useCallback(async (planet: PlanetType) => {
    try {
      setError(null);
      const interactions = await getPlanetInteractionsByPlanet({deviceInfo: getDeviceInfo(), planet});
      setData(interactions);
    } catch (err) {
      logger.error('Failed to load planet interactions:', err);
      setError('Failed to load planet interactions. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadPlanetInteractions(planet);
  }, [loadPlanetInteractions, planet]);

  if (error) {
    return (
      <>
        <AdminPanelHeader
          icon={<MoonStar className='w-3 h-3' />}
          heading='Planet Interactions'
          href='/admin/astrology/planet-interactions'
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
        icon={<MoonStar className='w-3 h-3' />}
        heading='Planet Interactions'
        href='/admin/astrology/planet-interactions'
      />
      <div className='flex flex-col space-y-4'>
        {data.map((item) => (
          <AdminDetailField
            key={item.planet2}
            hasBackground={true} 
            heading={item.planet2}
            headingicon={getPlanetIcon(item.planet2, "w-3 h-3")}
            headinghref={'/admin/astrology/planets/' + item.planet2}
            value={
              <div className='flex flex-col space-y-2'>
                <Link href={'/admin/astrology/planets/' + item.planet2} className='!text-gray-500 text-wrap !no-underline flex-1'>
                  {item.description}
                  <br />
                  <span className='text-xs'><strong className='mr-1'>Action</strong>{item.action}</span>
                  <br />
                  <span className='text-xs'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                </Link>
                <div className='flex space-x-1'>
                  <Capsule
                    icon={<Energy size={2} />} 
                    label={item?.energyType || ''} 
                    href={'/admin/astrology/energy-types/' + item?.energyType} 
                  />
                  <Capsule
                    icon={getDynamicIcon(item?.dynamic, 'w-2 h-2')} 
                    label={item?.dynamic || ''} 
                    href={'/admin/astrology/dynamics/' + item.dynamic} 
                  />
                </div>
              </div>
            }
          />
        ))}        
      </div>
    </>
  );
}