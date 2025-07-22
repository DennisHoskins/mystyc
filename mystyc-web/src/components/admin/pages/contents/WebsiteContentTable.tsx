'use client';

import { useState, useEffect, useCallback } from 'react';

import { AlarmClockCheck, Globe } from 'lucide-react';

import { apiClientAdmin } from '@/api/apiClientAdmin';
import { Content } from 'mystyc-common/schemas';
import { formatDateForDisplay } from '@/util/dateTime';
import { useBusy } from '@/components/ui/layout/context/AppContext';
import { useSessionErrorHandler } from '@/hooks/useSessionErrorHandler';
import { logger } from '@/util/logger';

import AdminError from '@/components/admin/ui/AdminError';
import AdminTable, { Column } from '@/components/admin/ui/AdminTable';

export default function WebsiteContentTable({ isActive = false } : { isActive: boolean }) {
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

  const loadWebsiteContent = useCallback(async (page: number) => {
    try {
      setError(null);
      setBusy(1000);
      setLoading(true);

      const response = await apiClientAdmin.getWebsiteContents({
        limit: LIMIT,
        offset: page * LIMIT,
        sortBy: 'date',
        sortOrder: 'desc',
      });

      setContent(response.data);
      setHasMore(response.pagination.hasMore);
      setCurrentPage(page);
      setTotalPages(response.pagination.totalPages);
      setTotalItems(response.pagination.totalItems);
      setHasLoaded(true);
    } catch (err) {
      const wasSessionError = await handleSessionError(err, 'ContentsPage');
      if (!wasSessionError) {
        logger.error('Failed to load website content:', err);
        setError('Failed to load website content. Please try again.');
      }
    } finally {
      setBusy(false);
      setLoading(false);
    }
  }, [setBusy, handleSessionError]);

  // Only load when tab becomes active for the first time
  useEffect(() => {
    if (isActive && !hasLoaded) {
      loadWebsiteContent(0);
    }
  }, [isActive, hasLoaded, loadWebsiteContent]);

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
          title={"Unable to load website content"}
          error={error} 
          onRetry={() => loadWebsiteContent(0)}
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
    { key: 'execution', header: 'Source', align: "center",
      link: (u) => u.executionId 
        ? `/admin/schedule-executions/${u.executionId}`
        : null,
      render: (u) =>
          u.error
          ? <span className="text-red-500">{u.executionId ? <AlarmClockCheck /> : <Globe />}</span>
          : <span className='flex-1 flex justify-center'>{u.executionId ? <AlarmClockCheck className='w-4-h-4'/> : <Globe className='w-4-h-4 text-gray-300' />}</span>}
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
      onPageChange={loadWebsiteContent}
      onRefresh={() => loadWebsiteContent(0)}
      emptyMessage="No Website Content found."
    />
  );
}