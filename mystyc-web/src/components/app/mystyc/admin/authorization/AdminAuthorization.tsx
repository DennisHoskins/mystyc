'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';

export default function AdminAuthorization() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Authorization' }
  ];

  return (
    <>
      <AdminHeader 
        breadcrumbs={breadcrumbs}
        description="Track user login and logout events, monitor authentication patterns, and review access history"
      />
    </>
  );
};