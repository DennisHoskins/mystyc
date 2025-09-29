'use client'

import { useState, useEffect, useCallback } from 'react';
import { MoonStar } from 'lucide-react';

import { PlanetInteraction, DynamicType } from 'mystyc-common/schemas';
import { getPlanetInteractionsByDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Text from '@/components/ui/Text';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getPlanetIcon } from '@/components/ui/icons/astrology/planets';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import Panel from '@/components/ui/Panel';

export default function DynamicPlanetInteractionsCard({ dynamic, className } : { dynamic: DynamicType, className?: string }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PlanetInteraction[]>([]);

  const loadInteractions = useCallback(async (dynamic: DynamicType) => {
    try {
      setError(null);
      const interactions = await getPlanetInteractionsByDynamic({deviceInfo: getDeviceInfo(), dynamic});
      setData(interactions);
    } catch (err) {
      logger.error('Failed to load dynamic planet interactions:', err);
      setError('Failed to load dynamic planet interactions. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadInteractions(dynamic);
  }, [loadInteractions, dynamic]);

  if (error) {
    return (
      <AdminCard
        icon={<MoonStar className='w-3 h-3' />}
        title='Planet Interactions'
        className={'space-y-2 flex-1 min-h-0 grow' + className}
      >
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard
      icon={<MoonStar className='w-3 h-3' />}
      title='Planet Interactions'
      className={'space-y-2 flex-1 min-h-0 grow' + className}
    >
      {data.map((item) => (
        <Panel padding={4} key={item.planet1 + "-" + item.planet2}>
          <AdminDetailField 
            heading={[item.planet1, item.planet2]}
            headingicon={[getPlanetIcon(item.planet1, "w-3 h-3"), getPlanetIcon(item.planet2, "w-3 h-3")]}
            headinghref={['/admin/astrology/planets/' + item.planet1, '/admin/astrology/planets/' + item.planet2]}
            value={
              <div className='flex flex-col space-y-2'>
                <Text className='!text-gray-500 text-wrap flex-1'>
                  <span className='text-gray-300'>{item.description}</span>
                  <br />
                  <span className='text-xs'>
                    <strong>Action</strong>
                    <span className='text-gray-300 ml-1'>{item.action}</span>
                  </span>
                  <br />
                  <span className='text-xs'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                </Text>
                <div className='flex space-x-1'>
                  <Capsule
                    icon={<Energy size={3} />} 
                    label={item?.energyType || ''} 
                    href={'/admin/astrology/energy-types/' + item?.energyType} 
                  />
                </div>
              </div>
            }
          />
        </Panel>
      ))}        
    </AdminCard>
  );
}