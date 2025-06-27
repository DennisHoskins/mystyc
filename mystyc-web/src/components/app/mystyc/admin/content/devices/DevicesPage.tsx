'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import DevicesTable from './DevicesTable';

export default function DevicesPage() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices' },
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="Monitor and control connected devices, view status device configurations"
      />

      <div className="mt-6">
        <DevicesTable />
      </div>
    </>
  );
}
