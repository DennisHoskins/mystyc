'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import SessionsTable from './SessionsTable';
import SessionsDevicesTable from './SessionsDevicesTable';

export default function SessionsPage() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' },
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="View active user sessions and devices, monitor login activity, and manage session security settings"
      />

      <div className="mt-6">
        <SessionsTable />
      </div>

      <div className="mt-6">
        <SessionsDevicesTable />
      </div>
    </>
  );
}
