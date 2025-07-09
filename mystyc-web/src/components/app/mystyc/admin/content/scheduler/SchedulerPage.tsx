'use client';

import { useState, useEffect, useCallback } from 'react';
// import { apiClientAdmin } from '@/api/apiClientAdmin';
// import { Schedule, ScheduleStats } from '@/interfaces';
import { useBusy } from '@/components/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import ScheduleIcon from '@/components/app/mystyc/admin/ui/icons/ScheduleIcon';
import ScheduleDashboard from '../dashboard/ScheduleDashboard';

export default function SchedulerPage() {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  // const [schedule, setSchedule] = useState<Schedule[]>([]);
  // const [data, setData] = useState<ScheduleStats | null>(null);
  // const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // const [currentPage, setCurrentPage] = useState(0);
  // const [totalPages, setTotalPages] = useState(0);
  // const [totalItems, setTotalItems] = useState(0);
  // const [hasMore, setHasMore] = useState(true);
  // const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Schedule' },
  ];

  // const loadSchedule = useCallback(async (page: number) => {
  const loadSchedule = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);
      // setLoading(true);

      // const response = await apiClientAdmin.getSchedules({
      //   limit: LIMIT,
      //   offset: page * LIMIT,
      //   sortBy: 'date',
      //   sortOrder: 'desc',
      // });

      // setSchedule(response.data);
      // setHasMore(response.pagination.hasMore);
      // setCurrentPage(page);
      // setTotalPages(response.pagination.totalPages);
      // setTotalItems(response.pagination.totalItems);

      // const stats = await apiClientAdmin.getScheduleStats();
      // setData(stats.data);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'SchedulesPage');
      if (!wasSessionError) {
        logger.error('Failed to load schedule:', err);
        setError('Failed to load schedule. Please try again.');
      }
    } finally {
      setBusy(false);
      // setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  useEffect(() => {
    // loadSchedule(0);
    loadSchedule();
  }, [loadSchedule]);

  return (
   <AdminListLayout
      error={error}
      onRetry={() => {}}
      // onRetry={() => loadSchedule(currentPage)}
      breadcrumbs={breadcrumbs}
      icon={ScheduleIcon}
      description="Manage schedule entries: view, edit, and monitor schedule status, and performance metrics"
       sideContent={
         <ScheduleDashboard 
          //  data={data} 
           data={null} 
           charts={['stats']}
         />
       }
    />   
  );
}