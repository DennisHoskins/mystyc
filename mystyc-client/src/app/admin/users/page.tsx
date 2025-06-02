'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile as User } from '@/interfaces/userProfile.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import TableUsers from '@/components/admin/tables/AdminTableUsers';

export default withAdminAuth(function UsersPage() {
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function doFetch() {
      if (!idToken) return;

      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        const data = await apiClientAdmin.getUsers(idToken);
        setUsers(data);
      } catch (err: any) {
        handleError(err);
        setBusy(false);
        setError(err.message || 'Failed to load users');
      } finally {
        setLoading(false);
        setBusy(false);
      }
    }

    doFetch();
  }, [idToken, setBusy, handleError]);

  const handleRefresh = async () => {
    if (!idToken) return;
    setBusy(true);
    setLoading(true);
    setError(null);
    try {
      const data = await apiClientAdmin.getUsers(idToken);
      setUsers(data);
    } catch (err: any) {
      handleError(err);
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-6">
        <AdminBreadcrumbs items={[{ label: 'Users' }]} />
        
        <AdminHeader
          title="User Management"
          subtitle="Manage user accounts and permissions"
        />

        <TableUsers
          users={users}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </PageContainer>
  );
});