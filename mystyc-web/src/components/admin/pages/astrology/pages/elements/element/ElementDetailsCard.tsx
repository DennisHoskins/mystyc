'use client'

import { useState, useEffect, useCallback } from 'react';

import { Element, ElementType } from 'mystyc-common/schemas';
import { getElement } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import ElementDetailsPanel from './ElementDetailsPanel';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';

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
    <Card padding={4}>
      <AdminPanelHeader 
        icon={getElementIcon(element)}
        type='Element'
        typeHref='/admin/astrology/elements'
        heading={element || ""}
        href={'/admin/astrology/elements/' + element}
        tag={
          <Capsule
            icon={<Energy size={2} />} 
            label={elementData?.energyType || ''} 
            href={'/admin/astrology/energy-types/' + elementData?.energyType} 
          />
        }
      />
      <ElementDetailsPanel element={elementData} />
    </Card>
  );
}