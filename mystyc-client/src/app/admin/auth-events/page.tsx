'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEventData } from '@/interfaces/authEventData.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import TableAuthEvents from '@/components/admin/tables/AdminTableAuthEvents';

function AuthEventsPage() {
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const [events, setEvents] = useState<AuthEventData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function doFetch() {
      if (!idToken) return;

      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        const data = await apiClientAdmin.getAuthEvents(idToken);
        setEvents(data);
      } catch (err: any) {
        handleError(err);
        setBusy(false);
        setError(err.message || 'Failed to load auth events');
      } finally {
        setLoading(false);
        setBusy(false);
      }
    }

    doFetch();
  }, [idToken, setBusy, handleError]);

  const handleRefresh = async () => {
    if (!idToken) return;
    setBusy(true);
    setLoading(true);
    setError(null);
    try {
      const data = await apiClientAdmin.getAuthEvents(idToken);
      setEvents(data);
    } catch (err: any) {
      handleError(err);
      setError(err.message || 'Failed to load auth events');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <AdminBreadcrumbs />
      
      <AdminHeader title="Auth Events" subtitle="Recent authentication activity logs" />
      
      <div className="mt-4 w-full">
        <TableAuthEvents
          events={events}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </PageContainer>
  );
}

export default withAdminAuth(AuthEventsPage);