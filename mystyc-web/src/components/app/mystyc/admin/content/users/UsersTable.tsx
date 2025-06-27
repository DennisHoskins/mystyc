'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { formatDateForDisplay } from '@/util/dateTime';
import { logger } from '@/util/logger';

export default function UsersTable() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const columns: Column<UserProfile>[] = [
    { key: 'uid', header: 'Id', render: (u) => u.firebaseUid },
    { key: 'email', header: 'Email' },
    { key: 'fullName', header: 'Name', render: (u) => u.fullName || 'Unnamed User' },
    { key: 'createdAt', header: 'Joined', align: 'right', render: (u) => formatDateForDisplay(u.createdAt) || '-' },
  ];

  const loadUsers = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getUsers({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setUsers(data);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load users:', err);
      setError('Failed to load users. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(0);
  }, [loadUsers]);

  return (
    <AdminTable<UserProfile>
      data={users}
      columns={columns}
      loading={loading}
      error={error}
      currentPage={currentPage}
      hasMore={hasMore}
      onPageChange={loadUsers}
      onRetry={() => loadUsers(currentPage)}
      emptyMessage="No Users found."
    />
  );
}
