'use client';

import { UserProfile } from '@/interfaces';
import { formatDateForDisplay } from '@/util/dateTime';

import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { IconComponent } from '@/components/ui/icons/Icon';

interface UsersTableProps {
  icon?: IconComponent,
  label?: string,
  data: UserProfile[];
  loading: boolean;
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRefresh: () => void;
}

export default function UsersTable({
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
}: UsersTableProps) {
  const columns: Column<UserProfile>[] = [
    { key: 'email', header: 'Email', link: (u) => `/admin/users/${u.firebaseUid}` },
    { key: 'uid', header: 'Id', link: (u) => `/admin/users/${u.firebaseUid}`, render: (u) => u.firebaseUid.substring(0, 15) + '...' },
    { key: 'fullName', header: 'Name', render: (u) => u.fullName || 'Unnamed User' },
    { key: 'createdAt', header: 'Joined', align: 'right', render: (u) => formatDateForDisplay(u.createdAt) || '-' },
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