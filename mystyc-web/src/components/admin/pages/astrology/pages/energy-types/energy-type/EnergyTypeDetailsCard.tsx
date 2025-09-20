'use client'

import { useState, useEffect, useCallback } from 'react';

import { EnergyType } from 'mystyc-common/schemas';
import { getEnergyType } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { formatStringForDisplay } from '@/util/util';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import EnergyTypeDetailsPanel from './EnergyTypeDetailsPanel';
import Energy from '@/components/ui/icons/astrology/Energy';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import Capsule from '@/components/ui/Capsule';
import { getCategoryIcon } from '@/components/ui/icons/astrology/categories';

export default function EnergyTypeDetailsCard({ energyType, className } : { energyType?: string | null, className?: string }) {
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
    <Card padding={4} className={className}>
      <AdminPanelHeader
        icon={Energy}
        type='Energy Type'
        typeHref='/admin/astrology/energy-types'
        heading={energyType ? formatStringForDisplay(energyType) : ""}
        href={'/admin/astrology/energy-types/' + energyType}
        tag={
          <Capsule
            icon={getCategoryIcon(energyTypeData?.category, 'w-2 h-2')}
            label={`${energyTypeData?.category || null} / ${energyTypeData?.intensity || null}`} 
            href={'/admin/astrology/energy-types/' + energyType} 
          />
        }
      />
      <EnergyTypeDetailsPanel energyType={energyTypeData} showCategory={false} />
    </Card>
  );
}