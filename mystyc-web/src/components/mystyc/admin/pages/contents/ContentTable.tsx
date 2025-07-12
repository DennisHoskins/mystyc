'use client';

import { AlarmClockCheck, Bell, User } from 'lucide-react';

import { Content } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/mystyc/admin/ui/AdminTable';
import { IconComponent } from '@/components/ui/icons/Icon';

interface ContentTableProps {
  icon?: IconComponent,
  label?: string,
  data: Content[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function ContentTable({
  icon,
  label,
  data,
  loading,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRefresh
}: ContentTableProps) {
  const columns: Column<Content>[] = [
    { key: 'date', header: 'Created', link: (u) => `/admin/content/${u._id}`, render: (u) => formatDateForDisplay(u.date) || '-' },
    { key: 'title', header: 'Title', link: (u) => `/admin/content/${u._id}` },
    { 
      key: 'source', 
      header: 'Source', 
      link: (u) => 
        u.executionId ? `/admin/schedule-execution/${u.executionId}` :
        u.notificationId ? `/admin/notifications/${u.notificationId}` :
        u.firebaseUid ? `/admin/users/${u.firebaseUid}` :
        null,
      align: 'center', 
      icon: (u) => 
        u.executionId ? AlarmClockCheck :
        u.notificationId ? Bell :
        u.firebaseUid ? User :
        null
    },
  ];

  return (
    <AdminTable<Content>
      icon={icon}
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRefresh={onRefresh}
      emptyMessage="No Content found."
    />
  );
}