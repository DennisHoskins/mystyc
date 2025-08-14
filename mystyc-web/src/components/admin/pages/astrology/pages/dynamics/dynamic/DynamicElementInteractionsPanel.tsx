'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ElementInteraction, DynamicType } from 'mystyc-common/schemas';
import { getElementInteractionsByDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import Text from '@/components/ui/Text';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function DynamicElementInteractionsPanel({ dynamic } : { dynamic: DynamicType }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ElementInteraction[]>([]);

  const loadInteractions = useCallback(async (dynamic: DynamicType) => {
    try {
      setError(null);
      const interactions = await getElementInteractionsByDynamic({deviceInfo: getDeviceInfo(), dynamic});
      setData(interactions);
    } catch (err) {
      logger.error('Failed to load dynamic element interactions:', err);
      setError('Failed to load dynamic element interactions. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadInteractions(dynamic);
  }, [loadInteractions, dynamic]);

  console.log(error);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Atom className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/element-interactions'>
            <Heading level={3}>Element Interactions</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6 pt-1'>
        {data.map((item) => (
          <AdminDetailField 
            key={item.element1 + '-' + item.element2}
            heading={[item.element1, item.element2]}
            headingicon={[getElementIcon(item.element1, "w-3 h-3"), getElementIcon(item.element2, "w-3 h-3")]}
            headinghref={['/admin/astrology/elements/' + item.element1, '/admin/astrology/elements/' + item.element2]}
            value={
              <div className='flex flex-col space-y-2'>
                <Text className='!text-gray-500 text-wrap flex-1'>
                  {item.description}
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
        ))}        
      </div>
    </>
  );
}