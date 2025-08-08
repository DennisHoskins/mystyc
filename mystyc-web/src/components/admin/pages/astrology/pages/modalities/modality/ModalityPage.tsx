'use client'

import { useState, useEffect, useCallback } from 'react';

import { Modality, ModalityType } from 'mystyc-common/schemas';
import { getModality } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
//import { getModalityIcon } from '@/components/ui/icons/astrology/modalities';
import ModalityDetailsPanel from './ModalityDetailsPanel';
import EnergyTypeDetailsCard from '../../energy-types/energy-type/EnergyTypeDetailsCard';

export default function ModalityPage({ modality } : { modality: ModalityType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [modalityData, setModality] = useState<Modality | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Modalities', href: '/admin/astrology/modalities' },
    { label: modality.toWellFormed() },
  ];

  const loadModality = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const modalityData = await getModality({deviceInfo: getDeviceInfo(), modality});
      setModality(modalityData);
    } catch (err) {
      logger.error('Failed to load modality:', err);
      setError('Failed to load modality. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, modality]);

  useEffect(() => {
    loadModality();
  }, [loadModality]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadModality}
      breadcrumbs={breadcrumbs}
      // icon={getModalityIcon(modality)}
      icon={null}
      title={modalityData?.modality || "Modality"}
      headerContent={<ModalityDetailsPanel modality={modalityData} />}
      mainContent={<EnergyTypeDetailsCard energyType={modalityData?.energyType} />}
    />
  );
}