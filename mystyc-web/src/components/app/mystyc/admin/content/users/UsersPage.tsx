'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces';
import { logger } from '@/util/logger';

import AdminListLayout from '@/components/app/mystyc/admin/ui/AdminListLayout';
import UsersTable from './UsersTable';

export default function UsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Users' },
  ];

  const loadUsers = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClientAdmin.getUsers({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setUsers(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
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
   <AdminListLayout
      breadcrumbs={breadcrumbs}
      title={`Users ${totalItems ? `(${totalItems})` : ''}`}
      description="Manage user accounts, permissions, and profile information"
      tableContent={
        <UsersTable 
          data={users}
          loading={loading}
          error={error}
          currentPage={currentPage}
          totalPages={totalPages}
          hasMore={hasMore}
          onPageChange={loadUsers}
          onRetry={() => loadUsers(currentPage)}
          onRefresh={() => loadUsers(currentPage)}
        />
      }
    />
  );
}