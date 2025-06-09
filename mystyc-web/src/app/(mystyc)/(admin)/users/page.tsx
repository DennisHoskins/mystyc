'use client';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile } from '@/interfaces/userProfile.interface';
import { useAuth } from '@/hooks/useAuth';
import { useAdminListPage } from '@/hooks/admin/useAdminListPage';
import { AdminQuery } from '@/interfaces';

import AdminListLayout from '@/components/admin/AdminListLayout';
import TableUsers from '@/components/admin/tables/AdminTableUsers';

function UsersPage() {
  const { authToken } = useAuth();

  const { data: users, loading, error, refresh } = useAdminListPage<UserProfile>({
    entityName: 'users',
    fetcher: (authToken: string, query?: AdminQuery) => apiClientAdmin.getUsers(authToken, query),
  });

  if (!authToken) {
    return;
  }

  return (
    <AdminListLayout
      breadcrumbLabel="Users"
      title="User Management"
      subtitle="Manage user accounts and permissions"
    >
      <TableUsers
        users={users}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </AdminListLayout>
  );
}

export default UsersPage;