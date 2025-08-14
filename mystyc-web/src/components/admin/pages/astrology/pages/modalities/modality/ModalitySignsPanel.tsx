'use client'

import { useState, useEffect, useCallback } from 'react';

import { Sign, ModalityType } from 'mystyc-common/schemas';
import { getModalitySigns } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Avatar from '@/components/ui/Avatar';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

export default function ModalitySignsPanel({ modality } : { modality: ModalityType }) {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Sign[]>([]);

  const loadSigns = useCallback(async (modality: ModalityType) => {
    try {
      setError(null);
      const signs = await getModalitySigns({deviceInfo: getDeviceInfo(), modality});
      setData(signs);
    } catch (err) {
      logger.error('Failed to load modality signs:', err);
      setError('Failed to load modality signs. Please try again.');
    }
  }, []);

  useEffect(() => {
    loadSigns(modality);
  }, [loadSigns, modality]);

  console.log(error);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={AstrologyIcon} />
        <div>
          <Link href='/admin/astrology/signs'>
            <Heading level={3}>Modality Signs</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6 mt-1'>
        {data.map((item) => (
          <AdminDetailField 
            key={item.sign}
            heading={item.sign}
            headingicon={getZodiacIcon(item.sign, "w-3 h-3")}
            headinghref={'/admin/astrology/signs/' + item.sign}
            value={
              <div className='flex flex-col space-y-2'>
                <Link href={'/admin/astrology/signs/' + item.sign} className='!text-gray-500 text-wrap !no-underline flex-1'>
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
                </div>
              </div>
            }
          />
        ))}        
      </div>
    </>
  );
}