'use client'

import { useState, useEffect, useCallback } from 'react';

import { Modality, ModalityType } from 'mystyc-common/schemas';
import { getModality } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import ModalityDetailsPanel from './ModalityDetailsPanel';

export default function ModalityDetailsCard({ modality } : { modality?: ModalityType | null }) {
  const [modalityData, setModality] = useState<Modality | null>(null);
  
  const loadModality = useCallback(async () => {
    if (!modality) return;
    try {
      const modalityData = await getModality({deviceInfo: getDeviceInfo(), modality});
      setModality(modalityData);
    } catch (err) {
      logger.error('Failed to load modality:', err);
    }
  }, [modality]);

  useEffect(() => {
    loadModality();
  }, [loadModality]);

  return (
    <Card className='space-y-4'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={AstrologyIcon} />
        <div>
          <Heading level={5}>{modality?.toWellFormed()}</Heading>
        </div>
      </div>

      <hr/ >
      <ModalityDetailsPanel modality={modalityData} />
    </Card>
  );
}