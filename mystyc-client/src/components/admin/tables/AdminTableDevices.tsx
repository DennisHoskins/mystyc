'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Device } from '@/interfaces/device.interface';

import AdminTable from './AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

interface TableDevicesProps {
  devices: Device[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function TableDevices({ 
  devices, 
  loading, 
  error, 
  onRefresh 
}: TableDevicesProps) {
  const columns: ColumnDef<Device>[] = [
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }) => {
        const { deviceId, platform, appVersion, notificationReady } = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">
              <TableCellLink value={deviceId} prefix="/admin/device" />
            </div>
            <div className="text-gray-700 text-sm">{platform}</div>
            <div className="text-gray-500 text-xs">
              {appVersion || 'No version'}
            </div>
            <div className="text-xs">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                notificationReady 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {notificationReady ? 'Notifications Ready' : 'Not Ready'}
              </span>
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
    {
      accessorKey: 'notificationReady',
      header: 'Notifications',
      cell: ({ getValue }) => {
        const ready = getValue() as boolean;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            ready 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {ready ? 'Ready' : 'Not Ready'}
          </span>
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
  ];

  return (
    <AdminTable
      data={devices}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    />
  );
}