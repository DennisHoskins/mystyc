'use client'

import { useState, useEffect, useCallback } from 'react';

import { Sign, ModalityType } from 'mystyc-common/schemas';
import { getModalitySigns } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import Link from '@/components/ui/Link';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';

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

  if (error) {
    return (
      <>
        <AdminPanelHeader
          icon={AstrologyIcon}
          heading='Modality Signs'
          href='/admin/astrology/signs'
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
        icon={AstrologyIcon}
        heading='Modality Signs'
        href='/admin/astrology/signs'
      />
      <div className='flex flex-col space-y-4'>
        {data.map((item) => (
          <Panel padding={4} key={item.sign}>
            <AdminDetailField 
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
                      icon={<Energy size={2} />} 
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