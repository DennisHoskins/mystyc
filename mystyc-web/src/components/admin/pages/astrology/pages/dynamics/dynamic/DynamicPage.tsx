'use client'

import { useState, useEffect, useCallback } from 'react';

import { Dynamic, DynamicType } from 'mystyc-common/schemas';
import { getDynamic } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';

import AdminItemLayout from '@/components/admin/ui/AdminItemLayout';
//import { getDynamicIcon } from '@/components/ui/icons/astrology/dynamics';
import DynamicDetailsPanel from './DynamicDetailsPanel';

export default function DynamicPage({ dynamic } : { dynamic: DynamicType }) {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [dynamicData, setDynamic] = useState<Dynamic | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology', href: '/admin/astrology' },
    { label: 'Dynamics', href: '/admin/astrology/dynamics' },
    { label: dynamic.toWellFormed() },
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
      // icon={getDynamicIcon(dynamic)}
      icon={null}
      title={dynamicData?.dynamic || "Dynamic"}
      headerContent={<DynamicDetailsPanel dynamic={dynamicData} />}
    />
  );
}