'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { ModalityInteraction, ModalityType } from 'mystyc-common/schemas';
import { getModalityInteraction } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import ModalityInteractionDetailsPanel from './ModalityInteractionDetailsPanel';
import ModalityInteractionPanel from './ModalityInteractionPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import DynamicDetailsCard from '../../dynamics/dynamic/DynamicDetailsCard';

export default function ModalityInteractionPage({ interaction } : { interaction: string }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ModalityInteraction | null>(null);

  const [modality1, setModality1] = useState<ModalityType | null>(null);
  const [modality2, setModality2] = useState<ModalityType | null>(null);

  useEffect(() => {
    if (!interaction) return;
    const [res1, res2] = interaction.split("-") as [ModalityType, ModalityType];
    setModality1(res1);
    setModality2(res2);
  }, [interaction]);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Modality Interactions', href: '/admin/astrology/modality-interactions' },
    { label: modality1 +'-' + modality2 },
  ];

  const loadModalityInteraction = useCallback(async (modality1: ModalityType, modality2: ModalityType) => {
    if (!modality1 || !modality2) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);
      const interaction = await getModalityInteraction({deviceInfo: getDeviceInfo(), modality1, modality2});
      setData(interaction);
    } catch (err) {
      logger.error('Failed to load modality interaction:', err);
      setError('Failed to load modality interaction. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!modality1 || !modality2) {
      return;
    }
    loadModalityInteraction(modality1, modality2);
  }, [loadModalityInteraction, modality1, modality2]);

  return (
    <AdminItemLayout
      error={error}
      breadcrumbs={breadcrumbs}
      icon={<Eclipse className='w-3 h-3' />}
      title={"Modalityary Position"}
      headerContent={<ModalityInteractionDetailsPanel interaction={data} />}
      sideContent={<ModalityInteractionPanel interaction={data} />}
      itemsContent={[
        <div key='energy-dynamic' className='flex flex-col w-full space-y-1 grow flex-1'>
          <EnergyTypeDetailsCard energyType={data?.energyType} />
          <DynamicDetailsCard dynamic={data?.dynamic} className='grow flex-1' /> 
        </div>
      ]}
    />
  );
}