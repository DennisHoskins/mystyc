'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { PolarityInteraction, Polarity, PolarityType } from 'mystyc-common/schemas';
import { getPolarity } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import PolarityPanel from '../../polarities/polarity/PolarityPanel';
import Panel from '@/components/ui/Panel';
import Text from '@/components/ui/Text';

export default function PolarityInteractionPanel({ interaction } : { interaction?: PolarityInteraction | null }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [polarity1, setPolarity1] = useState<Polarity | null>(null);
  const [polarity2, setPolarity2] = useState<Polarity | null>(null);

  const loadModalities = useCallback(async (polarity1: PolarityType, polarity2: PolarityType) => {
    try {
      setError(null);
      setBusy(1000);
      const resultPolarity1 = await getPolarity({deviceInfo: getDeviceInfo(), polarity: polarity1});
      setPolarity1(resultPolarity1);
      if (polarity1 == polarity2) return;
      const resultPolarity2 = await getPolarity({deviceInfo: getDeviceInfo(), polarity: polarity2});
      setPolarity2(resultPolarity2);
    } catch (err) {
      logger.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!interaction || !interaction.polarity1 || !interaction.polarity2) {
      return;
    }
    loadModalities(interaction.polarity1, interaction.polarity2);
  }, [loadModalities, interaction]);

  if (error) {
    return (
      <>
        <AdminPanelHeader
          icon={<Atom className='w-3 h-3' />}
          heading='Polarity Interactions'
          href='/admin/astrology/polarity-interactions'
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
        icon={<Atom className='w-3 h-3' />}
        heading='Polarity Interactions'
        href='/admin/astrology/polarity-interactions'
      />
      <div className='flex flex-col space-y-6'>
        <Panel padding={4}>
          <PolarityPanel polarity={polarity1} />
        </Panel>
        {polarity2 && 
          <Panel padding={4}>
            <PolarityPanel polarity={polarity2} />
          </Panel>
        }
      </div>
    </>
  );
}