'use client';

import { useEffect, useCallback, useState } from 'react';

import { ScheduleExecution } from 'mystyc-common/schemas';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

export default function ScheduleExecutionsCard({ scheduleId }: { scheduleId: string }) {
  const [executions, setExecutions] = useState<AdminListResponse<ScheduleExecution> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const loadScheduleExecutions = useCallback(async (page: number) => {
    try {
      setLoading(true);

      const response = await apiClientAdmin.schedule.getScheduleExecutions(
        scheduleId, 
        {
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'clientTimestamp',
          sortOrder: 'desc',
        }        
      );
      setExecutions(response);

      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load schedule executions:', err);
    } finally {
      setLoading(false);
    }
  }, [scheduleId]);

  useEffect(() => {
    if (!scheduleId) {
      return;
    }

    loadScheduleExecutions(0);
  }, [scheduleId, loadScheduleExecutions]);

  const columns: Column<ScheduleExecution>[] = [
    { key: '_id', header: 'Id', link: (e) => `/admin/schedule-executions/${e._id}`},
    { key: 'executedAt', header: 'Executed', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => formatDateForDisplay(e.executedAt) || '-' },
    { key: 'localTime', header: 'Local Time', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`, render: (e) => formatDateForDisplay(e.localTime) || '-' },
    { key: 'status', header: 'Status', align: 'right', link: (e) => `/admin/schedule-executions/${e._id}`},
  ];

  return (
    <Card className='grow'>
      <AdminTable<ScheduleExecution>
        data={executions?.data}
        columns={columns}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasMore={hasMore}
        onPageChange={loadScheduleExecutions}
        onRefresh={() => loadScheduleExecutions(currentPage)}
        emptyMessage="No Executions found."
      />
    </Card>      
  );
}