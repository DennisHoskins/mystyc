'use client';

import { useEffect, useCallback, useState } from 'react';

import { apiClientAdmin, PaginatedResponse } from '@/api/apiClientAdmin';
import { formatDateForDisplay } from '@/util/dateTime';
import { Notification } from '@/interfaces';
import { logger } from '@/util/logger';

import Card from '@/components/ui/Card';
import AdminTable, { Column } from '@/components/mystyc/admin/ui/AdminTable';

export default function ScheduleExecutionsNotificationsTable({ executionId, isActive }: { executionId: string | null | undefined, isActive?: boolean }) {
  const [notifications, setNotifications] = useState<PaginatedResponse<Notification> | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadScheduleExecutionNotifications = useCallback(async (page: number) => {
    if (!executionId) {
      return;
    }
    try {
      setLoading(true);

      const response = await apiClientAdmin.getScheduleExecutionNotifications(
        executionId, 
        {
          limit: LIMIT,
          offset: page * LIMIT,
          sortBy: 'clientTimestamp',
          sortOrder: 'desc',
        }        
      );
      setNotifications(response);

      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalItems(response.pagination.totalItems);
      setTotalPages(response.pagination.totalPages);
      setHasLoaded(true);
    } catch (err) {
      logger.error('Failed to load schedule execution notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [executionId]);

  useEffect(() => {
    if (!executionId) {
      return;
    }

    if (isActive && !hasLoaded) {
      loadScheduleExecutionNotifications(0);
    }
  }, [executionId, loadScheduleExecutionNotifications, isActive, hasLoaded]);

  if (!notifications?.data) {
    return null;
  }

  const columns: Column<Notification>[] = [
    { key: 'sent', header: 'Sent', link: (u) => `/admin/notifications/${u._id}`, render: (u) => formatDateForDisplay(u.sentAt) + " UDT" || '-' },
    { key: 'title', header: 'Title', link: (u) => `/admin/notifications/${u._id}` },
    { key: 'device', header: 'Device', link: (u) => `/admin/devices/${u.deviceId}`, render: (u) => u.deviceName || "Unknown Device" },
    { key: 'user', header: 'User', link: (u) => `/admin/users/${u.firebaseUid}`, render: (u) => u.firebaseUid || "Unknown User" },
  ];

  return (
    <Card className='h-[56rem]'>
      <AdminTable<Notification>
        data={notifications.data}
        columns={columns}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        hasMore={hasMore}
        onPageChange={loadScheduleExecutionNotifications}
        onRefresh={() => loadScheduleExecutionNotifications(currentPage)}
        emptyMessage="No Notifications found."
      />
    </Card>      
  );
}