'use client';

import { ColumnDef } from '@tanstack/react-table';
import { AuthEventData } from '@/interfaces/authEventData.interface';

import AdminTable from './AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

interface TableAuthEventsProps {
  events: AuthEventData[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function TableAuthEvents({ 
  events, 
  loading, 
  error, 
  onRefresh 
}: TableAuthEventsProps) {
  const columns: ColumnDef<AuthEventData>[] = [
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }) => {
        const { _id, clientTimestamp, type, deviceId, platform, firebaseUid } = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">
              {_id ? (
                <TableCellLink value={_id} prefix="/admin/auth-event">
                  {type}
                </TableCellLink>
              ) : (
                type
              )}
            </div>
            <div className="text-gray-700 text-xs">
              {_id ? (
                <TableCellLink value={_id} prefix="/admin/auth-event">
                  {new Date(clientTimestamp).toLocaleString()}
                </TableCellLink>
              ) : (
                new Date(clientTimestamp).toLocaleString()
              )}
            </div>
            <div className="text-gray-500 text-xs">
              {platform || 'Unknown platform'}
            </div>
            <div className="text-sm">
              Device: <TableCellLink value={deviceId} prefix="/admin/device" />
            </div>
            <div className="text-sm">
              User: <TableCellLink value={firebaseUid} prefix="/admin/user" />
            </div>
          </div>
        );
      },
      meta: { className: 'sm:hidden' },
    },
    {
      accessorKey: 'clientTimestamp',
      header: 'Time',
      cell: ({ getValue, row }) => {
        const timestamp = getValue() as string;
        const { _id } = row.original;
        return _id ? (
          <TableCellLink value={_id} prefix="/admin/auth-event">
            {new Date(timestamp).toLocaleString()}
          </TableCellLink>
        ) : (
          new Date(timestamp).toLocaleString()
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'firebaseUid',
      header: 'User ID',
      cell: ({ getValue }) => {
        const uid = getValue() as string;
        return <TableCellLink value={uid} prefix="/admin/user" />;
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'deviceId',
      header: 'Device ID',
      cell: ({ getValue }) => {
        const dId = getValue() as string;
        return <TableCellLink value={dId} prefix="/admin/device" />;
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'type',
      header: 'Action',
      cell: ({ getValue, row }) => {
        const type = getValue() as string;
        const { _id } = row.original;
        return _id ? (
          <TableCellLink value={_id} prefix="/admin/auth-event">
            {type}
          </TableCellLink>
        ) : (
          type
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'ip',
      header: 'IP Address',
      cell: ({ getValue }) => getValue() || '—',
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'platform',
      header: 'Platform',
      cell: ({ getValue }) => getValue() || '—',
      meta: { className: 'hidden sm:table-cell' },
    },
  ];

  return (
    <AdminTable
      data={events}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
    />
  );
}