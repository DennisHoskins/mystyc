'use client'

import { useState, useEffect, useCallback } from 'react';

import { Sign, ElementType } from 'mystyc-common/schemas';
import { getElementSigns } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import AdminDetailField from '@/components/admin/ui/detail/AdminDetailField';
import { getZodiacIcon } from '@/components/ui/icons/astrology/zodiac';
import Link from '@/components/ui/Link';
import Energy from '@/components/ui/icons/astrology/Energy';
import Capsule from '@/components/ui/Capsule';
import Panel from '@/components/ui/Panel';

export default function ElementSignsCard({ element, className } : { element?: ElementType | null, className?: string }) {
  const [signs, setSigns] = useState<Sign[] | null>();
  
  const loadSigns = useCallback(async () => {
    if (!element) return;
    try {
      const elementData = await getElementSigns({deviceInfo: getDeviceInfo(), element});
      setSigns(elementData);
    } catch (err) {
      logger.error('Failed to load element signs:', err);
    }
  }, [element]);

  useEffect(() => {
    loadSigns();
  }, [loadSigns]);

  return (
    <Card padding={4} className={className}>
      <AdminPanelHeader 
        icon={<AstrologyIcon size={3} />}
        heading="Element Signs"
        href={'/admin/astrology/signs'}
      />
      <div className='flex flex-col space-y-4'>
        {signs && signs.map((item) => (
          <Panel key={item.sign}>
            <AdminDetailField 
              heading={item.sign}
              headingicon={getZodiacIcon(item.sign, "w-3 h-3")}
              value={
                <div className='flex flex-col space-y-2'>
                  <Link href={'/admin/astrology/signs/' + item.sign} className='!text-gray-500 text-wrap !no-underline'>
                    {item.description}
                    <br />
                    <span className='text-xs'><strong>Keywords</strong> [{item.keywords.join(", ")}]</span>
                  </Link>
                  <Capsule
                    icon={<Energy size={2} />} 
                    label={item?.energyType || ''} 
                    href={'/admin/astrology/energy-types/' + item?.energyType} 
                  />
                </div>
              }
            />
          </Panel>
        ))}        
      </div>
    </Card>
  );
}