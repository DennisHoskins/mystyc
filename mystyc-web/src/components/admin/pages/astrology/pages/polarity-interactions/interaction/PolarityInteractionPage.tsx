'use client'

import { useState, useEffect, useCallback } from 'react';
import { Eclipse } from 'lucide-react';

import { PolarityInteraction, PolarityType } from 'mystyc-common/schemas';
import { getPolarityInteraction } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import PolarityInteractionDetailsPanel from './PolarityInteractionDetailsPanel';
import PolarityInteractionPanel from './PolarityInteractionPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';
import DynamicDetailsCard from '../../dynamics/dynamic/DynamicDetailsCard';

export default function PolarityInteractionPage({ interaction } : { interaction: string }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PolarityInteraction | null>(null);

  const [polarity1, setPolarity1] = useState<PolarityType | null>(null);
  const [polarity2, setPolarity2] = useState<PolarityType | null>(null);

  useEffect(() => {
    if (!interaction) return;
    const [res1, res2] = interaction.split("-") as [PolarityType, PolarityType];
    setPolarity1(res1);
    setPolarity2(res2);
  }, [interaction]);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Polarity Interactions', href: '/admin/astrology/polarity-interactions' },
    { label: polarity1 +'-' + polarity2 },
  ];

  const loadPolarityInteraction = useCallback(async (polarity1: PolarityType, polarity2: PolarityType) => {
    if (!polarity1 || !polarity2) {
      return;
    }
    try {
      setError(null);
      setBusy(1000);
      const interaction = await getPolarityInteraction({deviceInfo: getDeviceInfo(), polarity1, polarity2});
      setData(interaction);
    } catch (err) {
      logger.error('Failed to load polarity interaction:', err);
      setError('Failed to load polarity interaction. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!polarity1 || !polarity2) {
      return;
    }
    loadPolarityInteraction(polarity1, polarity2);
  }, [loadPolarityInteraction, polarity1, polarity2]);

  return (
    <AdminItemLayout
      error={error}
      breadcrumbs={breadcrumbs}
      icon={<Eclipse className='w-3 h-3' />}
      title={"Polarityary Position"}
      headerContent={<PolarityInteractionDetailsPanel interaction={data} />}
      sideContent={<PolarityInteractionPanel interaction={data} />}
      itemsContent={[
        <div key='energy-dynamic' className='flex flex-col w-full space-y-1 grow flex-1'>
          <EnergyTypeDetailsCard energyType={data?.energyType} />
          <DynamicDetailsCard dynamic={data?.dynamic} className='grow flex-1' /> 
        </div>
      ]}
    />
  );
}