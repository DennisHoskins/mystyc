'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ElementInteraction, ElementType } from 'mystyc-common/schemas';
import { getElementInteractionsByElement } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';

export default function ElementInteractionsPanel({ element } : { element: ElementType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ElementInteraction[]>([]);

  const loadElementInteractions = useCallback(async (element: ElementType) => {
    try {
      setError(null);
      setBusy(1000);
      const interactions = await getElementInteractionsByElement({deviceInfo: getDeviceInfo(), element});
      setData(interactions);
    } catch (err) {
      logger.error('Failed to load element interactions:', err);
      setError('Failed to load element interactions. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadElementInteractions(element);
  }, [loadElementInteractions, element]);

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
            key={item.element2}
            heading={item.element2}
            headingicon={getElementIcon(item.element2, "w-3 h-3")}
            headinghref={'/admin/astrology/elements/' + item.element2}
            value={
              <div className='flex flex-col space-y-2'>
                <Link href={'/admin/astrology/elements/' + item.element2} className='!text-gray-500 text-wrap !no-underline'>
                  {item.description}
                  <br />
                  <span className='text-xs'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                </Link>
                <div className='flex space-x-2'>
                  <Capsule
                    icon={<Energy size={3} />} 
                    label={item?.energyType || ''} 
                    href={'/admin/astrology/energy-types/' + item?.energyType} 
                  />
                  <Capsule
                    icon={getDynamicIcon(item.dynamic, 'w-3 h-3')} 
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