// mystyc-client/src/components/admin/tables/TableUsers.tsx
'use client';

import { UserProfile as User } from '@/interfaces/userProfile.interface';
import AdminTable from './AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

interface TableUsersProps {
  users: User[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function TableUsers({ 
  users, 
  loading, 
  error, 
  onRefresh 
}: TableUsersProps) {
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
    <AdminTable
      data={users}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    />
  );
}