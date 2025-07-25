'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Notification } from 'mystyc-common/schemas/';
import { NotificationStats } from 'mystyc-common/admin/interfaces/stats';
import { AdminListResponse } from 'mystyc-common/admin/interfaces/responses/';
import { AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces/responses/admin-stats-response.interface';

import { useAdmin } from '@/hooks/admin/useAdmin';
import { logger } from '@/util/logger';
import { getDefaultDashboardStatsQuery } from '../../AdminHome';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import NotificationIcon from '@/components/admin/ui/icons/NotificationIcon';
import AdminListLayout from '@/components/admin/ui/AdminListLayout';
import NotificationsBreadcrumbs from './NotificationsBreadcrumbs';
import NotificationsDashboard from './NotificationsDashboard';
import NotificationsDashboardGrid from './NotificationsDashboardGrid';
import NotificationsSummaryPanel from './NotificationsSummaryPanel';
import NotificationsTable from './NotificationsTable';

export type NotificationView = 'summary' | 'all' | 'scheduled' | 'user' | 'broadcast';

export default function NotificationsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { admin }  = useAdmin();
  
  const { setBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<NotificationStats> | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const LIMIT = 20;

  // Determine current view from URL
  const getCurrentView = (): NotificationView => {
    if (searchParams.has('all')) return 'all';
    if (searchParams.has('scheduled')) return 'scheduled';
    if (searchParams.has('user')) return 'user';
    if (searchParams.has('broadcast')) return 'broadcast';
    return 'summary';
  };

  const currentView = getCurrentView();
  const breadcrumbs = NotificationsBreadcrumbs({ currentView, onClick: () => { router.push("notifications"); }});
  const showNotificationTable = currentView !== 'summary';

  // Change URL without page reload
  const handleClick = (view: NotificationView) => {
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    
    // For query params without values, manually construct
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = getDefaultDashboardStatsQuery();
      const stats = await admin.notifications.getStats(statsQuery);

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load notification data:', err);
      setError('Failed to load notification data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy, admin.notifications]);

  const loadNotifications = useCallback(async (page: number) => {
    try {
      if (!showNotificationTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const query = {
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'sentAt',
        sortOrder: 'desc',
      } as const;

      let response: AdminListResponse<Notification>;
      
      switch (currentView) {
        case 'scheduled':
          response = await admin.notifications.getNotifications("scheduled", query);
          break;
        case 'user':
          response = await admin.notifications.getNotifications("user", query);
          break;
        case 'broadcast':
          response = await admin.notifications.getNotifications("broadcast", query);
          break;
        case 'all':
          response = await admin.notifications.getNotifications("all", query);
          break;
        default:
          return;
      }

      setNotifications(response.data);
      setHasMore(response.pagination.hasMore === true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showNotificationTable, setBusy, currentView, admin.notifications]);

  // Reload data when view changes
  useEffect(() => {
    if (currentView == 'scheduled' || currentView == 'user' || currentView == 'broadcast' || currentView == 'all') loadNotifications(0);
    else loadData();
  }, [loadData, loadNotifications, currentView, admin.notifications]);

  // Load stats on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
   <AdminListLayout
      error={error}
      onRetry={loadData}
      breadcrumbs={breadcrumbs}
      icon={NotificationIcon}
      description="View sent push notifications, message history, and delivery status for user communications"
      headerContent={
        <NotificationsSummaryPanel 
          stats={stats}
          handleClick={handleClick}
          currentView={currentView}
        />
      }
      sideContent={
        <NotificationsDashboard 
          stats={stats} 
          charts={['stats']}
        />
      }
      itemContent={showNotificationTable == false && <NotificationsDashboardGrid stats={stats} />}
      tableContent={
        <>
          {showNotificationTable ?
            (
              <NotificationsTable
                loading = {admin.notifications.state.loading}
                data={notifications}
                currentPage={currentPage}
                totalPages={totalPages}
                hasMore={hasMore}
                onPageChange={() => loadNotifications(currentPage)}
                onRefresh={() => loadNotifications(0)}
                hideUserColumn={currentView === 'user'}
              />
            ) : (
              <div className='flex-1 flex'>
                <NotificationsDashboard 
                  key={'platforms'}
                  stats={stats} 
                  charts={['platforms']}
                />
              </div>
            )
          }
        </>
      }
    />
  );
}