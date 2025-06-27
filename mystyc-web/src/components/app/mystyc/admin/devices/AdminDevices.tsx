'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';

export default function AdminDevices() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices' }
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="Monitor and control connected devices, view status device configurations"
      />
    </>
  );
};