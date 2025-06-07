'use client';

import { ColumnDef } from '@tanstack/react-table';
import { Notification } from '@/interfaces/notification.interface';

import AdminTable from './AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

interface TableNotificationsProps {
  notifications: Notification[];
  loading: boolean;
  error?: string | null;
  onRefresh?: () => void;
  compact?: boolean;
}

export default function TableNotifications({ 
  notifications, 
  loading, 
  error, 
  onRefresh,
  compact = false
}: TableNotificationsProps) {
  const columns: ColumnDef<Notification>[] = [
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }) => {
        const { _id, title, body, type, status, createdAt, firebaseUid, deviceId } = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">
              {_id ? (
                <TableCellLink value={_id} prefix="/admin/notification">
                  {title}
                </TableCellLink>
              ) : (
                title
              )}
            </div>
            <div className="text-gray-700 text-xs">
              {body.length > 50 ? `${body.substring(0, 50)}...` : body}
            </div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                status === 'sent' 
                  ? 'bg-green-100 text-green-800' 
                  : status === 'failed'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {status}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                type === 'test' 
                  ? 'bg-blue-100 text-blue-800' 
                  : type === 'admin'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {type}
              </span>
            </div>
            <div className="text-gray-500 text-xs">
              <div>{new Date(createdAt || '').toLocaleDateString()}</div>
              <div>{new Date(createdAt || '').toLocaleTimeString()}</div>
            </div>
            {deviceId && (
              <div className="text-sm">
                Device: <TableCellLink value={deviceId} prefix="/admin/device" />
              </div>
            )}
            <div className="text-sm">
              User: <TableCellLink value={firebaseUid} prefix="/admin/user" />
            </div>
            {row.original.fcmToken && (
              <div className="text-gray-500 text-xs">
                Token: {row.original.fcmToken.substring(0, 5)}...
              </div>
            )}
          </div>
        );
      },
      meta: { className: 'sm:hidden' },
    },
    {
      accessorKey: 'createdAt',
      header: 'Time',
      cell: ({ getValue, row }) => {
        const timestamp = getValue() as string;
        const { _id } = row.original;
        return _id ? (
          <TableCellLink value={_id} prefix="/admin/notification">
            <div>{new Date(timestamp).toLocaleDateString()}</div>
            <div>{new Date(timestamp).toLocaleTimeString()}</div>
          </TableCellLink>
        ) : (
          <div>
            <div>{new Date(timestamp).toLocaleDateString()}</div>
            <div>{new Date(timestamp).toLocaleTimeString()}</div>
          </div>
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ getValue, row }) => {
        const title = getValue() as string;
        const { _id } = row.original;
        return _id ? (
          <TableCellLink value={_id} prefix="/admin/notification">
            {title}
          </TableCellLink>
        ) : (
          title
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'type',
      header: 'Type',
      cell: ({ getValue }) => {
        const type = getValue() as string;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            type === 'test' 
              ? 'bg-blue-100 text-blue-800' 
              : type === 'admin'
              ? 'bg-purple-100 text-purple-800'
              : 'bg-orange-100 text-orange-800'
          }`}>
            {type}
          </span>
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ getValue }) => {
        const status = getValue() as string;
        return (
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            status === 'sent' 
              ? 'bg-green-100 text-green-800' 
              : status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {status}
          </span>
        );
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'firebaseUid',
      header: 'User',
      cell: ({ getValue }) => {
        const uid = getValue() as string;
        const displayText = uid.length > 8 ? `${uid.substring(0, 8)}...` : uid;
        return <TableCellLink value={uid} prefix="/admin/user">{displayText}</TableCellLink>;
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'deviceId',
      header: 'Device',
      cell: ({ getValue }) => {
        const deviceId = getValue() as string;
        if (!deviceId) return '—';
        
        const dashIndex = deviceId.indexOf('-');
        const displayText = dashIndex !== -1 
          ? `${deviceId.substring(0, dashIndex + 2)}...`
          : deviceId.length > 8 ? `${deviceId.substring(0, 8)}...` : deviceId;
        
        return <TableCellLink value={deviceId} prefix="/admin/device">{displayText}</TableCellLink>;
      },
      meta: { className: 'hidden sm:table-cell' },
    },
    {
      accessorKey: 'fcmToken',
      header: 'FCM Token',
      cell: ({ getValue }) => {
        const fcmToken = getValue() as string;
        return fcmToken ? `${fcmToken.substring(0, 5)}...` : '—';
      },
      meta: { className: 'hidden sm:table-cell' },
    },
  ];

  return (
    <AdminTable
      data={notifications}
      columns={columns}
      loading={loading}
      error={error}
      onRefresh={onRefresh}
      compact={compact}
    />
  );
}