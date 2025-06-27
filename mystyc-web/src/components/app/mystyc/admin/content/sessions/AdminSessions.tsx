'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';

export default function AdminSessions() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Sessions' }
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="View active user sessions, monitor login activity, and manage session security settings"
      />
    </>
  );
};