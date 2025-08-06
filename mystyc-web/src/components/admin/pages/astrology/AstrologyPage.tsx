'use client'

import { useState, useEffect, useCallback } from 'react';

// import { Schedule } from 'mystyc-common/schemas';
// import { ScheduleStats, AdminListResponse } from 'mystyc-common/admin';
// import { getScheduleStats, getSchedules } from '@/server/actions/admin/schedules';
// import { getDefaultStatsQuery, getDefaultListQuery } from '@/util/admin/getQuery';
// import { getDeviceInfo } from '@/util/getDeviceInfo';
import { logger } from '@/util/logger';
import { useBusy } from '@/components/ui/context/AppContext';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import AstrologyIcon from '@/components/admin/ui/icons/AstrologyIcon';

export default function AstrologyPage() {
  const { setBusy, isBusy } = useBusy();
  // const [stats, setStats] = useState<ScheduleStats | null>(null);
  // const [data, setData] = useState<AdminListResponse<Schedule> | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Astrology' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

    //   const statsQuery = getDefaultStatsQuery();
    //   const stats = await getScheduleStats({deviceInfo: getDeviceInfo(), ...statsQuery});

    //  setStats(stats);
    } catch (err) {
      logger.error('Failed to load astrology stats:', err);
      setError('Failed to load astrology stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadAstrology = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      console.log(page);

      // const listQuery = getDefaultListQuery(page);
      // const response = await getSchedules({deviceInfo: getDeviceInfo(), ...listQuery});

      // setData(response);
      // setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load astrology:', err);
      setError('Failed to load astrology. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
    loadAstrology(0);
  }, [loadData, loadAstrology]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadAstrology(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={AstrologyIcon}
      description=""
      sideContent={<></>}
      itemContent={<></>}
      tableContent={<></>}
    />   
  );
}