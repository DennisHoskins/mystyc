'use client'

import { useState, useEffect, useCallback } from 'react';

import { Element, ElementType } from 'mystyc-common/schemas';
import { getElement } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import ElementDetailsPanel from './ElementDetailsPanel';

export default function ElementDetailsCard({ element } : { element?: ElementType | null }) {
  const [elementData, setElement] = useState<Element | null>(null);
  
  const loadElement = useCallback(async () => {
    if (!element) return;
    try {
      const elementData = await getElement({deviceInfo: getDeviceInfo(), element});
      setElement(elementData);
    } catch (err) {
      logger.error('Failed to load element:', err);
    }
  }, [element]);

  useEffect(() => {
    loadElement();
  }, [loadElement]);

  return (
    <Card className='space-y-4'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={getElementIcon(element)} />
        <div>
          <Heading level={5}>{element?.toWellFormed()}</Heading>
        </div>
      </div>

      <hr/ >
      <ElementDetailsPanel element={elementData} />
    </Card>
  );
}