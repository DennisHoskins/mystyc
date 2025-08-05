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
import HoroscopeIcon from '@/components/admin/ui/icons/HoroscopeIcon';
// import SchedulesTimezonesTable from './SchedulesTimezonesTable';
// import SchedulesTable from './SchedulesTable';
// import SchedulesDashboard from './SchedulesDashboard';

export default function HoroscopesPage() {
  const { setBusy } = useBusy();
  // const { setBusy, isBusy } = useBusy();
  // const [stats, setStats] = useState<ScheduleStats | null>(null);
  // const [data, setData] = useState<AdminListResponse<Schedule> | null>(null);
  // const [error, setError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // const [currentPage, setCurrentPage] = useState(0);

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Horoscopes' },
  ];

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

    //   const statsQuery = getDefaultStatsQuery();
    //   const stats = await getScheduleStats({deviceInfo: getDeviceInfo(), ...statsQuery});

    //  setStats(stats);
    } catch (err) {
      logger.error('Failed to load horoscope stats:', err);
      setError('Failed to load horoscope stats. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadHoroscopes = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);

      console.log(page);

      // const listQuery = getDefaultListQuery(page);
      // const response = await getSchedules({deviceInfo: getDeviceInfo(), ...listQuery});

      // setData(response);
      // setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load horoscopes:', err);
      setError('Failed to load horoscopes. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  useEffect(() => {
    loadData();
    loadHoroscopes(0);
  }, [loadData, loadHoroscopes]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {
        loadData();
        loadHoroscopes(0);
      }}
      breadcrumbs={breadcrumbs}
      icon={HoroscopeIcon}
      description=""
      sideContent={<></>}
      itemContent={<></>}
      tableContent={<></>}
    />   
  );
}