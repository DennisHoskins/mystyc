'use client';

import { useEffect, useState, useCallback } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { UserProfile as User } from '@/interfaces/userProfile.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTable from '@/components/admin/AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

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
  }, [idToken, setBusy]);

  const columns = [
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }: any) => {
        const { email, fullName, roles, firebaseUid } = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-xs break-words">
              <TableCellLink value={firebaseUid} prefix="/admin/user" />
            </div>
            <div className="font-medium break-words">{email}</div>
            <div className="text-gray-700 break-words">{fullName || '—'}</div>
            <div className="text-gray-500 text-sm">
              {(roles || []).join(', ')}
            </div>
          </div>
        );
      },
      meta: { className: 'sm:hidden' },
    },
    {
      accessorKey: 'firebaseUid',
      header: 'Firebase UID',
      cell: ({ getValue }: any) => {
        const uid = getValue() as string;
        return <TableCellLink value={uid} prefix="/admin/user" />;
      },
      meta: { className: 'hidden sm:table-cell break-words' },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ getValue }: any) => {
        const email = getValue() as string;
        return <TableCellLink value={email} prefix="/admin/user" />;
      },
      meta: { className: 'hidden sm:table-cell break-words' },
    },
    {
      accessorKey: 'fullName',
      header: 'Full Name',
      cell: ({ getValue }: any) => <div className="break-words">{getValue() || '—'}</div>,
      meta: { className: 'hidden sm:table-cell break-words' },
    },
    {
      accessorKey: 'roles',
      header: 'Roles',
      cell: ({ getValue }: any) => <div className="text-gray-500">{(getValue() as string[]).join(', ')}</div>,
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'createdAt',
      header: 'Created',
      cell: ({ getValue }: any) => {
        const date = new Date(getValue() as Date);
        return <div className="text-sm text-gray-500">{date.toLocaleDateString()}</div>;
      },
      meta: { className: 'hidden sm:table-cell' },
    },
  ];

  return (
    <PageContainer>
      <div className="space-y-6">
        <AdminHeader
          title="User Management"
          subtitle="Manage user accounts and permissions"
        />

        <AdminTable
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          onRefresh={async () => {
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
          }}
        />
      </div>
    </PageContainer>
  );
});