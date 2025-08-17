'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ElementInteraction, ElementType } from 'mystyc-common/schemas';
import { getElementInteraction } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ElementInteractionDetailsPanel from './ElementInteractionDetailsPanel';
import ElementInteractionElementsPanel from './ElementInteractionElementsPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import DynamicDetailsCard from '../../dynamics/dynamic/DynamicDetailsCard';

export default function ElementInteractionPage({ interaction } : { interaction: string }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ElementInteraction | null>(null);

  const [element1, setElement1] = useState<ElementType | null>(null);
  const [element2, setElement2] = useState<ElementType | null>(null);

  useEffect(() => {
    if (!interaction) return;
    const [el1, el2] = interaction.split("-") as [ElementType, ElementType];
    setElement1(el1);
    setElement2(el2);
  }, [interaction]);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Element Interactions', href: '/admin/astrology/element-interactions' },
    { label: element1 +'-' + element2 },
  ];

  const loadElementInteraction = useCallback(async (element1: ElementType, element2: ElementType) => {
    if (!element1 || !element2) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);
      const interaction = await getElementInteraction({deviceInfo: getDeviceInfo(), element1, element2});
      setData(interaction);
    } catch (err) {
      logger.error('Failed to load element interaction:', err);
      setError('Failed to load element interaction. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!element1 || !element2) {
      return;
    }
    loadElementInteraction(element1, element2);
  }, [loadElementInteraction, element1, element2]);

  return (
    <AdminItemLayout
      error={error}
      breadcrumbs={breadcrumbs}
      icon={<Atom className='w-3 h-3' />}
      title={"Element Interaction"}
      headerContent={<ElementInteractionDetailsPanel interaction={data} />}
      sideContent={<ElementInteractionElementsPanel interaction={data} />}
      itemsContent={[
        <div key='energy-dynamic' className='flex-1 flex flex-col w-full space-y-1'>
          <EnergyTypeDetailsCard energyType={data?.energyType} />
          <div className='flex-1 grow'>
            <DynamicDetailsCard dynamic={data?.dynamic} className='h-full' />
          </div>
        </div>
      ]}
    />
  );
}