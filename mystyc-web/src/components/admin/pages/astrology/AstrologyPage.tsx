'use client'

import { useState, useEffect, useCallback } from 'react';

import { AstrologySummary } from 'mystyc-common/admin';
import { getAstrolgySummary } from '@/server/actions/admin/astrology';
import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';
import AstrologyTabPanel from './AstrologyTabPanel';

export default function AstrologyPage() {
  const { setBusy } = useBusy();
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<AstrologySummary | null>(null);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology' },
  ];

  const loadSummary = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const summaryData = await getAstrolgySummary({deviceInfo: getDeviceInfo()});
      setSummary(summaryData);
    } catch (err) {
      logger.error('Failed to load astrology summary:', err);
      setError('Failed to load astrology summary. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadSummary();
  }, [loadSummary]);

  const retryAll = () => {
    loadSummary();
  };

  return (
    <AdminListLayout
      error={error}
      onRetry={retryAll}
      breadcrumbs={breadcrumbs}
      icon={AstrologyIcon}
      headerContent={<AstrologyTabPanel key='astrology-tabs' />}
    />   
  );
}