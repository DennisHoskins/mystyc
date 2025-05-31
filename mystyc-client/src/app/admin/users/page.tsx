'use client';

import { useEffect, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AdminTable } from '@/components/admin/AdminTable';
import PageContainer from '@/components/layout/PageContainer';
import Text from '@/components/ui/Text';

interface User {
  id: string;
  firebaseUid: string;
  email: string;
  fullName?: string;
  dateOfBirth?: string;
  zodiacSign?: string;
  roles: string[];
  currentDeviceId?: string;
  createdAt: string;
  updatedAt: string;
}

const columns: ColumnDef<User>[] = [
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'fullName',
    header: 'Full Name',
    cell: ({ getValue }) => getValue() || '—',
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ getValue }) => {
      const roles = getValue() as string[];
      return roles.join(', ');
    },
  },
  {
    accessorKey: 'zodiacSign',
    header: 'Zodiac',
    cell: ({ getValue }) => getValue() || '—',
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ getValue }) => {
      const date = new Date(getValue() as string);
      return date.toLocaleDateString();
    },
  },
];

function UsersPage() {
  const { idToken } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!idToken) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await apiClientAdmin.getUsers(idToken);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [idToken]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <PageContainer>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <Text variant="muted">Manage user accounts and permissions</Text>
        </div>
        
        <AdminTable
          data={users}
          columns={columns}
          loading={loading}
          error={error}
          onRefresh={fetchUsers}
          title="Users"
          description="All registered users in the system"
        />
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(UsersPage);