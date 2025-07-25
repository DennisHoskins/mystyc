'use client';

import { AlarmClockCheck, Bell, Globe, Users, UserPlus } from 'lucide-react';

import { Content } from 'mystyc-common/schemas/';

import { formatDateForDisplay } from '@/util/dateTime';

import { IconComponent } from '@/components/ui/icons/Icon';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface ContentsTableProps {
  icon?: IconComponent,
  label?: string,
  data: Content[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  contentType: 'all' | 'notifications' | 'website' | 'users' | 'users-plus';
}

export default function ContentsTable({
  icon,
  label,
  data,
  loading = false,
  currentPage,
  totalPages,
  totalItems,
  hasMore,
  onPageChange,
  onRefresh,
  contentType
}: ContentsTableProps) {
  const baseColumns: Column<Content>[] = [
    { key: 'date', header: 'Created', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{formatDateForDisplay(u.generatedAt)}</span>
          : formatDateForDisplay(u.generatedAt)},
    { key: 'status', header: 'Status', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
        u.error
          ? <span className="text-red-500">{u.status}</span>
          : u.status},
    { key: 'title', header: 'Title', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{u.title}</span>
          : u.title},
    { key: 'cost', header: 'Cost', link: (u) => `/admin/content/${u._id}`, align: "right",
      render: (u) =>
          u.error
          ? <span className="text-red-500">${u.openAIData?.cost}</span>
          : "$" + (u.openAIData?.cost ? u.openAIData?.cost : "0")},
  ];

  // Specific columns for different content types
  const notificationColumn: Column<Content> = {
    key: 'notification', 
    header: 'Notification', 
    link: (u) => `/admin/notifications/${u.notificationId}`, 
    render: (u) =>
        u.error
        ? <span className="text-red-500">{u.notificationId}</span>
        : u.notificationId
  };

  const userColumn: Column<Content> = {
    key: 'user', 
    header: 'User', 
    link: (u) => `/admin/users/${u.userId}`, 
    render: (u) =>
        u.error
        ? <span className="text-red-500">{u.userId}</span>
        : u.userId
  };

  const sourceColumn: Column<Content> = {
    key: 'source', 
    header: 'Source', 
    align: 'center', 
    link: (u) => 
      u.executionId ? `/admin/schedule-execution/${u.executionId}` :
      u.notificationId ? `/admin/notifications/${u.notificationId}` :
      u.userId ? (u.type == 'user_content' ? null : `/admin/users/${u.userId}`) :
      null,
    icon: (u) => 
      u.executionId ? AlarmClockCheck :
      u.notificationId ? Bell :
      u.userId ? (u.type == 'user_content' ? Users : UserPlus) : 
      Globe
  };

  const websiteSourceColumn: Column<Content> = {
    key: 'execution', 
    header: 'Source', 
    align: "center",
    link: (u) => u.executionId 
      ? `/admin/schedule-executions/${u.executionId}`
      : null,
    render: (u) =>
        u.error
        ? <span className="text-red-500">{u.executionId ? <AlarmClockCheck /> : <Globe />}</span>
        : <span className='flex-1 flex justify-center'>{u.executionId ? <AlarmClockCheck className='w-4-h-4'/> : <Globe className='w-4-h-4 text-gray-300' />}</span>
  };

  // Build columns based on content type
  const getColumns = (): Column<Content>[] => {
    const columns = [...baseColumns];
    
    switch (contentType) {
      case 'notifications':
        // Insert notification column before cost
        columns.splice(-1, 0, notificationColumn);
        break;
      case 'website':
        // Insert website source column before cost  
        columns.splice(-1, 0, websiteSourceColumn);
        break;
      case 'users':
      case 'users-plus':
        // Insert user column before cost
        columns.splice(-1, 0, userColumn);
        break;
      case 'all':
        // Insert full source column before cost
        columns.splice(-1, 0, sourceColumn);
        break;
    }
    
    return columns;
  };

  return (
    <AdminTable<Content>
      icon={icon}
      label={label}
      data={data}
      columns={getColumns()}
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