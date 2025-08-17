'use client'

import { useState, useEffect, useCallback } from 'react';

import { Element, ElementType } from 'mystyc-common/schemas';
import { getElement } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import { getElementIcon } from '@/components/ui/icons/astrology/elements';
import ElementDetailsPanel from './ElementDetailsPanel';
import ElementInteractionsPanel from '../../element-interactions/ElementInteractionsPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import ElementSignsCard from './ElementSignsCard';

export default function ElementPage({ element } : { element: ElementType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [elementData, setElement] = useState<Element | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Elements', href: '/admin/astrology/elements' },
    { label: element },
  ];

  const loadElement = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const elementData = await getElement({deviceInfo: getDeviceInfo(), element});
      setElement(elementData);
    } catch (err) {
      logger.error('Failed to load element:', err);
      setError('Failed to load element. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, element]);

  useEffect(() => {
    loadElement();
  }, [loadElement]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadElement}
      breadcrumbs={breadcrumbs}
      icon={getElementIcon(element)}
      title={elementData?.element || "Element"}
      headerContent={<ElementDetailsPanel element={elementData} />}
      sideContent={<ElementInteractionsPanel element={element} />}
      itemsContent={[
        <div key='energy-signs' className='flex-1 flex flex-col space-y-1 w-full'>
          <EnergyTypeDetailsCard key='energy-type' energyType={elementData?.energyType} />
          <ElementSignsCard key='signs' element={element} className='flex-1 grow' />
        </div>          
      ]}
    />
  );
}