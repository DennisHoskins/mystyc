'use client';

import { UserProfile } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';

interface UsersTableProps {
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
    { key: 'email', header: 'Email', link: (u) => `/admin/users/${u.id}` },
    { key: 'uid', header: 'Id', link: (u) => `/admin/users/${u.id}`, render: (u) => u.id.substring(0, 15) + '...' },
    { key: 'fullName', header: 'Name', render: (u) => u.fullName || 'Unnamed User' },
    { key: 'createdAt', header: 'Joined', align: 'right', render: (u) => formatDateForDisplay(u.createdAt) || '-' },
  ];

  return (
    <AdminTable<UserProfile>
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