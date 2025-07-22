'use client';

import { AlarmClockCheck, Megaphone, User } from 'lucide-react';

import { Notification } from 'mystyc-common/schemas';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/admin/ui/AdminTable';

interface NotificationsTableProps {
  label?: string;
  data: Notification[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideUserColumn?: boolean;
}

export default function NotificationsTable({
  label,
  data,
  loading,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRefresh,
  hideUserColumn = false
}: NotificationsTableProps) {
  const baseColumns: Column<Notification>[] = [
    { key: 'event', header: 'Event', link: (e) => `/admin/notifications/${e._id}`, render: (e) => e.type || 'Unknown' },
    { key: 'deviceName', header: 'Device', link: (e) => `/admin/devices/${e.deviceId}`, render: (e) => e.deviceName || 'Unknown' },
    { key: 'message', header: 'Message', render: (e) => e.title || 'Unknown' },
    { key: 'sentAt', header: 'Sent', align: 'right', link: (e) => `/admin/notifications/${e._id}`, render: (e) => formatDateForDisplay(e.sentAt) || '-' },
    { 
      key: 'source', 
      header: 'Source', 
      link: (u) => 
        u.executionId ? `/admin/schedule-execution/${u.executionId}` :
        u.firebaseUid  ? `/admin/users/${u.firebaseUid}` :
        null,
      align: 'center', 
      icon: (u) => 
        u.executionId ? AlarmClockCheck :
        u.firebaseUid && u.type == 'broadcast' ? Megaphone :
        u.firebaseUid  ? User :
        null
    },
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
      currentPage={currentPage}
      totalPages={totalPages}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Notifications found."
    />
  );
}