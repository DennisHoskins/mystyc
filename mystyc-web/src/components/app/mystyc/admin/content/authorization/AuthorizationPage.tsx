'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import AuthorizationTable from './AuthorizationTable';

export default function AuthorizationPage() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices' },
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="Track user login and logout events, monitor authentication patterns, and review access history"
      />

      <div className="mt-6">
        <AuthorizationTable />
      </div>
    </>
  );
}
