'use client';

import { UserProfile } from 'mystyc-common/schemas/user-profile.schema';

import { formatDateForDisplay } from '@/util/dateTime';

import { IconComponent } from '@/components/ui/icons/Icon';
import AdminTable, { Column } from '@/components/admin/ui/table/AdminTable';

interface UsersTableProps {
  icon?: IconComponent,
  label?: string,
  data: UserProfile[];
  loading?: boolean;
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
  hideSubscriptionColumn?: boolean;
}

export default function UsersTable({
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
  hideSubscriptionColumn = false
}: UsersTableProps) {
  const baseColumns: Column<UserProfile>[] = [
    { key: 'email', header: 'Email', link: (u) => `/admin/users/${u.firebaseUid}` },
    { key: 'uid', header: 'Id', link: (u) => `/admin/users/${u.firebaseUid}`, render: (u) => u.firebaseUid.substring(0, 15) + '...' },
    { key: 'fullName', header: 'Name', render: (u) => u.fullName || 'Unnamed User' },
    { key: 'createdAt', header: 'Joined', align: 'right', render: (u) => formatDateForDisplay(u.createdAt) || '-' },
  ];

  const subscriptionColumn: Column<UserProfile> = { key: 'subscription', header: 'Subscription', align: 'center', render: (u) => u.subscription.level };

  const columns = hideSubscriptionColumn == true
    ? baseColumns 
    : [
        ...baseColumns.slice(0, -1),
        subscriptionColumn,
        baseColumns[baseColumns.length - 1]
      ];

  return (
    <AdminTable<UserProfile>
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
      emptyMessage="No Users found."
    />
  );
}