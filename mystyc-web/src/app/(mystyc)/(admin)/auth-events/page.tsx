'use client';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEvent } from '@/interfaces/authEvent.interface';
import { useAdminListPage } from '@/hooks/admin/useAdminListPage';
import { AdminQuery } from '@/interfaces';

import AdminListLayout from '@/components/admin/AdminListLayout';
import TableAuthEvents from '@/components/admin/tables/AdminTableAuthEvents';

function AuthEventsPage() {
  const { data: events, loading, error, refresh } = useAdminListPage<AuthEvent>({
    entityName: 'auth events',
    fetcher: (authToken: string, query?: AdminQuery) => apiClientAdmin.getAuthEvents(authToken, query),
  });

  return (
    <AdminListLayout
      breadcrumbLabel="Auth Events"
      title="Auth Events"
      subtitle="Recent authentication activity logs"
    >
      <TableAuthEvents
        events={events}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </AdminListLayout>
  );
}

export default AuthEventsPage;