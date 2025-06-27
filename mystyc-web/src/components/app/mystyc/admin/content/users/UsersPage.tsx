'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import UsersTable from './UsersTable';

export default function UsersPage() {

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Users' },
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="Manage user accounts, permissions, and profile information"
      />

      <div className="mt-6">
        <UsersTable />
      </div>
    </>
  );
}
