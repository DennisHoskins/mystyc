'use client';

import { Notification } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';

interface NotificationsTableProps {
  label?: string;
  data: Notification[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
  hideUserColumn?: boolean;
}

export default function NotificationsTable({
  label,
  data,
  loading,
  error,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRetry,
  onRefresh,
  hideUserColumn = false
}: NotificationsTableProps) {
  const baseColumns: Column<Notification>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/notifications/${e._id}`, render: (e) => e.type || 'Unknown' },
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unknown' },
    { key: 'message', header: 'Message', render: (e) => e.title || 'Unknown' },
    { key: 'sentAt', header: 'Sent', align: 'right', link: (e) => `/admin/notifications/${e._id}`, render: (e) => formatDateForDisplay(e.sentAt) || '-' },
  ];

  const userColumn: Column<Notification> = {
    key: 'userName', 
    header: 'User', 
    link: (e) => `/admin/users/${e.firebaseUid}`,
    render: (e) => e.firebaseUid || 'Unknown User'
  };

  const columns = hideUserColumn 
    ? baseColumns 
    : [
        baseColumns[0],
        userColumn,
        ...baseColumns.slice(1)
      ];


  return (
    <AdminTable<Notification>
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Notifications found."
    />
  );
}