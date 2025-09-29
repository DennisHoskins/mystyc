'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { ModalityInteraction, DynamicType } from 'mystyc-common/schemas';
import { getModalityInteractionsByDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminCard from '@/components/admin/ui/AdminCard';
import Text from '@/components/ui/Text';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import Panel from '@/components/ui/Panel';

export default function DynamicModalityInteractionsCard({ dynamic } : { dynamic: DynamicType }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ModalityInteraction[]>([]);

  const loadInteractions = useCallback(async (dynamic: DynamicType) => {
    try {
      setError(null);
      const interactions = await getModalityInteractionsByDynamic({deviceInfo: getDeviceInfo(), dynamic});
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
      <AdminCard
        icon={<Expand className='w-3 h-3' />}
        title='Modality Interactions'
        href='/admin/astrology/modality-interactions'
        className='!flex-none'
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
      href='/admin/astrology/modality-interactions'
      className='!flex-none'
    >
      <div className='flex flex-col space-y-4'>
        {data.map((item) => (
          <Panel padding={4} key={item.modality1 + '-' + item.modality2}>
            <AdminDetailField 
              heading={[item.modality1, item.modality2]}
              headingicon={[getModalityIcon(item.modality1, "w-3 h-3"), getModalityIcon(item.modality2, "w-3 h-3")]}
              headinghref={['/admin/astrology/modalities/' + item.modality1, '/admin/astrology/modalities/' + item.modality2]}
              value={
                <>
                  <Text className='text-wrap flex-1'>
                    <span className='text-gray-100'>{item.description}</span>
                    <br />
                    <span className='text-xs'><strong className='mr-1'>Action</strong>{item.action}</span>
                    <br />
                    <span className='text-xs text-gray-500'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                  </Text>
                  <div className='flex space-x-1'>
                    <Capsule
                      icon={<Energy size={2} />} 
                      label={item?.energyType || ''} 
                      href={'/admin/astrology/energy-types/' + item?.energyType} 
                    />
                  </div>
                </>
              }
            />
          </Panel>
        ))}        
      </div>
    </AdminCard>
  );
}