'use client'

import { useState, useEffect, useCallback } from 'react';

import { Dynamic, DynamicType } from 'mystyc-common/schemas';
import { getDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import Card from '@/components/ui/Card';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import DynamicDetailsPanel from './DynamicDetailsPanel';
import AdminPanelHeader from '@/components/admin/ui/AdminPanelHeader';
import { formatStringForDisplay } from '@/util/util';

export default function DynamicDetailsCard({ dynamic, className } : { dynamic?: DynamicType | null, className?: string }) {
  const [dynamicData, setDynamic] = useState<Dynamic | null>(null);
  
  const loadDynamic = useCallback(async () => {
    if (!dynamic) return;
    try {
      const dynamicData = await getDynamic({deviceInfo: getDeviceInfo(), dynamic});
      setDynamic(dynamicData);
    } catch (err) {
      logger.error('Failed to load dynamic:', err);
    }
  }, [dynamic]);

  useEffect(() => {
    loadDynamic();
  }, [loadDynamic]);

  return (
    <Card padding={4} className={className}>
      <AdminPanelHeader 
        icon={getDynamicIcon(dynamic)}
        type='Dynamic'
        typeHref='/admin/astrology/dynamics'
        heading={dynamic ? formatStringForDisplay(dynamic) : ""}
        href={'/admin/astrology/dynamics/' + dynamic}
      />
      <DynamicDetailsPanel dynamic={dynamicData} />
    </Card>
  );
}