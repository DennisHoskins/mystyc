'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import SessionsTable from './SessionsTable';
import SessionsDevicesTable from './SessionsDevicesTable';

export default function SessionsPage() {
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
        <SessionsTable />
      </div>

      <div className="mt-6">
        <SessionsDevicesTable />
      </div>
    </>
  );
}
