'use client';

import AdminHeader from '@/components/app/mystyc/admin/ui/AdminHeader';

export default function AdminHome() {
  const breadcrumbs = [
    { label: 'Admin' }
  ];

  return (
    <>
      <AdminHeader 
        title={"Admin"}
        description="Overview of system activity, key metrics, and quick access to administrative tasks"
      />
    </>
  );
};