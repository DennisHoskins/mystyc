'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { ModalityInteraction, ModalityType } from 'mystyc-common/schemas';
import { getModalityInteractionsByModality } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';

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

  console.log(error);

  return (
    <Card className='grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Expand className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/modality-interactions'>
            <Heading level={3}>Modality Interactions</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6 pt-1'>
        {data.map((item) => (
          <AdminDetailField 
            key={item.modality2}
            heading={item.modality2}
            headingicon={getModalityIcon(item.modality2, "w-3 h-3")}
            headinghref={'/admin/astrology/modalities/' + item.modality2}
            value={
              <div className='flex flex-col space-y-2'>
                <Link href={'/admin/astrology/modalities/' + item.modality2} className='!text-gray-500 text-wrap !no-underline flex-1'>
                  {item.description}
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
        ))}        
      </div>
    </Card>
  );
}