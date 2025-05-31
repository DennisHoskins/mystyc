'use client';

import { useEffect, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { DeviceData } from '@/interfaces/deviceData.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTable from '@/components/admin/AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

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
  }, [idToken, setBusy]);

  const columns: ColumnDef<DeviceData>[] = [
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }) => {
        const { deviceId, platform, appVersion } = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">
              <TableCellLink value={deviceId} prefix="/admin/device" />
            </div>
            <div className="text-gray-700 text-sm">{platform}</div>
            <div className="text-gray-500 text-xs">
              {appVersion || 'No version'}
            </div>
          </div>
        );
      },
      meta: { className: 'sm:hidden' },
    },
    {
      accessorKey: 'deviceId',
      header: 'Device ID',
      cell: ({ getValue }) => {
        const id = getValue() as string;
        return <TableCellLink value={id} prefix="/admin/device" />;
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'timezone',
      header: 'Timezone',
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'language',
      header: 'Language',
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'appVersion',
      header: 'App Version',
      cell: ({ getValue }) => getValue() || '—',
      meta: { className: 'hidden sm:table-cell' },
    },
  ];

  return (
    <PageContainer>
      <AdminHeader title="Devices" subtitle="All registered devices in the system" />
      <div className="mt-4 w-full">
        <AdminTable
          data={devices}
          columns={columns}
          loading={loading}
          error={error}
          onRefresh={async () => {
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
          }}
        />
      </div>
    </PageContainer>
  );
});