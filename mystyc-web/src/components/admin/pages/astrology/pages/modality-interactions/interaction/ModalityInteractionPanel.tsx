'use client'

import { useState, useEffect, useCallback } from 'react';
import { Atom } from 'lucide-react';

import { ModalityInteraction, Modality, ModalityType } from 'mystyc-common/schemas';
import { getModality } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import Link from '@/components/ui/Link';
import ModalityPanel from '../../modalities/modality/ModalityPanel';

export default function ModalityInteractionPanel({ interaction } : { interaction?: ModalityInteraction | null }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [modality1, setModality1] = useState<Modality | null>(null);
  const [modality2, setModality2] = useState<Modality | null>(null);

  const loadModalities = useCallback(async (modality1: ModalityType, modality2: ModalityType) => {
    try {
      setError(null);
      setBusy(1000);
      const resultModality1 = await getModality({deviceInfo: getDeviceInfo(), modality: modality1});
      setModality1(resultModality1);
      if (modality1 == modality2) return;
      const resultModality2 = await getModality({deviceInfo: getDeviceInfo(), modality: modality2});
      setModality2(resultModality2);
    } catch (err) {
      logger.error('Failed to load data:', err);
      setError('Failed to load data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    if (!interaction || !interaction.modality1 || !interaction.modality2) {
      return;
    }
    loadModalities(interaction.modality1, interaction.modality2);
  }, [loadModalities, interaction]);

  console.log(error);

  return (
    <>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={<Atom className='w-3 h-3' />} />
        <div>
          <Link href='/admin/astrology/modalityary-interactions'>
            <Heading level={3}>Position</Heading>
          </Link>
        </div>
      </div>
      <hr/ >
      <div className='flex flex-col space-y-6 pt-1'>
        <ModalityPanel modality={modality1} />
        {modality2 && <ModalityPanel modality={modality2} />}
      </div>
    </>
  );
}