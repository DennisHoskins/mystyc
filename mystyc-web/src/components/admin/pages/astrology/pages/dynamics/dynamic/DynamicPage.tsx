'use client'

import { useState, useEffect, useCallback } from 'react';

import { Dynamic, DynamicType } from 'mystyc-common/schemas';
import { getDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { formatStringForDisplay } from '@/util/util';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import DynamicDetailsPanel from './DynamicDetailsPanel';
import DynamicPlanetInteractionsCard from './DynamicPlanetInteractionsCard';
import DynamicElementInteractionsPanel from './DynamicElementInteractionsPanel';
import DynamicModalityInteractionsCard from './DynamicModalityInteractionsCard';

export default function DynamicPage({ dynamic } : { dynamic: DynamicType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [dynamicData, setDynamic] = useState<Dynamic | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Dynamics', href: '/admin/astrology/dynamics' },
    { label:  formatStringForDisplay(dynamic) },
  ];

  const loadDynamic = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const dynamicData = await getDynamic({deviceInfo: getDeviceInfo(), dynamic});
      setDynamic(dynamicData);
    } catch (err) {
      logger.error('Failed to load dynamic:', err);
      setError('Failed to load dynamic. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, dynamic]);

  useEffect(() => {
    loadDynamic();
  }, [loadDynamic]);

  return (
    <AdminItemLayout
      error={error}
      onRetry={loadDynamic}
      breadcrumbs={breadcrumbs}
      icon={getDynamicIcon(dynamic)}
      title={dynamicData?.dynamic || "Dynamic"}
      headerContent={<DynamicDetailsPanel dynamic={dynamicData} />}
      sideContent={<DynamicElementInteractionsPanel dynamic={dynamic} />}
      itemsContent={[
        <div key='element-modality' className='flex grow flex-col space-y-1 w-full'>
          <DynamicModalityInteractionsCard dynamic={dynamic} />
          <DynamicPlanetInteractionsCard dynamic={dynamic} className='flex-1 grow' />
        </div>          
      ]}
    />
  );
}