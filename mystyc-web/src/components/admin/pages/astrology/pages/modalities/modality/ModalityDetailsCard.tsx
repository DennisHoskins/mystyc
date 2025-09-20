'use client'

import { useState, useEffect, useCallback } from 'react';

import { Modality, ModalityType } from 'mystyc-common/schemas';
import { getModality } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import ModalityDetailsPanel from './ModalityDetailsPanel';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Capsule from '@/components/ui/Capsule';
import Energy from '@/components/ui/icons/astrology/Energy';
import { getModalityIcon } from '@/components/ui/icons/astrology/modalities/index';

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
    <Card padding={4}>
      <AdminPanelHeader
        icon={getModalityIcon(modality)}
        type='Modality'
        typeHref='/admin/astrology/modalities'
        heading={modality || ""}
        href={'/admin/astrology/modalities/' + modality}
        tag={
          <Capsule
            icon={<Energy size={2} />} 
            label={modalityData?.energyType || ''} 
            href={'/admin/astrology/energy-types/' + modalityData?.energyType} 
          />
        }
      />
      <ModalityDetailsPanel modality={modalityData} />
    </Card>
  );
}