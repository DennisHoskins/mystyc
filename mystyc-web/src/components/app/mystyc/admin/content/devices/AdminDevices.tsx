'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Device } from '@/interfaces';
import AdminHeader from '@/components/app/mystyc/admin/AdminHeader';
import AdminTable, { Column } from '@/components/app/mystyc/admin/ui/AdminTable';
import { logger } from '@/util/logger';

export default function AdminDevices() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const LIMIT = 20;

  const breadcrumbs = [
    { label: 'Admin', href: '/admin' },
    { label: 'Devices' },
  ];

  const columns: Column<Device>[] = [
    { key: 'deviceName', header: 'Name', render: (d) => d.deviceName || 'Unnamed Device' },
    { key: 'timezone', header: 'Timezone', render: (d) => d.timezone || 'Unknown' },
    { key: 'fcmToken', header: 'Fcm Token', align: 'right', render: (d) => d.fcmToken ? 'Ready' : 'Not Ready' },
  ];

  const loadDevices = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);

      const data = await apiClientAdmin.getDevices({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'createdAt',
        sortOrder: 'asc',
      });

      setDevices(data);
      setHasMore(data.length === LIMIT);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load devices:', err);
      setError('Failed to load devices. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDevices(0);
  }, [loadDevices]);

  return (
    <>
      <AdminHeader
        breadcrumbs={breadcrumbs}
        description="Monitor and control connected devices, view status device configurations"
      />

      <div className="mt-6">
        <AdminTable<Device>
          data={devices}
          columns={columns}
          loading={loading}
          error={error}
          currentPage={currentPage}
          hasMore={hasMore}
          onPageChange={loadDevices}
          onRetry={() => loadDevices(currentPage)}
          emptyMessage="No Devices found."
        />
      </div>
    </>
  );
}
