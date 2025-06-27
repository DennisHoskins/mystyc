'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';

export default function AdminHome() {
  const breadcrumbs = [
    { label: 'Admin' }
  ];

  return (
    <>
      <AdminHeader 
        breadcrumbs={breadcrumbs}
        description="Overview of system activity, key metrics, and quick access to administrative tasks"
      />
    </>
  );
};