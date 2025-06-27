'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';

export default function AdminUsers() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Users' }
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="Manage user accounts, permissions, and profile information"
      />
    </>
  );
};