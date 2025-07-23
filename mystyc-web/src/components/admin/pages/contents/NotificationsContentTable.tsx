'use client';

import { useState, useEffect, useCallback } from 'react';

import { Content } from 'mystyc-common/schemas';

import { apiClientAdmin } from '@/api/admin/apiClientAdmin';
import { formatDateForDisplay } from '@/util/dateTime';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import { useBusy } from '@/components/ui/layout/context/AppContext';
import AdminError from '@/components/admin/ui/AdminError';
import AdminTable, { Column } from '@/components/admin/ui/AdminTable';

export default function NotificationsContentTable({ isActive = false } : { isActive: boolean }) {
  const { handleSessionError } = useSessionErrorHandler();
  const { setBusy } = useBusy();
  const [content, setContent] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const LIMIT = 20;

  const loadNotificationsContent = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.content.getNotificationsContents({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setContent(response.data);
      setHasMore(response.pagination.hasMore == true);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setHasLoaded(true);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to load notificaions content:', err);
        setError('Failed to load notificaions content. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);


  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadNotificationsContent(0);
    }
  }, [isActive, hasLoaded, loadNotificationsContent]);

  // Show loading state if tab is active but hasn't loaded yet
  if (isActive && !hasLoaded && !loading) {
    return null;
  }

  // Don't render anything if tab isn't active and hasn't loaded
  if (!isActive && !hasLoaded) {
    return null;
  }

  if (error) {
    return (
        <AdminError 
          title={"Unable to load notificaions content"}
          error={error} 
          onRetry={() => loadNotificationsContent(0)}
        />
    )
  }

  const columns: Column<Content>[] = [
    { key: 'date', header: 'Created', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{formatDateForDisplay(u.generatedAt)}</span>
          : formatDateForDisplay(u.generatedAt)},
    { key: 'status', header: 'Status', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
        u.error
          ? <span className="text-red-500">{u.status}</span>
          : u.status},
    { key: 'title', header: 'Title', link: (u) => `/admin/content/${u._id}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{u.title}</span>
          : u.title},
    { key: 'cost', header: 'Cost', link: (u) => `/admin/content/${u._id}`, align: "right",
      render: (u) =>
          u.error
          ? <span className="text-red-500">${u.openAIData?.cost}</span>
          : "$" + u.openAIData?.cost},
    { key: 'notification', header: 'Notification', link: (u) => `/admin/notifications/${u.notificationId}`, 
      render: (u) =>
          u.error
          ? <span className="text-red-500">{u.notificationId}</span>
          : u.notificationId},
  ];

  return (
    <AdminTable<Content>
      data={content}
      columns={columns}
      loading={loading}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      hasMore={hasMore}
      onPageChange={loadNotificationsContent}
      onRefresh={() => loadNotificationsContent(0)}
      emptyMessage="No Notifications Content found."
    />
  );
}