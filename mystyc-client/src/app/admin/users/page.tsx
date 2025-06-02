'use client';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile as User } from '@/interfaces/userProfile.interface';
import { useAdminListPage } from '@/hooks/admin/useAdminListPage';

import AdminListLayout from '@/components/admin/AdminListLayout';
import TableUsers from '@/components/admin/tables/AdminTableUsers';

function UsersPage() {
  const { data: users, loading, error, refresh } = useAdminListPage<User>({
    entityName: 'users',
    fetcher: apiClientAdmin.getUsers,
  });

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

export default withAdminAuth(UsersPage);