'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { ModalityInteraction, ModalityType } from 'mystyc-common/schemas';
import { getModalityInteractionsByModality } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';

export default function ModalityInteractionsPanel({ modality } : { modality: ModalityType }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ModalityInteraction[]>([]);

  const loadModalityInteractions = useCallback(async (modality: ModalityType) => {
    try {
      setError(null);
      const interactions = await getModalityInteractionsByModality({deviceInfo: getDeviceInfo(), modality});
      setData(interactions);
    } catch (err) {
      logger.error('Failed to load modality interactions:', err);
      setError('Failed to load modality interactions. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadModalityInteractions(modality);
  }, [loadModalityInteractions, modality]);

  if (error) {
    return (
      <AdminCard
        icon={<Expand className='w-3 h-3' />}
        title='Modality Interactions'
        className='grow flex-1'
      >
        <div className='flex flex-col w-full min-h-0 items-center justify-center'>
          <Text variant='body'>Unable to load data</Text>
        </div>
      </AdminCard>
    );
  }

  return (
    <AdminCard
      icon={<Expand className='w-3 h-3' />}
      title='Modality Interactions'
      className='grow flex-1'
    >
      <div className='flex flex-col space-y-6'>
        {data.map((item) => (
          <Panel padding={4} key={item.modality2}>
            <AdminDetailField 
              heading={item.modality2}
              headingicon={getModalityIcon(item.modality2, "w-3 h-3")}
              headinghref={'/admin/astrology/modalities/' + item.modality2}
              value={
                <div className='flex flex-col space-y-2'>
                  <Link href={'/admin/astrology/modalities/' + item.modality2} className='!text-gray-500 text-wrap !no-underline flex-1'>
                    {item.description}
                    <br />
                    <span className='text-xs'><strong className='mr-1'>Action</strong>{item.action}</span>
                    <br />
                    <span className='text-xs'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                  </Link>
                  <div className='flex space-x-1'>
                    <Capsule
                      icon={<Energy size={3} />} 
                      label={item?.energyType || ''} 
                      href={'/admin/astrology/energy-types/' + item?.energyType} 
                    />
                    <Capsule
                      icon={getDynamicIcon(item?.dynamic, 'w-3 h-3')} 
                      label={item?.dynamic || ''} 
                      href={'/admin/astrology/dynamics/' + item.dynamic} 
                    />
                  </div>
                </div>
              }
            />
          </Panel>
        ))}        
      </div>
    </AdminCard>
  );
}