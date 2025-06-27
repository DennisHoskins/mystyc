'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';

export default function AdminNotifications() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notifications' }
  ];

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="View sent push notifications, message history, and delivery status for user communications"  
      />
    </>
  );
};