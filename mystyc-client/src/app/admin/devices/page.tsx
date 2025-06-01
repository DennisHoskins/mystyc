'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DeviceData } from '@/interfaces/deviceData.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminBreadcrumbs from '@/components/admin/AdminBreadcrumbs';
import TableDevices from '@/components/admin/tables/TableDevices';

export default withAdminAuth(function DevicesPage() {
  const { idToken } = useAuth();
  const { setBusy } = useBusy();
  const { handleError } = useErrorHandler();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function doFetch() {
      if (!idToken) return;

      setBusy(true);
      setLoading(true);
      setError(null);

      try {
        const data = await apiClientAdmin.getDevices(idToken);
        setDevices(data);
      } catch (err: any) {
        handleError(err);
        setBusy(false);
        setError(err.message || 'Failed to load devices');
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
      const data = await apiClientAdmin.getDevices(idToken);
      setDevices(data);
    } catch (err: any) {
      handleError(err);
      setError(err.message || 'Failed to load devices');
    } finally {
      setLoading(false);
      setBusy(false);
    }
  };

  return (
    <PageContainer>
      <AdminBreadcrumbs />
      
      <AdminHeader title="Devices" subtitle="All registered devices in the system" />
      
      <div className="mt-4 w-full">
        <TableDevices
          devices={devices}
          loading={loading}
          error={error}
          onRefresh={handleRefresh}
        />
      </div>
    </PageContainer>
  );
});