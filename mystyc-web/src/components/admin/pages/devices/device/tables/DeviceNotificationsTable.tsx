// 'use client'

// import { useEffect, useCallback, useState } from 'react';

// import { Notification } from 'mystyc-common/schemas';
// import { Pagination } from 'mystyc-common/admin';
// import { getDefaultListQuery } from '@/util/admin/getQuery';
// import { getDeviceNotifications } from '@/server/actions/admin/devices';
// import { getDeviceInfo } from '@/util/getDeviceInfo';
// import { logger } from '@/util/logger';
// import { useBusy } from '@/components/ui/context/AppContext';
// import NotificationsTable from '@/components/admin/pages/notifications/NotificationsTable';
// import AdminErrorPage from '@/components/admin/ui/AdminError';

// interface DeviceNotificationsTableProps {
//   deviceId?: string | null;
//   isActive?: boolean;
// }

// export default function DeviceNotifications({ deviceId, isActive = false }: DeviceNotificationsTableProps) {
//   const { setBusy, isBusy } = useBusy();
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const [pagination, setPagination] = useState<Pagination | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [currentPage, setCurrentPage] = useState(0);
//   const [hasLoaded, setHasLoaded] = useState(false);

//   const loadDeviceNotifications = useCallback(async (page: number) => {
//     try {
//       if (!deviceId) {
//         return;
//       }

//       setBusy(1000);
//       setError(null);

//       const listQuery = getDefaultListQuery(page);
//       const response = await getDeviceNotifications({deviceInfo: getDeviceInfo(), deviceId, ...listQuery});

//       setNotifications(response.data);
//       setPagination(response.pagination);
//       setCurrentPage(page);
//       setHasLoaded(true);
//     } catch (err) {
//       logger.error('Failed to load notifications:', err);
//       setError('Failed to load notifications. Please try again.');
//     } finally {
//       setBusy(false);
//     }
//   }, [deviceId, setBusy]);

//   useEffect(() => {
//     if (isActive && !hasLoaded) {
//       loadDeviceNotifications(0);
//     }
//   }, [isActive, hasLoaded, loadDeviceNotifications]);

//   if (error) {
//     return (
//       <AdminErrorPage
//         title='Unable to load device notifications'
//         error={error}
//         onRetry={() => loadDeviceNotifications(0)}
//       />
//     )
//   }

//   return (
//     <NotificationsTable
//       data={notifications}
//       pagination={pagination}
//       loading={isBusy || !hasLoaded}
//       currentPage={currentPage}
//       onPageChange={loadDeviceNotifications}
//       onRefresh={() => loadDeviceNotifications(currentPage)}
//     />
//   );
// }