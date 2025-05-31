'use client';

import { useEffect, useState, useCallback } from 'react';
import { ColumnDef } from '@tanstack/react-table';

import { useAuth } from '@/components/context/AuthContext';
import { withAdminAuth } from '@/auth/withAdminAuth';
import { apiClientAdmin } from '@/api/apiClientAdmin';
import { AuthEventData } from '@/interfaces/authEventData.interface';
import { useBusy } from '@/components/context/BusyContext';
import { useErrorHandler } from '@/hooks/useErrorHandler';

import PageContainer from '@/components/layout/PageContainer';
import AdminHeader from '@/components/admin/AdminHeader';
import AdminTable from '@/components/admin/AdminTable';
import TableCellLink from '@/components/ui/table/TableCellLink';

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
 }, [idToken, setBusy]);

  const columns: ColumnDef<AuthEventData>[] = [
    {
      id: 'summary',
      header: 'Summary',
      cell: ({ row }) => {
        const { clientTimestamp, type, deviceId, platform } = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium text-sm">{type}</div>
            <div className="text-gray-700 text-xs">
              {new Date(clientTimestamp).toLocaleString()}
            </div>
            <div className="text-gray-500 text-xs">
              {platform || 'Unknown platform'}
            </div>
            <div className="text-xs">
              <TableCellLink value="Device" prefix="/admin/device" />
            </div>
          </div>
        );
      },
      meta: { className: 'sm:hidden' },
    },
    {
      accessorKey: 'clientTimestamp',
      header: 'Time',
      cell: ({ getValue }) => new Date(getValue() as string).toLocaleString(),
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
   <PageContainer>
     <AdminHeader title="Auth Events" subtitle="Recent authentication activity logs" />
     <div className="mt-4 w-full">
       <AdminTable
         data={events}
         columns={columns}
         loading={loading}
         error={error}
         onRefresh={async () => {
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
         }}
       />
     </div>
   </PageContainer>
 );
}

export default withAdminAuth(AuthEventsPage);