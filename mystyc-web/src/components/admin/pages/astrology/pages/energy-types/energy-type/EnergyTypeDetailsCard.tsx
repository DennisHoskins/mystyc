'use client'

import { useState, useEffect, useCallback } from 'react';

import { EnergyType } from 'mystyc-common/schemas';
import { getEnergyType } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import Avatar from '@/components/ui/Avatar';
import Heading from '@/components/ui/Heading';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import EnergyTypeDetailsPanel from './EnergyTypeDetailsPanel';

export default function EnergyTypeDetailsCard({ energyType } : { energyType?: string | null }) {
  const [energyTypeData, setEnergyType] = useState<EnergyType | null>(null);
  
  const loadEnergyType = useCallback(async () => {
    if (!energyType) return;
    try {
      const energyTypeData = await getEnergyType({deviceInfo: getDeviceInfo(), energyType});
      setEnergyType(energyTypeData);
    } catch (err) {
      logger.error('Failed to load energyType:', err);
    }
  }, [energyType]);

  useEffect(() => {
    loadEnergyType();
  }, [loadEnergyType]);

  return (
    <Card className='space-y-4 grow'>
      <div className="flex items-center space-x-2">
        <Avatar size={'small'} icon={AstrologyIcon} />
        <div>
          <Heading level={5}>{energyType?.toWellFormed()}</Heading>
        </div>
      </div>
      <hr/ >
      <EnergyTypeDetailsPanel energyType={energyTypeData} />
    </Card>
  );
}