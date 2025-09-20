'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ElementInteraction, DynamicType } from 'mystyc-common/schemas';
import { getElementInteractionsByDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Text from '@/components/ui/Text';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import Panel from '@/components/ui/Panel';

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

  if (error) {
    return (
      <>
        <AdminPanelHeader
          icon={<Atom className='w-3 h-3' />}
          heading='Element Interactions'
          href='/admin/astrology/element-interactions'
        />
        <div className='flex flex-col items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </>
    );
  }

  return (
    <>
      <AdminPanelHeader
        icon={<Atom className='w-3 h-3' />}
        heading='Element Interactions'
        href='/admin/astrology/element-interactions'
      />
      <div className='flex flex-col space-y-2'>
        {data.map((item) => (
          <Panel padding={4} key={item.element1 + '-' + item.element2}>
            <AdminDetailField 
              heading={[item.element1, item.element2]}
              headingicon={[getElementIcon(item.element1, "w-3 h-3"), getElementIcon(item.element2, "w-3 h-3")]}
              headinghref={['/admin/astrology/elements/' + item.element1, '/admin/astrology/elements/' + item.element2]}
              value={
                <div className='flex flex-col space-y-2'>
                  <Text className='!text-gray-500 text-wrap flex-1'>
                    {item.description}
                    <br />
                    <span className='text-xs'><strong className='mr-1'>Action</strong>{item.action}</span>
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
      </div>
    </>
  );
}