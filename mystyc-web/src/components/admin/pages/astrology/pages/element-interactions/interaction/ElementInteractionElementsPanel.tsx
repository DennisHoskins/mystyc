'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ElementInteraction, Element, ElementType } from 'mystyc-common/schemas';
import { getElement } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import ElementPanel from '../../elements/element/ElementPanel';

export default function ElementInteractionElementsPanel({ interaction } : { interaction?: ElementInteraction | null }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [element1, setElement1] = useState<Element | null>(null);
  const [element2, setElement2] = useState<Element | null>(null);

  const loadElements = useCallback(async (element1: ElementType, element2: ElementType) => {
    try {
      setError(null);
      setBusy(1000);
      const result1 = await getElement({deviceInfo: getDeviceInfo(), element: element1});
      setElement1(result1);
      if (element1 == element2) return;
      const result2 = await getElement({deviceInfo: getDeviceInfo(), element: element2});
      setElement2(result2);
    } catch (err) {
      logger.error('Failed to load elements:', err);
      setError('Failed to load elements. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!interaction || !interaction.element1 || !interaction.element2) {
      return;
    }
    loadElements(interaction.element1, interaction.element2);
  }, [loadElements, interaction]);

  console.log(error);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Atom className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/element-interactions'>
            <Heading level={3}>Elements</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6 pt-1'>
        <ElementPanel element={element1} />
        {element2 && <ElementPanel element={element2} />}
      </div>
    </>
  );
}