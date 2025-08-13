'use client'

import { useState, useEffect, useCallback } from 'react';
import { Expand } from 'lucide-react';

import { ModalityInteraction, DynamicType } from 'mystyc-common/schemas';
import { getModalityInteractionsByDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import Text from '@/components/ui/Text';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

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

  console.log(error);

  return (
    <Card className='space-y-2'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Expand className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/modality-interactions'>
            <Heading level={3}>Modality Interactions</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6'>
        {data.map((item) => (
          <AdminDetailField 
            key={item.modality1 + '-' + item.modality2}
            heading={[item.modality1, item.modality2]}
            headingicon={[getModalityIcon(item.modality1, "w-3 h-3"), getModalityIcon(item.modality2, "w-3 h-3")]}
            headinghref={['/admin/astrology/modalities/' + item.modality1, '/admin/astrology/modalities/' + item.modality2]}
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
    </Card>
  );
}