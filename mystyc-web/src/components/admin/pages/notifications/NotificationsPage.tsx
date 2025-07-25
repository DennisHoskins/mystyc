'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

import { Notification } from 'mystyc-common/schemas/';
import { NotificationStats, AdminListResponse, AdminStatsResponseWithQuery } from 'mystyc-common/admin/interfaces';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { logger } from '@/util/logger';
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
  
  const { setBusy, isBusy } = useBusy();
  const [stats, setStats] = useState<AdminStatsResponseWithQuery<NotificationStats> | null>(null);
  const [data, setData] = useState<AdminListResponse<Notification> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

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

  const handleClick = (view: NotificationView) => {
    if (view === 'summary') {
      router.push(pathname);
      return;
    }
    const newUrl = `${pathname}?${view}`;
    router.push(newUrl);
  };

  const loadData = useCallback(async () => {
    try {
      setError(null);
      setBusy(1000);

      const statsQuery = apiClientAdmin.getDefaultStatsQuery();
      const stats = await apiClientAdmin.notifications.getStats(statsQuery);

      setStats(stats);
    } catch (err) {
      logger.error('Failed to load notification data:', err);
      setError('Failed to load notification data. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [setBusy]);

  const loadNotifications = useCallback(async (page: number) => {
    try {
      if (!showNotificationTable) {
        return;
      }

      setError(null);
      setBusy(1000);

      const listQuery = apiClientAdmin.getDefaultListQuery(page);
      let response: AdminListResponse<Notification>;
      
      switch (currentView) {
        default:
          response = await apiClientAdmin.notifications.getNotifications(listQuery);
          break;
      }

      setData(response);
      setCurrentPage(page);
    } catch (err) {
      logger.error('Failed to load notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setBusy(false);
    }
  }, [showNotificationTable, setBusy, currentView]);

  useEffect(() => {
    if (currentView == 'scheduled' || currentView == 'user' || currentView == 'broadcast' || currentView == 'all') loadNotifications(0);
    else loadData();
  }, [loadData, loadNotifications, currentView]);

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
                loading = {isBusy}
                data={data?.data}
                currentPage={currentPage}
                pagination={data?.pagination}
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