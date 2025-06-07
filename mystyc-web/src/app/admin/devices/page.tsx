'use client';

import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces/device.interface';
import { useAdminListPage } from '@/hooks/admin/useAdminListPage';

import AdminListLayout from '@/components/admin/AdminListLayout';
import TableDevices from '@/components/admin/tables/AdminTableDevices';

function DevicesPage() {
  const { data: devices, loading, error, refresh } = useAdminListPage<Device>({
    entityName: 'devices',
    fetcher: apiClientAdmin.getDevices,
  });

  return (
    <AdminListLayout
      breadcrumbLabel="Devices"
      title="Devices"
      subtitle="All registered devices in the system"
    >
      <TableDevices
        devices={devices}
        loading={loading}
        error={error}
        onRefresh={refresh}
      />
    </AdminListLayout>
  );
}

export default withAdminAuth(DevicesPage);