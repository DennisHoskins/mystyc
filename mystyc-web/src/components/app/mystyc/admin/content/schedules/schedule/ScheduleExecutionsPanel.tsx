'use client';

import { useEffect, useCallback, useState } from 'react';

import { apiClientAdmin, PaginatedResponse } from '@/api/apiClientAdmin';
import { formatDateForDisplay } from '@/util/dateTime';
import { ScheduleExecution } from '@/interfaces';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import ScheduleIcon from '../../../ui/icons/ScheduleIcon';

export default function ScheduleExecutionsPanel({ scheduleId }: { scheduleId: string }) {
  const [executions, setExecutions] = useState<PaginatedResponse<ScheduleExecution> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadScheduleExecutions = useCallback(async (page: number) => {
    try {
      setLoading(true);

      const response = await apiClientAdmin.getScheduleScheduleExecutions(
        scheduleId, 
        {
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'clientTimestamp',
          sortOrder: 'desc',
        }        
      );
      setExecutions(response);

      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load schedule executions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!scheduleId) {
      return;
    }

    loadScheduleExecutions(0);
  }, [scheduleId, loadScheduleExecutions]);

  if (!executions?.data) {
    return null;
  }

  const columns: Column<ScheduleExecution>[] = [
    { key: '_id', header: 'Id', link: (e) => `/admin/schedule-executions/${e._id}`},
    { key: 'executedAt', header: 'Executed', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => formatDateForDisplay(e.executedAt) || '-' },
    { key: 'localTime', header: 'Local Time', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => formatDateForDisplay(e.localTime) || '-' },
    { key: 'status', header: 'Status', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`},
  ];

  return (
    <Card className='h-[56rem]'>
      <AdminTable<ScheduleExecution>
        icon={<ScheduleIcon variant='schedule-execution' />}
        label={"Executions"}
        data={executions.data}
        columns={columns}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasMore={hasMore}
        onPageChange={loadScheduleExecutions}
        onRefresh={() => loadScheduleExecutions(currentPage)}
        emptyMessage="No Devices found."
      />
    </Card>      
  );
}