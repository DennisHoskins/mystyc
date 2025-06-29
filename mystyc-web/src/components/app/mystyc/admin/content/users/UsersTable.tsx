'use client';

import { UserProfile } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';

interface UsersTableProps {
  label?: string,
  data: UserProfile[];
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
  onRefresh: () => void;
}

export default function UsersTable({
  label,
  data,
  loading,
  error,
  currentPage,
  totalPages,
  hasMore,
  onPageChange,
  onRetry,
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
      label={label}
      data={data}
      columns={columns}
      loading={loading}
      error={error}
      totalPages={totalPages}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={onPageChange}
      onRetry={onRetry}
      onRefresh={onRefresh}
      emptyMessage="No Users found."
    />
  );
}