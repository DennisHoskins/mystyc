'use client';

import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import NotificationsTable from './NotificationsTable';

export default function NotificationsPage() {
  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Notifications' },
  ];
  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="View sent push notifications, message history, and delivery status for user communications"
      />

      <div className="mt-6">
        <NotificationsTable />
      </div>
    </>
  );
}
